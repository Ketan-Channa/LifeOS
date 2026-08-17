import fs from 'fs';
import path from 'path';
import prisma from '../config/prisma';

const PYTHON_AI_SERVICE_URL = process.env.PYTHON_AI_SERVICE_URL || 'http://127.0.0.1:8000';
const STORAGE_DIR = path.resolve(__dirname, '../../../storage/knowledge');

if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

export class KnowledgeService {
  /**
   * Upload and queue document processing.
   */
  static async uploadDocument(userId: string, file: any, body: any) {
    if (!file) {
      throw new Error("No document file uploaded.");
    }

    const maxSizeBytes = 10 * 1024 * 1024; // 10 MB limit
    if (file.size > maxSizeBytes) {
      fs.unlinkSync(file.path);
      throw new Error("Maximum document size is 10 MB.");
    }

    const allowedTypes = ['.pdf', '.docx', '.doc', '.txt', '.md', '.markdown'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedTypes.includes(ext)) {
      fs.unlinkSync(file.path);
      throw new Error("Unsupported file type. Supported formats: PDF, DOCX, TXT, MD.");
    }

    // Generate safe internal filename
    const safeId = `doc_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
    const safeFileName = `${safeId}${ext}`;
    const destinationPath = path.join(STORAGE_DIR, safeFileName);

    // Move file to storage directory
    fs.renameSync(file.path, destinationPath);

    const title = body.title || file.originalname;
    const category = body.category || 'General';
    const description = body.description || null;
    const tags = Array.isArray(body.tags) ? body.tags.join(',') : body.tags || null;

    // Create database record
    const document = await prisma.knowledgeDocument.create({
      data: {
        userId,
        title,
        originalFileName: file.originalname,
        fileType: ext.replace('.', '').toUpperCase(),
        fileSize: file.size,
        category,
        description,
        tags,
        storagePath: destinationPath,
        processingStatus: 'PROCESSING',
        pageCount: 1,
        wordCount: 0
      }
    });

    // Create history entry
    await prisma.knowledgeDocumentHistory.create({
      data: {
        documentId: document.id,
        userId,
        action: 'UPLOADED',
        metadata: JSON.stringify({ originalName: file.originalname, size: file.size })
      }
    });

    // Async processing call to Python RAG Microservice
    this.processDocumentAsync(document.id, userId, destinationPath, file.originalname, ext, category, description, tags);

    return document;
  }

  /**
   * Async document processing pipeline runner.
   */
  private static async processDocumentAsync(
    documentId: string,
    userId: string,
    filePath: string,
    originalFileName: string,
    fileType: string,
    category: string,
    description?: string,
    tags?: string
  ) {
    try {
      await prisma.knowledgeDocumentHistory.create({
        data: {
          documentId,
          userId,
          action: 'PROCESSING_STARTED'
        }
      });

      const payload = {
        documentId,
        userId,
        filePath,
        originalFileName,
        fileType,
        category,
        description,
        tags: tags ? tags.split(',') : []
      };

      const response = await fetch(`${PYTHON_AI_SERVICE_URL}/rag/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Python RAG service error ${response.status}`);
      }

      const result: any = await response.json();

      if (result.status === 'READY') {
        // Clear previous chunks if reprocessing
        await prisma.knowledgeChunk.deleteMany({ where: { documentId } });

        // Save chunks in Prisma
        if (result.chunks && result.chunks.length > 0) {
          const chunkData = result.chunks.map((c: any) => ({
            documentId,
            userId,
            chunkIndex: c.chunkIndex,
            content: c.content,
            tokenCount: c.tokenCount,
            metadata: JSON.stringify({ pageNumber: c.pageNumber, section: c.section, heading: c.heading })
          }));

          await prisma.knowledgeChunk.createMany({ data: chunkData });
        }

        // Update document status
        await prisma.knowledgeDocument.update({
          where: { id: documentId },
          data: {
            processingStatus: 'READY',
            pageCount: result.pageCount || 1,
            wordCount: result.wordCount || 0,
            errorMessage: null
          }
        });

        await prisma.knowledgeDocumentHistory.create({
          data: {
            documentId,
            userId,
            action: 'PROCESSING_COMPLETED',
            metadata: JSON.stringify({ pageCount: result.pageCount, wordCount: result.wordCount, chunksCount: result.chunksCount })
          }
        });
      } else {
        throw new Error(result.errorMessage || 'Document text extraction failed.');
      }
    } catch (err: any) {
      await prisma.knowledgeDocument.update({
        where: { id: documentId },
        data: {
          processingStatus: 'FAILED',
          errorMessage: err.message || 'Processing failed.'
        }
      });

      await prisma.knowledgeDocumentHistory.create({
        data: {
          documentId,
          userId,
          action: 'PROCESSING_FAILED',
          metadata: JSON.stringify({ error: err.message })
        }
      });
    }
  }

  /**
   * Get all user documents.
   */
  static async getDocuments(userId: string, filters: any = {}) {
    const where: any = { userId };
    if (filters.category && filters.category !== 'ALL') {
      where.category = filters.category;
    }
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search } },
        { description: { contains: filters.search } },
        { tags: { contains: filters.search } }
      ];
    }

    return prisma.knowledgeDocument.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { chunks: true } }
      }
    });
  }

  /**
   * Get document by ID with chunk details.
   */
  static async getDocumentById(userId: string, documentId: string) {
    const doc = await prisma.knowledgeDocument.findFirst({
      where: { id: documentId, userId },
      include: {
        chunks: { orderBy: { chunkIndex: 'asc' } },
        history: { orderBy: { timestamp: 'desc' }, take: 10 }
      }
    });

    if (!doc) throw new Error("Document not found.");
    return doc;
  }

  /**
   * Update document metadata.
   */
  static async updateDocument(userId: string, documentId: string, data: any) {
    const existing = await this.getDocumentById(userId, documentId);

    const updated = await prisma.knowledgeDocument.update({
      where: { id: existing.id },
      data: {
        title: data.title !== undefined ? data.title : existing.title,
        description: data.description !== undefined ? data.description : existing.description,
        category: data.category !== undefined ? data.category : existing.category,
        tags: Array.isArray(data.tags) ? data.tags.join(',') : data.tags !== undefined ? data.tags : existing.tags
      }
    });

    await prisma.knowledgeDocumentHistory.create({
      data: {
        documentId: existing.id,
        userId,
        action: 'UPDATED'
      }
    });

    return updated;
  }

  /**
   * Delete document, database records, vector entries, and physical file.
   */
  static async deleteDocument(userId: string, documentId: string) {
    const doc = await this.getDocumentById(userId, documentId);

    // Delete vector store entries in Python
    fetch(`${PYTHON_AI_SERVICE_URL}/rag/document/${userId}/${documentId}`, { method: 'DELETE' }).catch(() => {});

    // Delete physical file
    if (doc.storagePath && fs.existsSync(doc.storagePath)) {
      try {
        fs.unlinkSync(doc.storagePath);
      } catch (e) {}
    }

    // Delete database records
    await prisma.knowledgeDocument.delete({ where: { id: documentId } });

    return { success: true, message: `Document '${doc.title}' deleted successfully.` };
  }

  /**
   * Reprocess document.
   */
  static async reprocessDocument(userId: string, documentId: string) {
    const doc = await this.getDocumentById(userId, documentId);

    await prisma.knowledgeDocument.update({
      where: { id: documentId },
      data: { processingStatus: 'PROCESSING', errorMessage: null }
    });

    const ext = path.extname(doc.originalFileName).toLowerCase();
    this.processDocumentAsync(documentId, userId, doc.storagePath, doc.originalFileName, ext, doc.category, doc.description || undefined, doc.tags || undefined);

    return { success: true, message: "Document reprocessing started." };
  }

  /**
   * Knowledge Base statistics for dashboard.
   */
  static async getStats(userId: string) {
    const docs = await prisma.knowledgeDocument.findMany({ where: { userId } });

    const totalDocuments = docs.length;
    const totalPages = docs.reduce((acc, d) => acc + (d.pageCount || 0), 0);
    const totalWords = docs.reduce((acc, d) => acc + (d.wordCount || 0), 0);

    const categoriesSet = new Set(docs.map(d => d.category));
    const categoriesCount = categoriesSet.size;

    const totalChunks = await prisma.knowledgeChunk.count({ where: { userId } });

    const recentDocuments = docs.slice(0, 5);

    return {
      totalDocuments,
      totalPages,
      totalWords,
      totalChunks,
      categoriesCount,
      categories: Array.from(categoriesSet),
      recentDocuments
    };
  }

  /**
   * Execute semantic search over vectors.
   */
  static async search(userId: string, query: any) {
    const payload = {
      userId,
      queryText: query.queryText || query.question,
      topK: query.topK ? Number(query.topK) : 6,
      documentIds: query.documentIds || null,
      category: query.category || null
    };

    const res = await fetch(`${PYTHON_AI_SERVICE_URL}/rag/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error("Search service error");
    return res.json();
  }

  /**
   * Grounded RAG query execution.
   */
  static async query(userId: string, body: any) {
    const payload = {
      userId,
      question: body.question,
      documentIds: body.documentIds || null,
      category: body.category || null,
      topK: body.topK ? Number(body.topK) : 6
    };

    const res = await fetch(`${PYTHON_AI_SERVICE_URL}/rag/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error("RAG query service error");
    return res.json();
  }

  /**
   * Compare two documents.
   */
  static async compare(userId: string, body: any) {
    const { documentAId, documentBId } = body;
    const docA = await this.getDocumentById(userId, documentAId);
    const docB = await this.getDocumentById(userId, documentBId);

    const payload = {
      userId,
      documentAId: docA.id,
      documentATitle: docA.title,
      chunksA: docA.chunks,
      documentBId: docB.id,
      documentBTitle: docB.title,
      chunksB: docB.chunks
    };

    const res = await fetch(`${PYTHON_AI_SERVICE_URL}/rag/compare`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error("Document comparison error");
    return res.json();
  }
}
