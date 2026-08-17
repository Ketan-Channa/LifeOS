from typing import List
from app.rag.schemas import VectorSearchQuery, RetrievedChunk
from app.rag.embedding_service import generate_text_embedding
from app.rag.vector_store import vector_store_instance

def retrieve_relevant_chunks(query: VectorSearchQuery) -> List[RetrievedChunk]:
    """
    Generates query embedding and performs top-K vector search with strict userId isolation.
    """
    if not query.queryText or not query.queryText.strip():
        return []

    query_vector = generate_text_embedding(query.queryText)
    chunks = vector_store_instance.search(query, query_vector)
    return chunks
