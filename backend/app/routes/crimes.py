from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import date
from ..database import get_db
from ..controllers import crime_controller
from ..middleware.auth_middleware import get_current_user
from ..models.user import User

router = APIRouter(prefix="/crimes", tags=["Crimes"])

class CreateCrimeRequest(BaseModel):
    fir_number: str
    crime_type: str
    district: str
    police_station: str
    incident_date: date
    case_narrative: str

    ipc_bns_sections: Optional[str] = None
    severity: Optional[str] = None
    location_description: Optional[str] = None
    weapon_used: Optional[str] = None
    accused_name: Optional[str] = None
    accused_age: Optional[int] = None
    accused_gender: Optional[str] = None
    accused_count: Optional[int] = 1
    is_juvenile_involved: Optional[bool] = False
    case_status: Optional[str] = "open"
    investigating_officer: Optional[str] = None

@router.post("/")
def create_case(
    body: CreateCrimeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    crime = crime_controller.create_crime(db, body.model_dump())
    return {
        "id": crime.id,
        "fir_number": crime.fir_number,
        "crime_type": crime.crime_type,
        "district": crime.district,
        "case_narrative": crime.case_narrative,
        "indexed": crime.narrative_embedding is not None,
    }