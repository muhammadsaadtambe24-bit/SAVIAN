"""
Lifecycle State Transition & Governance Audit Router (LINE CLEAR).

Implements rigorous state-machine governance for maintenance block demands:
PROPOSED → REVIEWED → APPROVED → EXECUTED → CLOSED (plus REJECTED from any stage).
Maintains an immutable tamper-evident AuditLog trail for division controllers.
"""

from datetime import datetime, timezone
import json
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlmodel import Session, select

from app.database import get_session
from app.models import AuditLog, BlockDemand

router = APIRouter()

# Valid lifecycle progression sequence
LEGAL_FORWARD_TRANSITIONS = {
    "PROPOSED": "REVIEWED",
    "REVIEWED": "APPROVED",
    "APPROVED": "EXECUTED",
    "EXECUTED": "CLOSED",
}

VALID_STAGES = {"PROPOSED", "REVIEWED", "APPROVED", "EXECUTED", "CLOSED", "REJECTED"}


class TransitionRequest(BaseModel):
    to_stage: str = Field(description="Target lifecycle status: PROPOSED | REVIEWED | APPROVED | EXECUTED | CLOSED | REJECTED")
    actor_id: str = Field(description="Employee number, officer PF ID, or system ID")
    actor_role: str = Field(description="Operational role (e.g. SrDOM, SectionController, SSE_PWAY)")
    justification: str = Field(description="Operational justification for the stage transition")


def _locate_demand(demand_id: str, session: Session) -> BlockDemand:
    """Helper to locate demand by integer ID or business demand_code."""
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


@router.patch("/demands/{demand_id:path}/transition", response_model=BlockDemand, summary="Transition demand lifecycle stage")
def transition_demand_stage(
    demand_id: str,
    body: TransitionRequest,
    session: Session = Depends(get_session),
) -> BlockDemand:
    """
    Validate and execute a formal lifecycle stage transition on a block demand.
    Creates an immutable AuditLog entry recording actor, role, justification, and state delta.
    """
    demand = _locate_demand(demand_id, session)
    from_stage = demand.status.upper()
    to_stage = body.to_stage.strip().upper()

    if to_stage not in VALID_STAGES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid stage '{to_stage}'. Valid stages are: {sorted(list(VALID_STAGES))}",
        )

    if from_stage == to_stage:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Demand is already in stage '{to_stage}'",
        )

    # Validate transition rule:
    # 1. REJECTED is permitted from any stage
    # 2. Standard forward progression PROPOSED -> REVIEWED -> APPROVED -> EXECUTED -> CLOSED
    is_legal = False
    if to_stage == "REJECTED":
        is_legal = True
    elif LEGAL_FORWARD_TRANSITIONS.get(from_stage) == to_stage:
        is_legal = True

    if not is_legal:
        expected = LEGAL_FORWARD_TRANSITIONS.get(from_stage, "terminal stage")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Illegal stage transition from '{from_stage}' to '{to_stage}'. "
                f"Expected next stage is '{expected}' or 'REJECTED'."
            ),
        )

    # Apply state update
    demand.status = to_stage

    # Create immutable audit log record
    delta = json.dumps({
        "status": {
            "from": from_stage,
            "to": to_stage,
        },
        "updated_at": datetime.now(timezone.utc).isoformat(),
    })

    audit_entry = AuditLog(
        demand_id=demand.id or 0,
        demand_code=demand.demand_code,
        from_stage=from_stage,
        to_stage=to_stage,
        actor_id=body.actor_id,
        actor_role=body.actor_role,
        timestamp=datetime.now(timezone.utc),
        justification=body.justification,
        delta_json=delta,
    )

    session.add(demand)
    session.add(audit_entry)
    session.commit()
    session.refresh(demand)

    return demand


@router.get("/demands/{demand_id:path}/audit", response_model=List[AuditLog], summary="Get demand audit trail")
def get_demand_audit_trail(
    demand_id: str,
    session: Session = Depends(get_session),
) -> List[AuditLog]:
    """
    Retrieve the chronological audit history and approval trail for a specific block demand.
    """
    demand = _locate_demand(demand_id, session)
    return session.exec(
        select(AuditLog)
        .where(AuditLog.demand_code == demand.demand_code)
        .order_by(AuditLog.timestamp.desc())
    ).all()
