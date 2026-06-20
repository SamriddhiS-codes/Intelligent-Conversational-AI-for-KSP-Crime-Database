from sqlalchemy import Column, Integer, String, Date, DateTime, Boolean, Numeric, ForeignKey, Text, func
from ..database import Base

class PoliceStation(Base):
    __tablename__ = "police_stations"

    id = Column(Integer, primary_key=True)
    name = Column(Text, nullable=False)
    district = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Crime(Base):
    __tablename__ = "crimes"

    id = Column(Integer, primary_key=True)
    fir_number = Column(Text, unique=True, nullable=False)
    crime_type = Column(Text, nullable=False)
    ipc_bns_sections = Column(Text)
    severity = Column(Text)

    incident_date = Column(Date)
    report_date = Column(Date)

    district = Column(Text)
    police_station = Column(Text)
    location_description = Column(Text)
    latitude = Column(Numeric(9, 6))
    longitude = Column(Numeric(9, 6))

    complainant_name = Column(Text)
    complainant_age = Column(Integer)
    complainant_gender = Column(Text)
    complainant_contact = Column(Text)

    accused_name = Column(Text)
    accused_age = Column(Integer)
    accused_gender = Column(Text)
    accused_count = Column(Integer, default=1)
    weapon_used = Column(Text)
    is_juvenile_involved = Column(Boolean, default=False)

    case_status = Column(Text, default="open")
    case_outcome = Column(Text)
    property_loss_inr = Column(Numeric(12, 2))
    investigating_officer = Column(Text)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    station_id = Column(Integer, ForeignKey("police_stations.id"), nullable=True)
