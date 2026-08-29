from sqlalchemy.orm import Session
from ..services.gemini_service import classify_and_generate_sql, summarize_results, GeminiQuotaExceeded
from ..services.rag_service import handle_similar_case_query, find_similar_cases, summarize_hybrid_results
from ..services.sql_service import execute_query
from ..controllers import conversation_controller as cc
from fastapi import HTTPException
import json

def _json_safe(data):
    return json.loads(json.dumps(data, default=str))

def handle_query(
    db: Session, question: str, conversation_history: list[dict] = None,
    user_id: int = None, conversation_id: int = None,
) -> dict:
    """
    Full pipeline: NL question → SQL → execute → summarize → return.
    Also persists the exchange to a conversation (creating one if
    conversation_id wasn't supplied) so chat history can be listed/reloaded.
    """
    if user_id is not None:
        if conversation_id is None:
            title = cc.make_title_from_question(question)
            convo = cc.create_conversation(db, user_id, title=title)
            conversation_id = convo.id
        cc.add_message(db, conversation_id, role="user", content=question)

    result = _run_pipeline(db, question, conversation_history)
    result["conversation_id"] = conversation_id

    if user_id is not None and conversation_id is not None:
        cc.add_message(
            db, conversation_id, role="assistant",
            content=result.get("message") or result.get("summary") or "",
            response_data=_json_safe(result),
        )

    return result

def _run_pipeline(db: Session, question: str, conversation_history: list[dict] = None) -> dict:
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

    try:
        results, row_count = execute_query(db, sql)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

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

    summary = summarize_results(question, sql, results, row_count)

    return {
        "intent": intent,
        "message": summary,
        "sql": sql,
        "results": results,
        "row_count": row_count,
        "summary": summary,
    }