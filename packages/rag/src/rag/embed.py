"""
Embedding client.
Uses Google Gemini text-embedding-004 API directly via HTTP.
"""

import os
import json
import httpx

GEMINI_API_KEY = os.environ.get("GOOGLE_GENERATIVE_AI_API_KEY")
GEMINI_EMBED_URL = (
    "https://generativelanguage.googleapis.com/v1beta/"
    "models/text-embedding-004:batchEmbedContents"
)

EMBEDDING_API_URL = os.environ.get("EMBEDDING_API_URL")


def embed_texts(texts: list[str]) -> list[list[float]]:
    if EMBEDDING_API_URL:
        return _embed_via_fastapi(texts)
    return _embed_via_gemini(texts)


def embed_text(text: str) -> list[float]:
    return embed_texts([text])[0]


def _embed_via_gemini(texts: list[str]) -> list[list[float]]:
    if not GEMINI_API_KEY:
        raise RuntimeError(
            "GOOGLE_GENERATIVE_AI_API_KEY not set and EMBEDDING_API_URL not set"
        )
    results: list[list[float]] = []
    batch_size = 100
    for i in range(0, len(texts), batch_size):
        batch = texts[i:i + batch_size]
        requests = [{"model": "models/text-embedding-004", "content": {"parts": [{"text": t}]}} for t in batch]
        resp = httpx.post(
            f"{GEMINI_EMBED_URL}?key={GEMINI_API_KEY}",
            json={"requests": requests},
            timeout=120,
        )
        resp.raise_for_status()
        data = resp.json()
        for emb in data.get("embeddings", []):
            results.append(emb["values"])
    return results


def _embed_via_fastapi(texts: list[str]) -> list[list[float]]:
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
