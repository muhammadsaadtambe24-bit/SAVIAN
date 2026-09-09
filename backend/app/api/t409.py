from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.audit_log import AuditLogModel
from app.schemas.t409 import T409Request, T409Response
from app.services.t409_generator import T409Generator

router = APIRouter(prefix="/t409", tags=["Form T/409 Authority & RDSO Audit"])

@router.post("/generate", response_model=T409Response)
def generate_t409_authority(req: T409Request, db: Session = Depends(get_db)):
    """
    Generates official Indian Railways Form T/409 Caution Order & Line-Clear
    Statutory Token and commits to the immutable RDSO compliance ledger.
    """
    token_dict = T409Generator.generate_token(
        demand_id=req.demand_id,
        demand_code=req.demand_code,
        section_from=req.section_from,
        section_to=req.section_to,
        start_km=req.start_km,
        end_km=req.end_km,
        machinery=req.machinery_type,
        start_min=req.requested_start_minutes,
        end_min=req.requested_end_minutes,
        power_block=req.power_block_required
    )

    # Persist in immutable RDSO compliance audit ledger
    audit_entry = AuditLogModel(
        token_id=token_dict["auth_number"],
        demand_code=req.demand_code,
        event_type="LINE_CLEAR_GRANTED",
        kavach_hash=token_dict["kavach_hash"],
        section=token_dict["section"],
        operator=f"{req.station_master} & {req.section_controller}",
        payload_snapshot=str(token_dict)
    )
    db.add(audit_entry)
    db.commit()

    return T409Response(**token_dict)

@router.get("/ledger")
def get_rdso_audit_ledger(db: Session = Depends(get_db)):
    """
    Fetches the immutable RDSO compliance audit trail for corridor possessions.
    """
    records = db.query(AuditLogModel).order_by(AuditLogModel.id.desc()).all()
    return records
