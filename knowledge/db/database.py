"""
tAIx Knowledge Base — PostgreSQL + pgvector
Même architecture que Soluris, dédié à la connaissance fiscale pratique suisse.
Barèmes, diplômes fiduciaires, techniques d'optimisation, cas pratiques.
"""
import os
import asyncio
import asyncpg
import logging

log = logging.getLogger("taix.db")

pool = None
DATABASE_URL = os.getenv("TAIX_KNOWLEDGE_DB_URL",
               os.getenv("DATABASE_URL", "postgresql://localhost:5432/taix_knowledge"))
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)


async def init_db():
    global pool
    for attempt in range(5):
        try:
            pool = await asyncpg.create_pool(DATABASE_URL, min_size=2, max_size=10)
            break
        except Exception as e:
            log.warning(f"DB attempt {attempt+1}/5: {e}")
            if attempt < 4:
                await asyncio.sleep(3)
            else:
                log.error("Cannot connect to DB — knowledge base unavailable")
                return

    async with pool.acquire() as conn:
        await conn.execute("CREATE EXTENSION IF NOT EXISTS pgcrypto;")
        try:
            await conn.execute("CREATE EXTENSION IF NOT EXISTS vector;")
            log.info("✅ pgvector activé")
        except Exception as e:
            log.warning(f"pgvector non disponible: {e}")

        # ── Documents source ──────────────────────────────────────────────
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS fiscal_documents (
                id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                source      TEXT NOT NULL,
                category    TEXT NOT NULL,
                title       TEXT NOT NULL,
                language    TEXT DEFAULT 'fr',
                year        INTEGER,
                canton      TEXT,
                source_url  TEXT,
                scraped_at  TIMESTAMPTZ DEFAULT NOW(),
                UNIQUE(source, title)
            );
        """)

        # ── Chunks avec embeddings vectoriels ────────────────────────────
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS fiscal_chunks (
                id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                document_id  UUID REFERENCES fiscal_documents(id) ON DELETE CASCADE,
                chunk_index  INTEGER NOT NULL,
                chunk_text   TEXT NOT NULL,
                category     TEXT,
                canton       TEXT,
                year         INTEGER,
                keywords     TEXT[],
                source_ref   TEXT,
                created_at   TIMESTAMPTZ DEFAULT NOW()
            );
        """)

        # Colonne vector
        try:
            has_vec = await conn.fetchval("""
                SELECT COUNT(*) FROM information_schema.columns
                WHERE table_name='fiscal_chunks' AND column_name='embedding'
            """)
            if not has_vec:
                await conn.execute(
                    "ALTER TABLE fiscal_chunks ADD COLUMN embedding vector(1024);"
                )
                log.info("✅ Colonne embedding ajoutée")
        except Exception:
            log.warning("pgvector non disponible")

        # Index HNSW (recherche vectorielle rapide)
        try:
            await conn.execute("""
                CREATE INDEX IF NOT EXISTS idx_fiscal_embedding
                ON fiscal_chunks USING hnsw (embedding vector_cosine_ops)
                WITH (m=16, ef_construction=64);
            """)
        except Exception:
            pass

        await conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_fiscal_category ON fiscal_chunks(category);"
        )
        await conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_fiscal_canton ON fiscal_chunks(canton);"
        )
        await conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_fiscal_year ON fiscal_chunks(year);"
        )
        log.info("✅ tAIx Knowledge Base initialisée")


async def get_pool():
    global pool
    if pool is None:
        await init_db()
    return pool
