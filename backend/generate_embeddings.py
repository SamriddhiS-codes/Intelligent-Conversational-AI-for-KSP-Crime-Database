"""
Generate vector embeddings for case narratives and store them in the
narrative_embedding column (pgvector), using LangChain's embeddings
wrapper around a local sentence-transformer model.

We use a LOCAL embedding model (not Gemini) deliberately:
  - No API quota/cost for embedding 1500 rows
  - No rate-limit risk
  - Still genuinely "LangChain" — HuggingFaceEmbeddings is a LangChain
    abstraction, swappable later for a hosted embedding model if wanted

Run once from the backend/ folder (after generate_narratives.py):
    python generate_embeddings.py

Safe to re-run: only processes rows where narrative_embedding IS NULL.
"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from sqlalchemy import text
from app.database import SessionLocal
from langchain_huggingface import HuggingFaceEmbeddings

BATCH_SIZE = 50
MODEL_NAME = "sentence-transformers/all-mpnet-base-v2"  # 768-dim, matches migration

def to_pgvector_literal(vec):
    # pgvector expects a string like '[0.123,0.456,...]'
    return "[" + ",".join(f"{x:.8f}" for x in vec) + "]"

def main():
    print(f"Loading embedding model ({MODEL_NAME})... this can take a minute on first run.")
    embeddings = HuggingFaceEmbeddings(model_name=MODEL_NAME)

    db = SessionLocal()
    total_done = 0
    try:
        while True:
            rows = db.execute(text(f"""
                SELECT id, case_narrative FROM crimes
                WHERE case_narrative IS NOT NULL
                  AND narrative_embedding IS NULL
                LIMIT {BATCH_SIZE}
            """)).mappings().all()

            if not rows:
                print("No more narratives without embeddings. Done.")
                break

            texts = [r["case_narrative"] for r in rows]
            ids = [r["id"] for r in rows]

            print(f"Embedding batch of {len(texts)} (total so far: {total_done})...")
            vectors = embeddings.embed_documents(texts)

            for row_id, vec in zip(ids, vectors):
                db.execute(
                    text("UPDATE crimes SET narrative_embedding = :emb WHERE id = :id"),
                    {"emb": to_pgvector_literal(vec), "id": row_id},
                )
            db.commit()
            total_done += len(rows)
            print(f"  Committed {len(rows)} embeddings.")

        print(f"\nDone. Total embeddings generated: {total_done}")

        print("\nBuilding ivfflat index for fast similarity search...")
        db.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_crimes_narrative_embedding
                ON crimes USING ivfflat (narrative_embedding vector_cosine_ops)
                WITH (lists = 50);
        """))
        db.commit()
        print("Index created.")
    finally:
        db.close()

if __name__ == "__main__":
    main()
