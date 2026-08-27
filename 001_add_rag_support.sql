-- Migration: add RAG support (synthetic narrative + vector embedding column)
-- Run this against your ksp_crime database.

-- 1. Enable pgvector extension (ships with the postgres:15 image if you use
--    the pgvector/pgvector:pg15 image; if this fails, see note at bottom).
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Add a free-text narrative column (synthetic FIR-style description,
--    generated from the structured fields already in each row).
ALTER TABLE crimes
    ADD COLUMN IF NOT EXISTS case_narrative TEXT;

-- 3. Add an embedding column to store the vector representation of
--    case_narrative. 768 dims matches common local sentence-transformer
--    models (e.g. all-mpnet-base-v2). We'll set the exact dimension in
--    the embedding script — adjust here if you pick a different model.
ALTER TABLE crimes
    ADD COLUMN IF NOT EXISTS narrative_embedding vector(768);

-- 4. Index for fast approximate nearest-neighbor search once embeddings
--    are populated. IVFFlat needs at least ~1000 rows with data to build
--    a useful index — run this AFTER embeddings are generated, not before.
-- CREATE INDEX IF NOT EXISTS idx_crimes_narrative_embedding
--     ON crimes USING ivfflat (narrative_embedding vector_cosine_ops)
--     WITH (lists = 50);

-- NOTE: if "CREATE EXTENSION vector" fails with "could not open extension
-- control file", your Postgres image doesn't have pgvector installed.
-- Fix: in docker-compose.yml, change the db image from `postgres:15` to
-- `pgvector/pgvector:pg15` (same Postgres, with pgvector pre-installed),
-- then `docker compose down` and `docker compose up -d` to recreate the
-- container. Your data will need to be re-imported after that switch
-- unless you're using a named volume that persists (yours does — but the
-- extension itself still needs the new image to exist).
