from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from ..database import get_db
from ..controllers import analytics_controller
from ..middleware.auth_middleware import get_current_user
from ..models.user import User

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/hotspots")
def hotspots(
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return analytics_controller.get_hotspots(db, limit)

@router.get("/trends")
def trends(
    district: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return analytics_controller.get_crime_trends(db, district)

@router.get("/by-district")
def by_district(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return analytics_controller.get_crime_by_district(db)

@router.get("/crime-types")
def crime_types(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return analytics_controller.get_crime_type_breakdown(db)

@router.get("/network")
def network(
    crime_type: Optional[str] = None,
    district: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return analytics_controller.get_network_data(db, crime_type, district)
