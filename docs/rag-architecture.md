# LifeOS Phase 9 — Personal Knowledge Base & RAG Architecture

## 1. RAG Intelligence Architecture Overview

```
USER DOCUMENT (PDF, DOCX, TXT, MD)
        ↓
MULTER FILE UPLOAD & SECURITY VALIDATION (/storage/knowledge/)
        ↓
PRISMA DB RECORD (`KnowledgeDocument` state = PROCESSING)
        ↓
PYTHON RAG ENGINE (/ai-service/app/rag/)
        ↓
TEXT EXTRACTION & CLEANING (pypdf, python-docx, markdown)
        ↓
PARAGRAPH-AWARE CHUNKING (500 char blocks, 50 char overlap)
        ↓
VECTOR EMBEDDINGS (Sentence-Transformers `all-MiniLM-L6-v2`)
        ↓
VECTOR STORE INDEXING (Mandatory userId scoping & Cosine Similarity)
        ↓
PRISMA DB RECORD (`KnowledgeChunk` & state = READY)
        ↓
SEMANTIC RETRIEVAL & RERANKING (Top-K = 5-8 chunks)
        ↓
GEMINI GROUNDED REASONING & SOURCE CITATIONS
        ↓
FRONTEND KNOWLEDGE WORKSPACE (/knowledge & SCOUT AI)
```

---

## 2. Document Processing Pipeline (`document_processor.py` & `chunker.py`)

1. **File Type Support**:
   - **PDF**: Page-by-page extraction preserving page numbers.
   - **DOCX**: Heading style detection (`### Heading`) and paragraph extraction.
   - **TXT / Markdown**: Structural heading and list preservation.
2. **Text Cleaning**:
   - Strips control characters, normalizes line endings (`\n`), and removes repeated blank lines while preserving paragraph boundaries.
3. **Paragraph-Aware Chunking**:
   - Splitting threshold: 500 characters per chunk with 50-character sliding overlap.
   - Preserves section titles, headings, page numbers, and estimated token counts.

---

## 3. Vector Store Engine & User Isolation (`vector_store.py`)

- **384-Dimensional Dense Vectors**: Generated using `sentence-transformers` (`all-MiniLM-L6-v2`) or TF-IDF magnitude normalization fallback.
- **Mandatory User Security**:
  - `WHERE userId == authenticatedUserId` on EVERY vector query.
  - User A CAN NEVER search, see, or retrieve User B's vector entries.

---

## 4. Grounded QA & No-Evidence Fallback (`rag_service.py`)

- **Relevance Score Threshold**: Min score 0.15.
- **No-Evidence Handling**: If no retrieved chunk passes relevance threshold, Gemini is NOT called to prevent hallucination. Returns:
  `"I couldn't find enough information in your uploaded documents to answer that."`
- **Source Citations**: Every answer includes explicit citations (`Resume.pdf — Page 2, Technical Skills`).

---

## 5. SCOUT Query Router (`query_router.py`)

Classifies incoming prompts into four intents:
1. `LIFEOS_DATA`: Tasks, Goals, Schedule, Habits, Analytics.
2. `KNOWLEDGE_BASE`: Resumes, Documents, Notes, Files.
3. `HYBRID`: Link personal documents AND LifeOS structured goals/tasks.
4. `GENERAL`: General AI assistance.
