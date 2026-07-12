from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastembed import TextEmbedding
from typing import List

app = FastAPI(title="BGE-Small Embedding Server")

try:
    model = TextEmbedding(model_name="BAAI/bge-small-en-v1.5")
except Exception as e:
    print(f"Failed to load model: {e}")
    model = None

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
    return {"status": "healthy", "model": "bge-small-en-v1.5"}

@app.post("/embed", response_model=EmbeddingResponse)
async def generate_embedding(payload: QueryRequest):
    if not model:
        raise HTTPException(status_code=500, detail="Embedding model not loaded.")
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
    if not model:
        raise HTTPException(status_code=500, detail="Embedding model not loaded.")
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
