from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from app.rag.schemas import (
    DocumentProcessInput, DocumentProcessResult, VectorSearchQuery,
    RAGQueryInput, GroundedAnswerResponse,
    DocumentSummarizeInput, DocumentSummarizeResponse,
    DocumentCompareInput, DocumentCompareResponse
)
from app.rag.rag_service import (
    process_and_index_document, answer_grounded_query,
    summarize_document, compare_documents
)
from app.rag.retriever import retrieve_relevant_chunks
from app.rag.vector_store import vector_store_instance

rag_router = APIRouter(prefix="/rag", tags=["RAG Intelligence"])

@rag_router.post("/process", response_model=DocumentProcessResult)
def process_document(payload: DocumentProcessInput):
    try:
        return process_and_index_document(payload)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Document processing error: {str(e)}")

@rag_router.post("/search")
def search_vectors(query: VectorSearchQuery):
    try:
        chunks = retrieve_relevant_chunks(query)
        return {"success": True, "count": len(chunks), "chunks": chunks}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Vector search error: {str(e)}")

@rag_router.post("/query", response_model=GroundedAnswerResponse)
def query_knowledge(payload: RAGQueryInput):
    try:
        return answer_grounded_query(payload)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"RAG query error: {str(e)}")

@rag_router.post("/summarize", response_model=DocumentSummarizeResponse)
def summarize_doc(payload: DocumentSummarizeInput):
    try:
        return summarize_document(payload)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Document summarization error: {str(e)}")

@rag_router.post("/compare", response_model=DocumentCompareResponse)
def compare_docs(payload: DocumentCompareInput):
    try:
        return compare_documents(payload)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Document comparison error: {str(e)}")

@rag_router.delete("/document/{userId}/{documentId}")
def delete_document_vectors(userId: str, documentId: str):
    try:
        deleted_count = vector_store_instance.delete_document_vectors(userId, documentId)
        return {"success": True, "deletedVectors": deleted_count}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Vector deletion error: {str(e)}")

@rag_router.get("/health")
def rag_health():
    v_health = vector_store_instance.health_check()
    return {
        "status": "healthy",
        "documentProcessor": "ready",
        "embeddingService": "ready",
        "vectorStore": v_health,
        "gemini": "connected"
    }
