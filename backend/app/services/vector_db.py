"""
Vector Database Service — Semantic search using SentenceTransformer embeddings.
Ported from NEXUS_2 backend.
"""
import os
import pickle
import numpy as np
import logging
from typing import List, Dict, Any, Optional
from sklearn.metrics.pairwise import cosine_similarity

logger = logging.getLogger(__name__)

VAULT_BASE = os.getenv("VAULT_BASE", "./nexus_vault")
os.makedirs(f"{VAULT_BASE}/embeddings", exist_ok=True)

# Lazy-load SentenceTransformer to avoid slow import on startup
_embedder = None

def get_embedder():
    global _embedder
    if _embedder is None:
        from sentence_transformers import SentenceTransformer
        _embedder = SentenceTransformer('all-MiniLM-L6-v2')
        logger.info("SentenceTransformer loaded successfully")
    return _embedder

def generate_embedding(text: str) -> List[float]:
    """Generate vector embedding for text"""
    embedder = get_embedder()
    embedding = embedder.encode(text)
    return embedding.tolist()


class VectorDatabase:
    def __init__(self, db_path=None):
        self.db_path = db_path or f"{VAULT_BASE}/embeddings/vectors.pkl"
        self.vectors = []
        self.metadata = []
        self.load()

    def add(self, vector, metadata):
        self.vectors.append(vector)
        self.metadata.append(metadata)
        self.save()

    def search(self, query_vector, top_k=5):
        if len(self.vectors) == 0:
            return []

        similarities = cosine_similarity([query_vector], self.vectors)[0]
        top_indices = np.argsort(similarities)[-top_k:][::-1]

        results = []
        for idx in top_indices:
            if similarities[idx] > 0.3:
                results.append({
                    "metadata": self.metadata[idx],
                    "similarity": float(similarities[idx])
                })
        return results

    def save(self):
        try:
            with open(self.db_path, 'wb') as f:
                pickle.dump({'vectors': self.vectors, 'metadata': self.metadata}, f)
        except Exception as e:
            logger.error(f"Failed to save vector DB: {e}")

    def load(self):
        if os.path.exists(self.db_path):
            try:
                with open(self.db_path, 'rb') as f:
                    data = pickle.load(f)
                    self.vectors = data['vectors']
                    self.metadata = data['metadata']
                logger.info(f"Vector DB loaded: {len(self.vectors)} vectors")
            except Exception as e:
                logger.error(f"Failed to load vector DB: {e}")
                self.vectors = []
                self.metadata = []

    def clear(self):
        self.vectors = []
        self.metadata = []
        self.save()


# Singleton instance
vector_db = VectorDatabase()
