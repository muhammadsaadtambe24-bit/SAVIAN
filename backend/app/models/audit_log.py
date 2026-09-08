from datetime import datetime, timezone
from typing import Optional
from sqlmodel import Field, SQLModel


def get_current_utc_time() -> datetime:
    return datetime.now(timezone.utc)


class AuditLog(SQLModel, table=True):
    __tablename__ = "audit_log"

    id: Optional[int] = Field(default=None, primary_key=True)
    demand_id: int = Field(
        index=True,
        description="Associated BlockDemand ID",
    )
    demand_code: str = Field(
        index=True,
        description="Associated BlockDemand code",
    )
    from_stage: str = Field(
        description="Previous lifecycle stage/status",
    )
    to_stage: str = Field(
        description="New lifecycle stage/status",
    )
    actor_id: str = Field(
        description="Employee/officer or system identifier initiating action",
    )
    actor_role: str = Field(
        description="Designation / role of the actor (e.g. SrDOM, SectionController, SSE_PWAY)",
    )
    timestamp: datetime = Field(
        default_factory=get_current_utc_time,
        description="Timestamp when status change occurred",
    )
    justification: str = Field(
        description="Operational justification for approval, rejection, or modification",
    )
    delta_json: Optional[str] = Field(
        default=None,
        description="JSON diff of changed fields or configuration parameters",
    )
