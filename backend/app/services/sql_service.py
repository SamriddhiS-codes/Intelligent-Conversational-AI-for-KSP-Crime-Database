from sqlalchemy import text
from sqlalchemy.orm import Session
import re

# Whitelist of allowed SQL keywords — blocks any destructive operations
BLOCKED_KEYWORDS = re.compile(
    r'\b(INSERT|UPDATE|DELETE|DROP|TRUNCATE|ALTER|CREATE|GRANT|REVOKE|EXEC|EXECUTE|'
    r'pg_sleep|pg_read_file|COPY|\\\\|lo_import|lo_export)\b',
    re.IGNORECASE
)

def is_safe_query(sql: str) -> bool:
    """Basic SQL injection and safety guard."""
    if BLOCKED_KEYWORDS.search(sql):
        return False
    # Must be a SELECT
    stripped = sql.strip().upper()
    if not stripped.startswith("SELECT"):
        return False
    return True

def execute_query(db: Session, sql: str) -> tuple[list[dict], int]:
    """
    Execute a validated SQL query and return (rows_as_dicts, total_count).
    Raises ValueError for unsafe queries.
    """
    if not is_safe_query(sql):
        raise ValueError("Query blocked: only SELECT statements are permitted.")

    result = db.execute(text(sql))
    columns = list(result.keys())
    rows = result.fetchall()

    rows_as_dicts = [dict(zip(columns, row)) for row in rows]

    # Serialize non-JSON-native types (Decimal, date, etc.)
    for row in rows_as_dicts:
        for key, val in row.items():
            if hasattr(val, 'isoformat'):       # date / datetime
                row[key] = val.isoformat()
            elif hasattr(val, '__float__'):      # Decimal
                row[key] = float(val)

    return rows_as_dicts, len(rows_as_dicts)

def get_schema_summary(db: Session) -> dict:
    """Return quick stats about the database for display on dashboard."""
    stats = {}

    queries = {
        "total_crimes": "SELECT COUNT(*) FROM crimes",
        "districts": "SELECT COUNT(DISTINCT district) FROM crimes",
        "crime_types": "SELECT COUNT(DISTINCT crime_type) FROM crimes",
        "open_cases": "SELECT COUNT(*) FROM crimes WHERE case_status ILIKE '%investigation%'",
        "date_range": "SELECT MIN(incident_date), MAX(incident_date) FROM crimes",
    }

    for key, q in queries.items():
        try:
            result = db.execute(text(q)).fetchone()
            if key == "date_range":
                stats["earliest"] = result[0].isoformat() if result[0] else None
                stats["latest"] = result[1].isoformat() if result[1] else None
            else:
                stats[key] = result[0]
        except Exception:
            stats[key] = None

    return stats
