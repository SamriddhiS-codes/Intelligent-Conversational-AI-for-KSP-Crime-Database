import google.generativeai as genai
from ..config import get_settings
from google.api_core.exceptions import ResourceExhausted
import re
import json

settings = get_settings()

class GeminiQuotaExceeded(Exception):
    """Raised when the Gemini free-tier request quota is exhausted."""
    pass

# Schema context given to Gemini so it understands the database
DB_SCHEMA_CONTEXT = """
You are an expert SQL assistant for the Karnataka State Police (KSP) Crime Database.

DATABASE SCHEMA:
Table: crimes
  - id (integer, primary key)
  - fir_number (text, unique) — e.g. "0001/2020"
  - crime_type (text) — e.g. "Robbery", "Murder", "Kidnapping", "Extortion", "Fraud", "Assault"
  - ipc_bns_sections (text) — comma-separated IPC/BNS sections
  - severity (text) — "High", "Medium", "Low"
  - incident_date (date)
  - report_date (date)
  - district (text) — Karnataka districts e.g. "Mysuru", "Bengaluru Urban", "Belagavi", "Kalaburagi"
  - police_station (text) — e.g. "Devaraja PS", "Camp PS"
  - location_description (text)
  - latitude (decimal)
  - longitude (decimal)
  - complainant_name (text)
  - complainant_age (integer)
  - complainant_gender (text) — "Male", "Female", "Other"
  - complainant_contact (text)
  - accused_name (text) — may contain multiple names separated by "; "
  - accused_age (integer)
  - accused_gender (text)
  - accused_count (integer)
  - weapon_used (text) — e.g. "Knife", "Gun", "Acid", "None"
  - is_juvenile_involved (boolean)
  - case_status (text) — "Under Investigation", "Case Closed", "Pending Court Trial", "Charge Sheet Filed"
  - case_outcome (text) — "Convicted", "Acquitted", null
  - property_loss_inr (decimal) — property loss in Indian Rupees
  - investigating_officer (text)

RULES:
1. Generate ONLY a valid PostgreSQL SELECT query — no INSERT, UPDATE, DELETE, DROP.
2. Always use LIMIT 100 unless the user asks for aggregates (COUNT, SUM, AVG etc.).
3. For text comparisons, use ILIKE for case-insensitive matching.
4. For date ranges, use BETWEEN or >= / <=.
5. If the question cannot be answered with this schema, set "sql" to null.
6. For "hotspot" or "most common" questions, use GROUP BY + ORDER BY + LIMIT.
7. Never expose complainant_contact in results unless explicitly asked.
"""

def _get_model():
    genai.configure(api_key=settings.GEMINI_API_KEY)
    return genai.GenerativeModel("gemini-3.1-flash-lite")

def _generate(model, prompt: str):
    """Wraps model.generate_content and turns quota errors into a typed
    exception the caller can handle gracefully instead of a raw 500."""
    try:
        return model.generate_content(prompt)
    except ResourceExhausted as e:
        raise GeminiQuotaExceeded(
            "The AI service has hit its request quota. Please try again shortly, "
            "or ask an admin to upgrade the Gemini API plan."
        ) from e

def classify_and_generate_sql(user_question: str, conversation_history: list[dict] = None) -> dict:
    """
    Single combined call: classifies intent AND (if applicable) generates SQL
    in one round trip. Also detects whether the question ALSO needs semantic
    similar-case retrieval alongside the SQL (a "hybrid" question), e.g.
    "find cases like this AND tell me how many total drug cases happened
    in Shivamogga" — needs both narrative similarity search and an aggregate
    SQL count in one answer.

    Returns: {"intent": ..., "sql": ... or None, "also_retrieve_similar": bool}
    """
    model = _get_model()

    history_context = ""
    if conversation_history:
        last_turns = conversation_history[-4:]  # last 2 exchanges
        history_context = "\nPREVIOUS CONVERSATION CONTEXT:\n"
        for turn in last_turns:
            history_context += f"{turn['role'].upper()}: {turn['content']}\n"

    prompt = f"""{DB_SCHEMA_CONTEXT}
{history_context}
USER QUESTION: {user_question}

Classify the message into exactly one intent:
- query: asking for specific crime records or counts
- analytics: asking for patterns, trends, hotspots, comparisons
- prediction: asking about future predictions or risk
- similar_cases: describing a new/hypothetical case and asking to find similar past
  cases, or asking "have we seen cases like this before" (this is about matching
  case NARRATIVES/circumstances, not filtering by exact field values)
- greeting: hello, hi, introduction
- unsupported: completely unrelated to crime data

If intent is "query", "analytics", or "prediction", also generate the PostgreSQL SELECT query
that answers it, following the RULES above. If intent is "similar_cases", "greeting", or
"unsupported", or if the question cannot be answered with this schema, set "sql" to null.

ADDITIONALLY: set "also_retrieve_similar" to true ONLY if intent is "query", "analytics",
or "prediction" AND the question ALSO separately asks to find narratively similar past
cases (e.g. "...and have we seen anything like this before", "...also find comparable
cases"). This is for HYBRID questions that need both a SQL answer AND a similarity
search. Otherwise set it to false. Do not set this true for "similar_cases" intent
itself — that's handled separately.

Respond with ONLY raw JSON (no markdown, no backticks), in exactly this shape:
{{"intent": "<one of the categories above>", "sql": "<SQL string or null>", "also_retrieve_similar": <true or false>}}"""

    response = _generate(model, prompt)
    raw = response.text.strip()
    raw = re.sub(r"```json|```", "", raw).strip()

    try:
        parsed = json.loads(raw)
    except (json.JSONDecodeError, TypeError):
        # Model didn't return clean JSON — fail safe rather than crash the request.
        return {"intent": "query", "sql": None, "also_retrieve_similar": False}

    intent = str(parsed.get("intent", "query")).lower()
    valid = {"query", "analytics", "prediction", "similar_cases", "greeting", "unsupported"}
    if intent not in valid:
        intent = "query"

    sql = parsed.get("sql")
    if sql:
        sql = re.sub(r"```sql|```", "", str(sql)).strip()

    also_retrieve_similar = bool(parsed.get("also_retrieve_similar", False))
    if intent == "similar_cases":
        also_retrieve_similar = False  # avoid double-retrieval

    return {"intent": intent, "sql": sql, "also_retrieve_similar": also_retrieve_similar}

def natural_language_to_sql(user_question: str, conversation_history: list[dict] = None) -> str:
    """Kept for any direct callers — now just delegates to the combined call."""
    result = classify_and_generate_sql(user_question, conversation_history)
    return result["sql"] or "UNSUPPORTED_QUERY"

def summarize_results(user_question: str, sql_query: str, results: list[dict], row_count: int) -> str:
    """
    Generate a human-readable, investigator-friendly summary of query results.
    Supports both English and Kannada questions. Falls back to a plain
    templated summary if the Gemini quota is exhausted, so the query itself
    still succeeds even when the AI narration can't run.
    """
    model = _get_model()

    # Truncate results for the prompt to avoid token limits
    sample = results[:20] if len(results) > 20 else results

    # Detect if question is in Kannada (basic heuristic — Kannada Unicode range)
    is_kannada = any('\u0C80' <= ch <= '\u0CFF' for ch in user_question)
    language_instruction = "Respond in Kannada." if is_kannada else "Respond in English."

    prompt = f"""You are an intelligent crime analysis assistant for Karnataka State Police.

A user asked: "{user_question}"

The SQL query ran was:
{sql_query}

It returned {row_count} total records. Here is a sample of the data:
{sample}

Your task:
1. Give a clear, concise summary of what the data shows (2-4 sentences).
2. Highlight any notable patterns, spikes, or insights if visible.
3. If the result is a count or aggregate, state it directly upfront.
4. Keep the tone professional but accessible to a police investigator.
5. {language_instruction}
6. Do NOT repeat the raw data — synthesize it.

Summary:"""

    try:
        response = _generate(model, prompt)
        return response.text.strip()
    except GeminiQuotaExceeded:
        # Degrade gracefully: the query itself already succeeded, so still
        # return something useful instead of failing the whole request.
        if row_count == 0:
            return "No matching records were found. (AI summary unavailable — request quota reached.)"
        return (
            f"Found {row_count} matching record{'s' if row_count != 1 else ''}. "
            "(AI-generated summary unavailable right now — request quota reached; "
            "raw results are shown below.)"
        )

def detect_intent(user_question: str) -> str:
    """
    Classify the user's intent: 'query', 'analytics', 'prediction', 'greeting', 'unsupported'.
    Kept for any direct callers — the main pipeline uses classify_and_generate_sql instead,
    which does this in the same call as SQL generation to save quota.
    """
    model = _get_model()
    prompt = f"""Classify this message from a police investigator into exactly one category:
- query: asking for specific crime records or counts
- analytics: asking for patterns, trends, hotspots, comparisons
- prediction: asking about future predictions or risk
- greeting: hello, hi, introduction
- unsupported: completely unrelated to crime data

Message: "{user_question}"

Reply with exactly one word (the category):"""

    response = _generate(model, prompt)
    intent = response.text.strip().lower()
    valid = {"query", "analytics", "prediction", "greeting", "unsupported"}
    return intent if intent in valid else "query"