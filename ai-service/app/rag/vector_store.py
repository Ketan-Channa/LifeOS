import os
import json
import numpy as np
from typing import List, Dict, Any, Optional
from app.rag.schemas import VectorSearchQuery, RetrievedChunk

class VectorStore:
    """
    In-memory and file-persisted vector storage engine with strict userId scoping.
    """
    def __init__(self, storage_dir: str = "./storage/vectors"):
        self.storage_dir = storage_dir
        os.makedirs(self.storage_dir, exist_ok=True)
        # Vector index dict: { chunkId: { userId, documentId, documentTitle, pageNumber, section, content, vector } }
        self.vectors: Dict[str, Dict[str, Any]] = {}
        self._load_all_vectors()

    def _get_vector_file_path(self) -> str:
        return os.path.join(self.storage_dir, "vector_index.json")

    def _load_all_vectors(self):
        file_path = self._get_vector_file_path()
        if os.path.exists(file_path):
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    self.vectors = json.load(f)
            except Exception as e:
                print(f"[VECTOR STORE WARNING] Failed to load index file: {e}")
                self.vectors = {}

    def _save_all_vectors(self):
        file_path = self._get_vector_file_path()
        try:
            with open(file_path, "w", encoding="utf-8") as f:
                json.dump(self.vectors, f)
        except Exception as e:
            print(f"[VECTOR STORE ERROR] Failed to persist index: {e}")

    def add_embedding(
        self,
        chunk_id: str,
        user_id: str,
        document_id: str,
        document_title: str,
        page_number: int,
        section: str,
        content: str,
        vector: List[float]
    ):
        """
        Adds or updates a chunk vector entry in index.
        """
        self.vectors[chunk_id] = {
            "chunkId": chunk_id,
            "userId": user_id,
            "documentId": document_id,
            "documentTitle": document_title,
            "pageNumber": page_number,
            "section": section or "General",
            "content": content,
            "vector": vector
        }
        self._save_all_vectors()

    def search(self, query: VectorSearchQuery, query_vector: List[float]) -> List[RetrievedChunk]:
        """
        Performs cosine similarity search over stored vectors with STRICT userId isolation.
        User A can NEVER access User B's vectors!
        """
        if not self.vectors or not query_vector:
            return []

        q_vec = np.array(query_vector, dtype=np.float32)
        q_norm = np.linalg.norm(q_vec)
        if q_norm > 0:
            q_vec = q_vec / q_norm

        results = []

        for chunk_id, data in self.vectors.items():
            # STRICT USER ISOLATION CHECK
            if data.get("userId") != query.userId:
                continue

            # Optional documentId filter
            if query.documentIds and data.get("documentId") not in query.documentIds:
                continue

            v_vec = np.array(data.get("vector", []), dtype=np.float32)
            v_norm = np.linalg.norm(v_vec)
            if v_norm > 0:
                v_vec = v_vec / v_norm

            score = float(np.dot(q_vec, v_vec))

            if score >= query.minScoreThreshold:
                results.append(RetrievedChunk(
                    chunkId=chunk_id,
                    documentId=data.get("documentId"),
                    documentTitle=data.get("documentTitle", "Document"),
                    pageNumber=data.get("pageNumber", 1),
                    section=data.get("section", "General"),
                    relevanceScore=round(score, 4),
                    excerpt=data.get("content", "")
                ))

        # Sort by relevance score descending
        results.sort(key=lambda x: x.relevanceScore, reverse=True)
        return results[:query.topK]

    def delete_document_vectors(self, user_id: str, document_id: str):
        """
        Removes all vectors belonging to a document.
        """
        to_delete = [
            cid for cid, data in self.vectors.items()
            if data.get("userId") == user_id and data.get("documentId") == document_id
        ]
        for cid in to_delete:
            del self.vectors[cid]
        self._save_all_vectors()
        return len(to_delete)

    def delete_user_vectors(self, user_id: str):
        """
        Removes all vectors for a user.
        """
        to_delete = [
            cid for cid, data in self.vectors.items()
            if data.get("userId") == user_id
        ]
        for cid in to_delete:
            del self.vectors[cid]
        self._save_all_vectors()
        return len(to_delete)

    def health_check(self) -> Dict[str, Any]:
        return {
            "status": "healthy",
            "totalVectorsIndexed": len(self.vectors),
            "storageDirectory": self.storage_dir
        }

# Global Singleton Instance
vector_store_instance = VectorStore()
