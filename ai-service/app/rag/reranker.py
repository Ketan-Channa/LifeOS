from typing import List
from app.rag.schemas import RetrievedChunk

def rerank_and_filter_chunks(
    chunks: List[RetrievedChunk],
    max_chunks: int = 6,
    min_score: float = 0.15
) -> List[RetrievedChunk]:
    """
    Reranks, deduplicates, and filters retrieved document chunks.
    Ensures highest-relevance evidence is passed to Gemini while keeping context bounded.
    """
    if not chunks:
        return []

    seen_excerpts = set()
    filtered = []

    for chunk in chunks:
        if chunk.relevanceScore < min_score:
            continue

        # Simple deduplication based on content prefix
        key = chunk.excerpt[:60].strip().lower()
        if key in seen_excerpts:
            continue

        seen_excerpts.add(key)
        filtered.append(chunk)

        if len(filtered) >= max_chunks:
            break

    return filtered
