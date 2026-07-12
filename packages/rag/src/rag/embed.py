import os
import httpx

EMBEDDING_API_URL = os.environ.get("EMBEDDING_API_URL", "http://localhost:8000")


def embed_text(text: str) -> list[float]:
    resp = httpx.post(
        f"{EMBEDDING_API_URL}/embed",
        json={"text": text},
        timeout=30,
    )
    resp.raise_for_status()
    return resp.json()["embedding"]


def embed_texts(texts: list[str]) -> list[list[float]]:
    results: list[list[float]] = []
    batch_size = 100
    for i in range(0, len(texts), batch_size):
        batch = texts[i:i + batch_size]
        resp = httpx.post(
            f"{EMBEDDING_API_URL}/embed-batch",
            json={"texts": batch},
            timeout=120,
        )
        resp.raise_for_status()
        results.extend(resp.json()["embeddings"])
    return results
