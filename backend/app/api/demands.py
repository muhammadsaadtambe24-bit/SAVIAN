from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.models.demand import DemandModel
from app.schemas.demand import DemandCreate, DemandUpdate, DemandResponse
from app.services.trust_scorer import TrustWeightedScorer

router = APIRouter(prefix="/demands", tags=["Block Demands (TMS/SMMS/TDMS)"])

# Initial baseline seed data for Bina - Itarsi corridor if database is fresh
DEFAULT_SEEDS = [
    {
        "id": 1,
        "demand_code": "TMS-2026-081",
        "source_system": "TMS",
        "department": "P_WAY",
        "section_from": "BINA",
        "section_to": "KIKA",
        "start_km": 2.5,
        "end_km": 8.0,
        "requested_date": "2026-09-10",
        "requested_start_minutes": 120,
        "requested_end_minutes": 270,
        "required_minutes": 150,
        "activity_description": "BCM Deep Screening & Ballast Cleaning Machine occupation",
        "machinery_type": "BCM Ballast Cleaner",
        "machinery_id": "BCM-08",
        "status": "APPROVED",
        "trust_score": 94.0,
        "severity_tier": "CRITICAL",
        "priority_weight": 9.5,
        "power_block_required": True,
        "disconnection_required": True
    },
    {
        "id": 2,
        "demand_code": "SMMS-2026-114",
        "source_system": "SMMS",
        "department": "OHE",
        "section_from": "BINA",
        "section_to": "KIKA",
        "start_km": 3.0,
        "end_km": 7.5,
        "requested_date": "2026-09-10",
        "requested_start_minutes": 130,
        "requested_end_minutes": 250,
        "required_minutes": 120,
        "activity_description": "Cantilever inspection & contact wire adjustment (Shadow with TMS)",
        "machinery_type": "Tower Wagon 8-Wheeler",
        "machinery_id": "TW-402",
        "status": "APPROVED",
        "trust_score": 91.0,
        "severity_tier": "HIGH",
        "priority_weight": 8.0,
        "power_block_required": True,
        "disconnection_required": False
    },
    {
        "id": 3,
        "demand_code": "TDMS-2026-219",
        "source_system": "TDMS",
        "department": "S_AND_T",
        "section_from": "BAQ",
        "section_to": "GLG",
        "start_km": 32.0,
        "end_km": 44.0,
        "requested_date": "2026-09-10",
        "requested_start_minutes": 300,
        "requested_end_minutes": 420,
        "required_minutes": 120,
        "activity_description": "Digital Axle Counter (DAC) testing & point machine renewal",
        "machinery_type": "Signal Test Coach",
        "machinery_id": "STC-12",
        "status": "REVIEWED",
        "trust_score": 88.0,
        "severity_tier": "MEDIUM",
        "priority_weight": 6.0,
        "power_block_required": False,
        "disconnection_required": True
    },
    {
        "id": 4,
        "demand_code": "TMS-2026-042",
        "source_system": "TMS",
        "department": "P_WAY",
        "section_from": "BPL",
        "section_to": "MDDP",
        "start_km": 94.0,
        "end_km": 110.0,
        "requested_date": "2026-09-10",
        "requested_start_minutes": 660,
        "requested_end_minutes": 780,
        "required_minutes": 120,
        "activity_description": "Plain track tamping by 09-3X CSM Machine",
        "machinery_type": "CSM Tamping Machine",
        "machinery_id": "CSM-14",
        "status": "PROPOSED",
        "trust_score": 96.0,
        "severity_tier": "HIGH",
        "priority_weight": 8.5,
        "power_block_required": False,
        "disconnection_required": False
    }
]

def ensure_seed_data(db: Session):
    if db.query(DemandModel).count() == 0:
        for seed in DEFAULT_SEEDS:
            db_item = DemandModel(**seed)
            db.add(db_item)
        db.commit()

@router.get("", response_model=List[DemandResponse])
def get_demands(
    department: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    ensure_seed_data(db)
    query = db.query(DemandModel)
    if department and department != "ALL":
        query = query.filter(DemandModel.department == department)
    if status and status != "ALL":
        query = query.filter(DemandModel.status == status)
    return query.order_by(DemandModel.id.desc()).all()

@router.post("", response_model=DemandResponse)
def create_demand(demand_in: DemandCreate, db: Session = Depends(get_db)):
    # Auto-calculate trust score via sensor confidence fusion
    computed_trust = TrustWeightedScorer.calculate_trust()
    data = demand_in.model_dump()
    data["trust_score"] = computed_trust
    
    db_demand = DemandModel(**data)
    db.add(db_demand)
    db.commit()
    db.refresh(db_demand)
    return db_demand

@router.put("/{demand_id}", response_model=DemandResponse)
def update_demand(demand_id: int, demand_in: DemandUpdate, db: Session = Depends(get_db)):
    db_demand = db.query(DemandModel).filter(DemandModel.id == demand_id).first()
    if not db_demand:
        raise HTTPException(status_code=404, detail="Demand not found")
    
    update_data = demand_in.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(db_demand, field, val)
        
    db.commit()
    db.refresh(db_demand)
    return db_demand

@router.delete("/{demand_id}")
def delete_demand(demand_id: int, db: Session = Depends(get_db)):
    db_demand = db.query(DemandModel).filter(DemandModel.id == demand_id).first()
    if not db_demand:
        raise HTTPException(status_code=404, detail="Demand not found")
    db.delete(db_demand)
    db.commit()
    return {"message": f"Demand {db_demand.demand_code} successfully withdrawn"}
