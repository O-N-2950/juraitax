"""
tAIx Knowledge API — FastAPI
Endpoint RAG fiscal pour le frontend React tAIx.
Même pattern que Soluris fiscal.py.
"""
import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

from knowledge.db.database import init_db
from knowledge.services.rag import query_knowledge

log = logging.getLogger("taix.api")
logging.basicConfig(level=logging.INFO)

TAIX_KNOWLEDGE_KEY = os.getenv("TAIX_KNOWLEDGE_KEY", "")


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(title="tAIx Knowledge API", version="1.0.0", lifespan=lifespan)

app.add_middleware(CORSMiddleware,
    allow_origins=["https://juraitax-app-production-f257.up.railway.app",
                   "https://taix.ch", "https://www.taix.ch",
                   "http://localhost:3000"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


class KnowledgeRequest(BaseModel):
    question: str
    canton:   Optional[str] = None
    year:     Optional[int] = 2025
    profile:  Optional[dict] = None
    api_key:  str


class KnowledgeResponse(BaseModel):
    reponse:    Optional[str]
    sources:    list
    confidence: float
    from_cache: bool = False


@app.post("/knowledge/query", response_model=KnowledgeResponse)
async def knowledge_query(req: KnowledgeRequest):
    if TAIX_KNOWLEDGE_KEY and req.api_key != TAIX_KNOWLEDGE_KEY:
        raise HTTPException(status_code=403, detail="Invalid API key")

    result = await query_knowledge(
        question=req.question,
        canton=req.canton,
        year=req.year or 2025,
        profile=req.profile,
    )
    return KnowledgeResponse(**result)


@app.get("/knowledge/ping")
async def ping(api_key: str = ""):
    if TAIX_KNOWLEDGE_KEY and api_key != TAIX_KNOWLEDGE_KEY:
        raise HTTPException(status_code=403, detail="Invalid API key")
    return {"status": "ok", "service": "tAIx Knowledge RAG"}
