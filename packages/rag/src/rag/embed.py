"""
Embedding client using sentence-transformers (all-MiniLM-L6-v2).
Runs locally on CPU — no API key needed.
"""

from sentence_transformers import SentenceTransformer

_model = None

def _get_model() -> SentenceTransformer:
    global _model
    if _model is None:
        _model = SentenceTransformer("all-MiniLM-L6-v2")
    return _model

def embed_texts(texts: list[str]) -> list[list[float]]:
    model = _get_model()
    embeddings = model.encode(texts, batch_size=32, show_progress_bar=False)
    return [emb.tolist() for emb in embeddings]

def embed_text(text: str) -> list[float]:
    return embed_texts([text])[0]
