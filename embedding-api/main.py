import os
import sys
import logging

os.environ.setdefault("HF_HOME", "/tmp/.hf")
os.environ.setdefault("SENTENCE_TRANSFORMERS_HOME", "/tmp/.st")
os.makedirs("/tmp/.hf", exist_ok=True)
os.makedirs("/tmp/.st", exist_ok=True)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List

app = FastAPI(title="BGE-Small Embedding Server")

_model = None

def get_model():
    global _model
    if _model is not None:
        return _model
    logger.info("Loading embedding model BAAI/bge-small-en-v1.5...")
    try:
        from fastembed import TextEmbedding
        _model = TextEmbedding(model_name="BAAI/bge-small-en-v1.5", cache_dir="/tmp/.hf")
        logger.info("Model loaded successfully")
    except Exception as e:
        logger.error(f"Failed to load model: {e}")
        raise
    return _model

class QueryRequest(BaseModel):
    text: str

class BatchRequest(BaseModel):
    texts: List[str]

class EmbeddingResponse(BaseModel):
    embedding: List[float]

class BatchEmbeddingResponse(BaseModel):
    embeddings: List[List[float]]

@app.get("/")
def health_check():
    status = "loading" if _model is None else "healthy"
    return {"status": status, "model": "bge-small-en-v1.5"}

@app.post("/embed", response_model=EmbeddingResponse)
async def generate_embedding(payload: QueryRequest):
    try:
        model = get_model()
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Model unavailable: {e}")
    if not payload.text.strip():
        raise HTTPException(status_code=400, detail="Text payload cannot be empty.")
    try:
        embeddings_generator = model.embed([payload.text])
        embedding_vector = next(embeddings_generator).tolist()
        return EmbeddingResponse(embedding=embedding_vector)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/embed-batch", response_model=BatchEmbeddingResponse)
async def generate_embeddings_batch(payload: BatchRequest):
    try:
        model = get_model()
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Model unavailable: {e}")
    if not payload.texts:
        raise HTTPException(status_code=400, detail="Texts list cannot be empty.")
    if len(payload.texts) > 100:
        raise HTTPException(status_code=400, detail="Max 100 texts per request.")
    try:
        embeddings_generator = model.embed(payload.texts)
        embeddings = [emb.tolist() for emb in embeddings_generator]
        return BatchEmbeddingResponse(embeddings=embeddings)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
