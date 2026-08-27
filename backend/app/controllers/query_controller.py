from sqlalchemy.orm import Session
from ..services.gemini_service import classify_and_generate_sql, summarize_results, GeminiQuotaExceeded
from ..services.rag_service import handle_similar_case_query
from ..services.sql_service import execute_query
from fastapi import HTTPException

def handle_query(db: Session, question: str, conversation_history: list[dict] = None) -> dict:
    """
    Full pipeline: NL question → SQL → execute → summarize → return.
    Intent classification + SQL generation happen in a single Gemini call
    to conserve free-tier request quota.
    """
    try:
        classification = classify_and_generate_sql(question, conversation_history)
    except GeminiQuotaExceeded as e:
        raise HTTPException(status_code=429, detail=str(e))

    intent = classification["intent"]
    sql = classification["sql"]

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

    # Summarize with AI (degrades gracefully to a templated summary on quota errors)
    summary = summarize_results(question, sql, results, row_count)

    return {
        "intent": intent,
        "message": summary,
        "sql": sql,
        "results": results,
        "row_count": row_count,
        "summary": summary,
    }