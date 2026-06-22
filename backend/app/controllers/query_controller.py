from sqlalchemy.orm import Session
from ..services.gemini_service import natural_language_to_sql, summarize_results, detect_intent
from ..services.sql_service import execute_query
from fastapi import HTTPException

def handle_query(db: Session, question: str, conversation_history: list[dict] = None) -> dict:
    """
    Full pipeline: NL question → SQL → execute → summarize → return.
    """
    intent = detect_intent(question)

    if intent == "greeting":
        return {
            "intent": "greeting",
            "message": "Hello! I'm the KSP Crime Intelligence Assistant. Ask me anything about crime data across Karnataka — in English or Kannada.",
            "sql": None,
            "results": [],
            "row_count": 0,
            "summary": None,
        }

    if intent == "unsupported":
        return {
            "intent": "unsupported",
            "message": "I can only answer questions related to the KSP crime database. Please ask about crime records, patterns, or statistics.",
            "sql": None,
            "results": [],
            "row_count": 0,
            "summary": None,
        }

    # Generate SQL
    sql = natural_language_to_sql(question, conversation_history)

    if sql == "UNSUPPORTED_QUERY":
        return {
            "intent": intent,
            "message": "I couldn't find a way to answer that with the available crime data.",
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

    # Summarize with AI
    summary = summarize_results(question, sql, results, row_count)

    return {
        "intent": intent,
        "message": summary,
        "sql": sql,
        "results": results,
        "row_count": row_count,
        "summary": summary,
    }
