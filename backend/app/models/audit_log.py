from sqlalchemy import Column, Integer, String, DateTime, Text
from datetime import datetime
from app.core.database import Base

class AuditLogModel(Base):
    __tablename__ = "rdso_audit_ledger"

    id = Column(Integer, primary_key=True, index=True)
    token_id = Column(String(100), unique=True, index=True, nullable=False)
    demand_code = Column(String(50), index=True, nullable=False)
    event_type = Column(String(50), nullable=False)  # LINE_CLEAR_GRANTED, KAVACH_SIL4_CHECK, COALIGN_HARMONIZED
    kavach_hash = Column(String(128), nullable=False)
    section = Column(String(50), nullable=False)
    operator = Column(String(100), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)
    payload_snapshot = Column(Text, nullable=True)
