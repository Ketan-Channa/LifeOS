from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class DocumentProcessInput(BaseModel):
    documentId: str
    userId: str
    filePath: str
    originalFileName: str
    fileType: str
    category: Optional[str] = "General"
    description: Optional[str] = None
    tags: Optional[List[str]] = []

class DocumentChunkData(BaseModel):
    chunkIndex: int
    content: str
    tokenCount: int
    pageNumber: int = 1
    section: Optional[str] = "General"
    heading: Optional[str] = None

class DocumentProcessResult(BaseModel):
    documentId: str
    status: str # READY or FAILED
    pageCount: int
    wordCount: int
    chunksCount: int
    chunks: List[DocumentChunkData] = []
    errorMessage: Optional[str] = None

class VectorSearchQuery(BaseModel):
    userId: str
    queryText: str
    topK: int = 6
    documentIds: Optional[List[str]] = None
    category: Optional[str] = None
    minScoreThreshold: float = 0.15

class RetrievedChunk(BaseModel):
    chunkId: str
    documentId: str
    documentTitle: str
    pageNumber: int
    section: Optional[str] = "General"
    relevanceScore: float
    excerpt: str

class SourceCitation(BaseModel):
    documentId: str
    documentTitle: str
    pageNumber: int
    section: Optional[str] = "General"
    chunkId: str
    relevanceScore: float
    excerpt: str

class RAGQueryInput(BaseModel):
    userId: str
    question: str
    documentIds: Optional[List[str]] = None
    category: Optional[str] = None
    topK: int = 6
    minScoreThreshold: float = 0.15

class GroundedAnswerResponse(BaseModel):
    available: bool = True
    answer: str
    sources: List[SourceCitation] = []
    retrievalAvailable: bool = True
    intentCategory: str = "KNOWLEDGE_BASE"
    insufficientEvidence: bool = False

class DocumentSummarizeInput(BaseModel):
    userId: str
    documentId: str
    documentTitle: str
    chunks: List[DocumentChunkData]

class DocumentSummarizeResponse(BaseModel):
    documentId: str
    title: str
    summary: str
    keyPoints: List[str] = []
    topics: List[str] = []
    importantSections: List[str] = []
    sources: List[SourceCitation] = []

class DocumentCompareInput(BaseModel):
    userId: str
    documentAId: str
    documentATitle: str
    chunksA: List[DocumentChunkData]
    documentBId: str
    documentBTitle: str
    chunksB: List[DocumentChunkData]

class DocumentCompareResponse(BaseModel):
    documentATitle: str
    documentBTitle: str
    commonInformation: List[str] = []
    onlyInA: List[str] = []
    onlyInB: List[str] = []
    keyDifferences: List[str] = []
    summaryComparison: str
