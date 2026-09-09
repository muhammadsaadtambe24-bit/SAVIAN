from pydantic import BaseModel
from typing import Optional

class T409Request(BaseModel):
    demand_id: int
    demand_code: str
    section_from: str
    section_to: str
    start_km: float
    end_km: float
    machinery_type: str
    machinery_id: Optional[str] = "BCM-08"
    power_block_required: bool = True
    disconnection_required: bool = True
    requested_start_minutes: int
    requested_end_minutes: int
    required_minutes: int
    station_master: str = "Station Master / BINA"
    section_controller: str = "Sr. DOM (Coaching) / BPL"

class T409Response(BaseModel):
    auth_number: str
    kavach_hash: str
    status: str
    issue_time: str
    demand_code: str
    section: str
    chainage: str
    traction_cutoff: str
    kavach_buffer: str
    signoff: str
