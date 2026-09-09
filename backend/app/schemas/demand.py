from pydantic import BaseModel
from typing import Optional

class DemandBase(BaseModel):
    demand_code: str
    source_system: str
    department: str
    section_from: str
    section_to: str
    start_km: float
    end_km: float
    requested_date: str
    requested_start_minutes: int
    requested_end_minutes: int
    required_minutes: int
    activity_description: str
    machinery_type: str
    machinery_id: Optional[str] = None
    status: str = "PROPOSED"
    trust_score: float = 90.0
    severity_tier: str = "HIGH"
    priority_weight: float = 7.5
    power_block_required: bool = False
    disconnection_required: bool = False

class DemandCreate(DemandBase):
    pass

class DemandUpdate(BaseModel):
    status: Optional[str] = None
    activity_description: Optional[str] = None
    required_minutes: Optional[int] = None
    requested_start_minutes: Optional[int] = None
    requested_end_minutes: Optional[int] = None
    trust_score: Optional[float] = None
    severity_tier: Optional[str] = None

class DemandResponse(DemandBase):
    id: int

    class Config:
        from_attributes = True
