"""
Block Demands Router for SAVIAN Railway Block Scheduling System.
Provides CRUD and departmental filtering operations for maintenance demands.
"""

from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlmodel import Session, select

from app.database import get_session
from app.models import BlockDemand

router = APIRouter()


class DemandCreate(BaseModel):
    demand_code: Optional[str] = None
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
    machinery_type: Optional[str] = None
    machinery_id: Optional[str] = None
    status: str = "PROPOSED"
    trust_score: float = 1.0
    severity_tier: str = "MEDIUM"
    priority_weight: int = 50
    power_block_required: bool = False
    disconnection_required: bool = False
    speed_restriction_kmph: Optional[int] = None


class DemandUpdate(BaseModel):
    source_system: Optional[str] = None
    department: Optional[str] = None
    section_from: Optional[str] = None
    section_to: Optional[str] = None
    start_km: Optional[float] = None
    end_km: Optional[float] = None
    requested_date: Optional[str] = None
    requested_start_minutes: Optional[int] = None
    requested_end_minutes: Optional[int] = None
    required_minutes: Optional[int] = None
    activity_description: Optional[str] = None
    machinery_type: Optional[str] = None
    machinery_id: Optional[str] = None
    status: Optional[str] = None
    trust_score: Optional[float] = None
    severity_tier: Optional[str] = None
    priority_weight: Optional[int] = None
    power_block_required: Optional[bool] = None
    disconnection_required: Optional[bool] = None
    speed_restriction_kmph: Optional[int] = None


def _find_demand(demand_id: str, session: Session) -> BlockDemand:
    """Helper to locate demand by integer ID or demand_code string."""
    demand = None
    if demand_id.isdigit():
        demand = session.exec(select(BlockDemand).where(BlockDemand.id == int(demand_id))).first()
    if not demand:
        demand = session.exec(select(BlockDemand).where(BlockDemand.demand_code == demand_id)).first()
    if not demand:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"BlockDemand '{demand_id}' not found",
        )
    return demand


@router.get("/", response_model=List[BlockDemand], summary="List block demands with filters")
def list_demands(
    department: Optional[str] = Query(None, description="Filter by engineering dept (P_WAY, OHE, S_AND_T)"),
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by lifecycle status"),
    section_from: Optional[str] = Query(None, description="Filter by originating station code"),
    session: Session = Depends(get_session),
) -> List[BlockDemand]:
    """
    Retrieve all maintenance block demands matching the optional query filters.
    """
    query = select(BlockDemand)
    if department:
        query = query.where(BlockDemand.department == department.upper())
    if status_filter:
        query = query.where(BlockDemand.status == status_filter.upper())
    if section_from:
        query = query.where(BlockDemand.section_from == section_from.upper())

    return session.exec(query.order_by(BlockDemand.id)).all()


@router.post("/", response_model=BlockDemand, status_code=status.HTTP_201_CREATED, summary="Create new block demand")
def create_demand(
    demand_in: DemandCreate,
    session: Session = Depends(get_session),
) -> BlockDemand:
    """
    Submit a new maintenance block demand. Auto-generates demand_code if not supplied.
    """
    code = demand_in.demand_code
    if not code:
        ts = datetime.now(timezone.utc).strftime("%Y/%m")
        code = f"BDMS/WCR/BPL/{ts}/{uuid.uuid4().hex[:4].upper()}"

    demand = BlockDemand(
        demand_code=code,
        source_system=demand_in.source_system.upper(),
        department=demand_in.department.upper(),
        section_from=demand_in.section_from.upper(),
        section_to=demand_in.section_to.upper(),
        start_km=demand_in.start_km,
        end_km=demand_in.end_km,
        requested_date=demand_in.requested_date,
        requested_start_minutes=demand_in.requested_start_minutes,
        requested_end_minutes=demand_in.requested_end_minutes,
        required_minutes=demand_in.required_minutes,
        activity_description=demand_in.activity_description,
        machinery_type=demand_in.machinery_type,
        machinery_id=demand_in.machinery_id,
        status=demand_in.status.upper(),
        trust_score=demand_in.trust_score,
        severity_tier=demand_in.severity_tier.upper(),
        priority_weight=demand_in.priority_weight,
        power_block_required=demand_in.power_block_required,
        disconnection_required=demand_in.disconnection_required,
        speed_restriction_kmph=demand_in.speed_restriction_kmph,
    )

    session.add(demand)
    session.commit()
    session.refresh(demand)
    return demand


@router.get("/{demand_id:path}", response_model=BlockDemand, summary="Get single block demand")
def get_demand(
    demand_id: str,
    session: Session = Depends(get_session),
) -> BlockDemand:
    """Retrieve details for a single demand by ID or demand code."""
    return _find_demand(demand_id, session)


@router.put("/{demand_id:path}", response_model=BlockDemand, summary="Update block demand")
def update_demand(
    demand_id: str,
    demand_in: DemandUpdate,
    session: Session = Depends(get_session),
) -> BlockDemand:
    """Update fields of an existing block demand."""
    demand = _find_demand(demand_id, session)
    update_data = demand_in.model_dump(exclude_unset=True)

    for field_name, value in update_data.items():
        if value is not None:
            if isinstance(value, str) and field_name in ("department", "source_system", "section_from", "section_to", "status", "severity_tier"):
                value = value.upper()
            setattr(demand, field_name, value)

    session.add(demand)
    session.commit()
    session.refresh(demand)
    return demand


@router.delete("/{demand_id:path}", summary="Delete block demand")
def delete_demand(
    demand_id: str,
    session: Session = Depends(get_session),
) -> Dict[str, Any]:
    """Delete a block demand from the database."""
    demand = _find_demand(demand_id, session)
    demand_code = demand.demand_code
    session.delete(demand)
    session.commit()
    return {"status": "deleted", "demand_id": demand_id, "demand_code": demand_code}
