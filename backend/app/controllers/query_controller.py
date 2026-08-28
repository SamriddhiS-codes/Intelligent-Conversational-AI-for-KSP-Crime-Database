from sqlalchemy.orm import Session
from ..services.gemini_service import classify_and_generate_sql, summarize_results, GeminiQuotaExceeded
from ..services.rag_service import handle_similar_case_query, find_similar_cases, summarize_hybrid_results
from ..services.sql_service import execute_query
from fastapi import HTTPException

def handle_query(db: Session, question: str, conversation_history: list[dict] = None) -> dict:
    """
    Full pipeline: NL question → SQL → execute → summarize → return.
    Intent classification + SQL generation happen in a single Gemini call
    to conserve free-tier request quota.

    Also supports "hybrid" questions that need both a SQL answer AND a
    narrative similarity search (see also_retrieve_similar flag).
    """
    try:
        classification = classify_and_generate_sql(question, conversation_history)
    except GeminiQuotaExceeded as e:
        raise HTTPException(status_code=429, detail=str(e))

    intent = classification["intent"]
    sql = classification["sql"]
    also_retrieve_similar = classification.get("also_retrieve_similar", False)

    if intent == "greeting":
        return {
            "intent": "greeting",
            "message": "Hello! I'm the KSP Crime Intelligence Assistant. Ask me anything about crime data across Karnataka — in English or Kannada.",
            "sql": None,
            "results": [],
            "row_count": 0,
            "summary": None,
        }

    if intent == "similar_cases":
        return handle_similar_case_query(db, question)

    if intent == "unsupported" or not sql:
        return {
            "intent": "unsupported",
            "message": "I can only answer questions related to the KSP crime database. Please ask about crime records, patterns, or statistics.",
            "sql": None,
            "results": [],
            "row_count": 0,
            "summary": None,
        }

    # Execute SQL safely
    try:
        results, row_count = execute_query(db, sql)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

    # Hybrid path: also run a similarity search and combine both into one answer
    if also_retrieve_similar:
        similar_matches = find_similar_cases(db, question, k=5)
        summary = summarize_hybrid_results(question, results, row_count, similar_matches)
        return {
            "intent": "hybrid",
            "message": summary,
            "sql": sql,
            "results": results,
            "row_count": row_count,
            "similar_cases": similar_matches,
            "summary": summary,
        }

    # Normal path: summarize with AI (degrades gracefully to a templated summary on quota errors)
    summary = summarize_results(question, sql, results, row_count)

    return {
        "intent": intent,
        "message": summary,
        "sql": sql,
        "results": results,
        "row_count": row_count,
        "summary": summary,
    }