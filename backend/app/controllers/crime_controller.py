from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException
from ..models.crime import Crime
from ..services.rag_service import _get_embeddings

def create_crime(db: Session, data: dict) -> Crime:
    """
    Create a new crime case. The investigator-supplied narrative is embedded
    immediately using the local embedding model, so the case is searchable
    via similar-case RAG right away — no batch reprocessing needed.
    """
    crime = Crime(**{k: v for k, v in data.items() if k != "case_narrative"})
    crime.case_narrative = data.get("case_narrative")

    narrative = crime.case_narrative
    if narrative and narrative.strip():
        embeddings = _get_embeddings()
        vector = embeddings.embed_query(narrative)
        crime.narrative_embedding = vector

    db.add(crime)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"A case with FIR number '{data.get('fir_number')}' already exists.")

    db.refresh(crime)
    return crime