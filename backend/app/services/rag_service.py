import os
os.environ.setdefault("USE_TF", "0")  # avoid transformers trying (and failing) to import TensorFlow
import json

from sqlalchemy.orm import Session
from sqlalchemy import text
import google.generativeai as genai
from ..config import get_settings

settings = get_settings()
genai.configure(api_key=settings.GEMINI_API_KEY)

_embeddings = None  # lazy-loaded singleton — loading the model takes a few seconds

def _get_embeddings():
    global _embeddings
    if _embeddings is None:
        from langchain_huggingface import HuggingFaceEmbeddings
        _embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-mpnet-base-v2")
    return _embeddings

def _to_pgvector_literal(vec):
    return "[" + ",".join(f"{x:.8f}" for x in vec) + "]"

def find_similar_cases(db: Session, query_text: str, k: int = 5) -> list[dict]:
    """
    Embed query_text and return the k most similar past cases (by cosine
    distance over case_narrative embeddings), each with its narrative and
    key structured fields.
    """
    embeddings = _get_embeddings()
    query_vector = embeddings.embed_query(query_text)
    vector_literal = _to_pgvector_literal(query_vector)

    rows = db.execute(
        text("""
            SELECT id, fir_number, crime_type, district, police_station,
                   incident_date, severity, case_status, case_outcome,
                   ipc_bns_sections, case_narrative,
                   1 - (narrative_embedding <=> :qvec) AS similarity
            FROM crimes
            WHERE narrative_embedding IS NOT NULL
            ORDER BY narrative_embedding <=> :qvec
            LIMIT :k
        """),
        {"qvec": vector_literal, "k": k},
    ).mappings().all()

    return [dict(r) for r in rows]

def summarize_similar_cases(user_question: str, matches: list[dict]) -> str:
    """
    Ask Gemini to summarize what these retrieved similar cases have in
    common, in the context of the user's original question.
    """
    if not matches:
        return "I couldn't find any past cases with a similar narrative in the database."

    cases_text = "\n\n".join(
        f"Case {m['fir_number']} ({m['crime_type']}, {m['district']}, "
        f"{m['incident_date']}, status: {m['case_status']}): {m['case_narrative']}"
        for m in matches
    )

    prompt = f"""A police investigator asked: "{user_question}"

Here are the {len(matches)} most similar past cases found in the database
(ranked by narrative similarity, most similar first):

{cases_text}

Write a brief (4-6 sentence) summary for the investigator: what patterns or
commonalities do these cases share (e.g. method, location type, time of
day, outcome)? Be factual and grounded only in what's shown above — do not
invent details. If the cases don't have much in common, say so plainly."""

    model = genai.GenerativeModel("gemini-3.1-flash-lite")
    try:
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception:
        # Degrade gracefully — still return the raw matches even if
        # Gemini synthesis fails (rate limit, etc.)
        return (
            f"Found {len(matches)} similar past cases (see below). "
            f"AI summary is temporarily unavailable."
        )

def handle_similar_case_query(db: Session, question: str) -> dict:
    """
    Full RAG pipeline: embed question -> retrieve similar cases -> summarize.
    Mirrors the shape of query_controller.handle_query's return dict so the
    frontend/chat UI can render it the same way.
    """
    matches = find_similar_cases(db, question, k=5)
    summary = summarize_similar_cases(question, matches)

    return {
        "intent": "similar_cases",
        "message": summary,
        "sql": None,
        "results": matches,
        "row_count": len(matches),
        "summary": summary,
    }
def summarize_hybrid_results(user_question: str, sql_results: list[dict], sql_row_count: int, similar_matches: list[dict]) -> str:
    """
    Combine a SQL query's results with semantically similar past cases into
    ONE grounded answer, for questions that ask for both (e.g. "how many
    drug cases in Shivamogga, and have we seen anything like this before").
    """
    sql_summary_part = f"The database query returned {sql_row_count} matching record(s)."
    if sql_results:
        preview = sql_results[:5]
        sql_summary_part += " Sample of the results: " + json.dumps(preview, default=str)

    if similar_matches:
        cases_text = "\n\n".join(
            f"Case {m['fir_number']} ({m['crime_type']}, {m['district']}, "
            f"status: {m['case_status']}): {m['case_narrative']}"
            for m in similar_matches
        )
        similar_part = f"\n\nSeparately, here are the {len(similar_matches)} most narratively similar past cases:\n\n{cases_text}"
    else:
        similar_part = "\n\nNo narratively similar past cases were found."

    prompt = f"""A police investigator asked: "{user_question}"

This question needs two things answered together:

1. STRUCTURED DATA RESULT:
{sql_summary_part}

2. SIMILAR PAST CASES:{similar_part}

Write a single, clear answer (5-8 sentences) that addresses BOTH parts of the
investigator's question. Be factual and grounded only in the data shown above
— do not invent numbers or details that aren't present."""

    model = genai.GenerativeModel("gemini-3.1-flash-lite")
    try:
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception:
        return (
            f"{sql_summary_part} Additionally, found {len(similar_matches)} "
            f"narratively similar past cases (see below). AI summary is temporarily unavailable."
        )
