"""
Generate synthetic FIR-style case narratives for a sampled subset of the
crimes table, using Gemini, in batches (to conserve API quota / time).

Run once from the backend/ folder:
    python generate_narratives.py

Safe to re-run: it only processes rows where case_narrative IS NULL, so if
it's interrupted partway you can just run it again and it'll resume.
"""
import sys, os, json, time
sys.path.insert(0, os.path.dirname(__file__))

import google.generativeai as genai
from google.api_core.exceptions import ResourceExhausted
from sqlalchemy import text
from app.database import SessionLocal
from app.config import get_settings

settings = get_settings()
genai.configure(api_key=settings.GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-3.1-flash-lite")

TARGET_ROWS = 1500     # total rows to generate narratives for
BATCH_SIZE = 25        # rows per Gemini call
MAX_RETRIES = 3

# Pull an even spread across district + crime_type, not just the first N rows.
SAMPLE_QUERY = f"""
WITH ranked AS (
    SELECT id, fir_number, crime_type, ipc_bns_sections, severity,
           incident_date, district, police_station, location_description,
           complainant_age, complainant_gender, accused_name, accused_age,
           accused_gender, accused_count, weapon_used, is_juvenile_involved,
           case_status, case_outcome, property_loss_inr,
           ROW_NUMBER() OVER (
               PARTITION BY district, crime_type ORDER BY random()
           ) AS rn
    FROM crimes
    WHERE case_narrative IS NULL
)
SELECT * FROM ranked
ORDER BY rn, random()
LIMIT {TARGET_ROWS};
"""

PROMPT_TEMPLATE = """You are drafting brief, neutral FIR-style case summaries for a POLICE
CRIME DATABASE DEMO built on synthetic data. These records are not real people or events.

For EACH case in the JSON array below, write a 3-4 sentence factual narrative
describing what allegedly happened, based ONLY on the fields given. Do not
invent facts not implied by the fields (e.g. don't add new weapons, new
locations, or outcomes not stated). Keep tone neutral and procedural, like an
actual FIR summary — not dramatic or sensational.

Return ONLY a JSON array, same order as input, each element:
{{"id": <id>, "narrative": "<3-4 sentence text>"}}
No markdown, no commentary, just the JSON array.

CASES:
{cases_json}
"""

def fetch_batch(db):
    rows = db.execute(text(SAMPLE_QUERY)).mappings().all()
    return [dict(r) for r in rows]

def to_json_safe(row):
    out = {}
    for k, v in row.items():
        if hasattr(v, "isoformat"):
            out[k] = v.isoformat()
        elif hasattr(v, "__float__"):
            out[k] = float(v)
        else:
            out[k] = v
    return out

def generate_for_batch(batch):
    cases_json = json.dumps([to_json_safe(r) for r in batch], default=str)
    prompt = PROMPT_TEMPLATE.format(cases_json=cases_json)

    for attempt in range(MAX_RETRIES):
        try:
            resp = model.generate_content(prompt)
            text_out = resp.text.strip()
            # Strip accidental markdown fences
            if text_out.startswith("```"):
                text_out = text_out.strip("`")
                text_out = text_out.split("\n", 1)[1] if "\n" in text_out else text_out
                if text_out.endswith("json"):
                    text_out = text_out[:-4]
            return json.loads(text_out)
        except ResourceExhausted:
            wait = 20 * (attempt + 1)
            print(f"  Quota hit, waiting {wait}s before retry...")
            time.sleep(wait)
        except json.JSONDecodeError as e:
            print(f"  Failed to parse Gemini response on attempt {attempt+1}: {e}")
            time.sleep(5)
    raise RuntimeError("Failed to generate narratives for this batch after retries.")

def main():
    db = SessionLocal()
    total_done = 0
    try:
        while total_done < TARGET_ROWS:
            all_pending = fetch_batch(db)
            if not all_pending:
                print("No more rows without a narrative. Done.")
                break

            batch = all_pending[:BATCH_SIZE]
            print(f"Processing batch of {len(batch)} (total so far: {total_done})...")

            try:
                results = generate_for_batch(batch)
            except RuntimeError as e:
                print(f"  Skipping this batch: {e}")
                continue

            result_map = {r["id"]: r["narrative"] for r in results if "id" in r and "narrative" in r}

            for row in batch:
                narrative = result_map.get(row["id"])
                if narrative:
                    db.execute(
                        text("UPDATE crimes SET case_narrative = :narrative WHERE id = :id"),
                        {"narrative": narrative, "id": row["id"]},
                    )
            db.commit()
            total_done += len(result_map)
            print(f"  Committed {len(result_map)} narratives.")
            time.sleep(2)  # gentle pacing between batches

        print(f"\nDone. Total narratives generated: {total_done}")
    finally:
        db.close()

if __name__ == "__main__":
    main()
