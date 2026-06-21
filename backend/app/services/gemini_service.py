import google.generativeai as genai
from ..config import get_settings
import re

settings = get_settings()

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
5. Return ONLY the raw SQL query — no markdown, no explanation, no backticks.
6. If the question cannot be answered with this schema, return exactly: UNSUPPORTED_QUERY
7. For "hotspot" or "most common" questions, use GROUP BY + ORDER BY + LIMIT.
8. Never expose complainant_contact in results unless explicitly asked.
"""

def _get_model():
    genai.configure(api_key=settings.GEMINI_API_KEY)
    return genai.GenerativeModel("gemini-1.5-flash")

def natural_language_to_sql(user_question: str, conversation_history: list[dict] = None) -> str:
    """
    Convert a natural language question (English or Kannada) to a SQL query.
    Returns the SQL string or raises an exception.
    """
    model = _get_model()

    # Build prompt with optional conversation context
    history_context = ""
    if conversation_history:
        last_turns = conversation_history[-4:]  # last 2 exchanges
        history_context = "\nPREVIOUS CONVERSATION CONTEXT:\n"
        for turn in last_turns:
            history_context += f"{turn['role'].upper()}: {turn['content']}\n"

    prompt = f"""{DB_SCHEMA_CONTEXT}
{history_context}
USER QUESTION: {user_question}

Generate the SQL query now:"""

    response = model.generate_content(prompt)
    sql = response.text.strip()

    # Strip accidental markdown fences
    sql = re.sub(r"```sql|```", "", sql).strip()

    return sql

def summarize_results(user_question: str, sql_query: str, results: list[dict], row_count: int) -> str:
    """
    Generate a human-readable, investigator-friendly summary of query results.
    Supports both English and Kannada questions.
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

    response = model.generate_content(prompt)
    return response.text.strip()

def detect_intent(user_question: str) -> str:
    """
    Classify the user's intent: 'query', 'analytics', 'prediction', 'greeting', 'unsupported'
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

    response = model.generate_content(prompt)
    intent = response.text.strip().lower()
    valid = {"query", "analytics", "prediction", "greeting", "unsupported"}
    return intent if intent in valid else "query"
