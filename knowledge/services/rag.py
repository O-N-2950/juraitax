"""
tAIx RAG Service — Retrieval Augmented Generation fiscal pratique
Même pipeline que Soluris :
  1. Question → embedding Cohere multilingual-v3
  2. Cosine search pgvector → top-K chunks
  3. Chunks + question → Claude → réponse citée

Connaissance couverte :
  - Barèmes cantonaux 2025 (26 cantons)
  - Diplôme fédéral expert fiscal (programme + cas pratiques)
  - Diplôme fédéral fiduciaire
  - Brevet fédéral comptable
  - Techniques d'optimisation fiscale
  - Déductions effectives vs forfaitaires
  - Cas pratiques par profil (retraité, indépendant, famille, etc.)
"""
import os
import logging
import httpx
from typing import Optional

log = logging.getLogger("taix.rag")

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
COHERE_API_KEY    = os.getenv("COHERE_API_KEY", "")
EMBEDDING_MODEL   = "embed-multilingual-v3.0"
EMBEDDING_DIM     = 1024
TOP_K             = 8
CONFIDENCE_THRESHOLD = 0.35

FISCAL_SYSTEM_PROMPT = """Tu es le conseiller fiscal IA de tAIx, spécialiste en fiscalité suisse pratique.
Tu as accès à une base de connaissances fiscales vérifiées incluant les barèmes 2025,
les techniques d'optimisation, et les référentiels des diplômes fédéraux fiduciaires.

RÈGLES ABSOLUES :
1. Base chaque conseil sur les sources de ta base de connaissances
2. Cite la source précise : "Barème JU 2025", "Manuel Expert Fiscal ch. 3.2", etc.
3. Donne des montants CHF précis quand disponibles — jamais de fourchettes vagues
4. Adapte le conseil au profil exact de la personne (âge, canton, situation)
5. Si une info n'est pas dans ta base, dis-le clairement
6. Pour les retraités : frais médicaux, primes maladie, déductions spécifiques âge
7. Pour les salariés : transport, télétravail, frais prof, 3a, LPP
8. Pour les indépendants : frais effectifs, amortissements, cotisations AVS

FORMAT :
- Conseil direct et chiffré
- Citation source entre parenthèses
- Impact CHF estimé si calculable
- Conseil actionnable (quoi faire concrètement)

Tu réponds en français (ou dans la langue de l'utilisateur si autre)."""


async def generate_embedding(text: str) -> Optional[list]:
    """Génère un embedding Cohere multilingual-v3."""
    if not COHERE_API_KEY:
        log.warning("COHERE_API_KEY manquante")
        return None
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            r = await client.post(
                "https://api.cohere.ai/v1/embed",
                headers={"Authorization": f"Bearer {COHERE_API_KEY}"},
                json={
                    "texts": [text],
                    "model": EMBEDDING_MODEL,
                    "input_type": "search_query",
                },
            )
            r.raise_for_status()
            return r.json()["embeddings"][0]
    except Exception as e:
        log.error(f"Embedding error: {e}")
        return None


async def retrieve_chunks(pool, query_embedding: list, limit: int = TOP_K,
                          canton: str = None, category: str = None) -> list:
    """Recherche vectorielle dans fiscal_chunks."""
    async with pool.acquire() as conn:
        try:
            if canton:
                rows = await conn.fetch("""
                    SELECT chunk_text, source_ref, category, canton, year,
                           embedding <=> $1::vector AS distance
                    FROM fiscal_chunks
                    WHERE (canton = $2 OR canton IS NULL)
                    ORDER BY distance
                    LIMIT $3
                """, str(query_embedding), canton.upper(), limit)
            else:
                rows = await conn.fetch("""
                    SELECT chunk_text, source_ref, category, canton, year,
                           embedding <=> $1::vector AS distance
                    FROM fiscal_chunks
                    ORDER BY distance
                    LIMIT $2
                """, str(query_embedding), limit)

            return [dict(r) for r in rows]

        except Exception:
            # Fallback texte si pgvector absent
            rows = await conn.fetch("""
                SELECT chunk_text, source_ref, category, canton, year,
                       0.5 AS distance
                FROM fiscal_chunks
                WHERE ($1::text IS NULL OR canton = $1 OR canton IS NULL)
                LIMIT $2
            """, canton, limit)
            return [dict(r) for r in rows]


async def call_claude(messages: list, system_prompt: str,
                      max_tokens: int = 1500) -> str:
    """Appel Claude pour génération de réponse."""
    async with httpx.AsyncClient(timeout=60) as client:
        r = await client.post(
            "https://api.anthropic.com/v1/messages",
            headers={
                "x-api-key": ANTHROPIC_API_KEY,
                "anthropic-version": "2023-06-01",
                "Content-Type": "application/json",
            },
            json={
                "model": "claude-sonnet-4-6",
                "max_tokens": max_tokens,
                "system": system_prompt,
                "messages": messages,
            },
        )
        r.raise_for_status()
        return r.json()["content"][0]["text"]


def build_context(chunks: list, canton: str = None, year: int = 2025) -> str:
    """Construit le contexte RAG pour Claude."""
    header = "=== BASE DE CONNAISSANCES FISCALES tAIx ===\n"
    if canton:
        header += f"Canton : {canton}\n"
    header += f"Année fiscale : {year}\n\n"

    parts = []
    for i, c in enumerate(chunks, 1):
        ref  = c.get("source_ref") or c.get("category") or f"§{i}"
        text = c.get("chunk_text", "")
        dist = c.get("distance", 1.0)
        relevance = round((1 - dist) * 100)
        parts.append(
            f"[Source {i} — {ref} — pertinence {relevance}%]\n{text}"
        )

    return header + "\n---\n".join(parts)


async def query_knowledge(question: str, canton: str = None,
                          year: int = 2025, profile: dict = None) -> dict:
    """
    Point d'entrée principal du RAG fiscal tAIx.
    Retourne : {reponse, sources, confidence}
    """
    from knowledge.db.database import get_pool

    pool = await get_pool()
    if pool is None:
        return {
            "reponse": None,
            "sources": [],
            "confidence": 0.0,
        }

    # Enrichir la question avec le profil
    enriched = question
    if canton:
        enriched += f" (Canton {canton})"
    if profile:
        if profile.get("type_profil"):
            enriched += f" (Profil: {profile['type_profil']})"
        if profile.get("age"):
            enriched += f" ({profile['age']} ans)"

    embedding = await generate_embedding(enriched)
    if not embedding:
        return {"reponse": None, "sources": [], "confidence": 0.0}

    chunks = await retrieve_chunks(pool, embedding, limit=TOP_K, canton=canton)
    if not chunks:
        return {"reponse": None, "sources": [], "confidence": 0.0}

    distances = [c.get("distance", 1.0) for c in chunks]
    confidence = round(1 - (sum(distances) / len(distances)), 3)

    if confidence < CONFIDENCE_THRESHOLD:
        return {"reponse": None, "sources": [], "confidence": confidence}

    context = build_context(chunks, canton, year)
    messages = [{
        "role": "user",
        "content": f"{context}\n\n=== QUESTION ===\n{question}"
    }]

    try:
        reponse = await call_claude(messages, FISCAL_SYSTEM_PROMPT)
    except Exception as e:
        log.error(f"Claude error: {e}")
        return {"reponse": None, "sources": [], "confidence": 0.0}

    sources = [
        {
            "ref": c.get("source_ref") or c.get("category"),
            "canton": c.get("canton"),
            "year": c.get("year"),
        }
        for c in chunks if c.get("source_ref")
    ]

    return {
        "reponse": reponse,
        "sources": sources,
        "confidence": confidence,
    }
