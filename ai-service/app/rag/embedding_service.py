import os
import math
import numpy as np
from typing import List

_MODEL_INSTANCE = None

def get_embedding_model():
    """
    Lazy loads SentenceTransformer model or returns TF-IDF fallback.
    """
    global _MODEL_INSTANCE
    if _MODEL_INSTANCE is None:
        try:
            from sentence_transformers import SentenceTransformer
            _MODEL_INSTANCE = SentenceTransformer('all-MiniLM-L6-v2')
        except Exception:
            _MODEL_INSTANCE = "FALLBACK_TFIDF"
    return _MODEL_INSTANCE

def generate_text_embedding(text: str) -> List[float]:
    """
    Generates a normalized 384-dimensional dense vector for a text string.
    """
    if not text or not text.strip():
        return [0.0] * 384

    model = get_embedding_model()
    
    if model != "FALLBACK_TFIDF":
        try:
            vec = model.encode(text, convert_to_numpy=True)
            norm = np.linalg.norm(vec)
            if norm > 0:
                vec = vec / norm
            return vec.tolist()
        except Exception:
            pass

    # High-dimensional character n-gram / word frequency hashing fallback
    import zlib
    import re
    vec = [0.0] * 384
    words = [re.sub(r'[^\w]', '', w.lower()) for w in text.split()]
    for w in words:
        if not w:
            continue
        idx = zlib.adler32(w.encode('utf-8')) % 384
        vec[idx] += 1.0
    
    # Normalize vector
    magnitude = math.sqrt(sum(v * v for v in vec))
    if magnitude > 0:
        vec = [v / magnitude for v in vec]
        
    return vec

def generate_batch_embeddings(texts: List[str]) -> List[List[float]]:
    """
    Generates embeddings in batch for efficient document indexing.
    """
    if not texts:
        return []

    model = get_embedding_model()
    
    if model != "FALLBACK_TFIDF":
        try:
            vecs = model.encode(texts, batch_size=32, convert_to_numpy=True)
            normalized = []
            for v in vecs:
                norm = np.linalg.norm(v)
                if norm > 0:
                    v = v / norm
                normalized.append(v.tolist())
            return normalized
        except Exception:
            pass

    return [generate_text_embedding(t) for t in texts]
