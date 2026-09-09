from sqlalchemy import Column, Integer, String, Float, Boolean, Date, Text
from app.core.database import Base

class DemandModel(Base):
    __tablename__ = "block_demands"

    id = Column(Integer, primary_key=True, index=True)
    demand_code = Column(String(50), unique=True, index=True, nullable=False)
    source_system = Column(String(20), nullable=False)  # TMS, SMMS, TDMS
    department = Column(String(20), nullable=False)     # P_WAY, OHE, S_AND_T
    section_from = Column(String(10), nullable=False)
    section_to = Column(String(10), nullable=False)
    start_km = Column(Float, nullable=False)
    end_km = Column(Float, nullable=False)
    requested_date = Column(String(20), nullable=False)
    requested_start_minutes = Column(Integer, nullable=False)
    requested_end_minutes = Column(Integer, nullable=False)
    required_minutes = Column(Integer, nullable=False)
    activity_description = Column(Text, nullable=False)
    machinery_type = Column(String(50), nullable=False)
    machinery_id = Column(String(50), nullable=True)
    status = Column(String(20), default="PROPOSED", nullable=False)  # PROPOSED, REVIEWED, APPROVED, EXECUTED, CLOSED
    trust_score = Column(Float, default=90.0)
    severity_tier = Column(String(20), default="HIGH")              # CRITICAL, HIGH, MEDIUM, LOW
    priority_weight = Column(Float, default=7.5)
    power_block_required = Column(Boolean, default=False)
    disconnection_required = Column(Boolean, default=False)
