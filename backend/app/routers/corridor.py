"""
Corridor Infrastructure Router for SAVIAN Railway Block Scheduling System.
Provides stations chainage data and adjacent track section Kavach ATP deployment status.
"""

from typing import Any, Dict, List
from fastapi import APIRouter, Depends
from sqlmodel import Session, select

from app.database import get_session
from app.models import Station

router = APIRouter()


@router.get("/stations", response_model=List[Station], summary="List corridor stations")
def list_stations(session: Session = Depends(get_session)) -> List[Station]:
    """
    Retrieve all stations along the Bina–Itarsi corridor ordered by chainage (distance_km).
    """
    return session.exec(select(Station).order_by(Station.distance_km)).all()


@router.get("/sections", response_model=List[Dict[str, Any]], summary="List corridor section pairs")
def list_sections(session: Session = Depends(get_session)) -> List[Dict[str, Any]]:
    """
    Retrieve adjacent station pairs (track block sections) with their length
    and Automatic Train Protection (Kavach) deployment status.
    """
    stations = session.exec(select(Station).order_by(Station.distance_km)).all()
    sections: List[Dict[str, Any]] = []

    for i in range(len(stations) - 1):
        s1 = stations[i]
        s2 = stations[i + 1]

        # Determine section Kavach status
        if s1.kavach_status == "COMMISSIONED" and s2.kavach_status == "COMMISSIONED":
            sec_kavach = "COMMISSIONED"
        elif "IN_TRIALS" in (s1.kavach_status, s2.kavach_status):
            sec_kavach = "IN_TRIALS"
        elif "COMMISSIONED" in (s1.kavach_status, s2.kavach_status):
            sec_kavach = "IN_TRIALS"
        else:
            sec_kavach = "NOT_EQUIPPED"

        length = round(abs(s2.distance_km - s1.distance_km), 2)
        sections.append({
            "section_id": f"{s1.code}-{s2.code}",
            "station_from": s1.code,
            "station_to": s2.code,
            "station_from_name": s1.name,
            "station_to_name": s2.name,
            "start_km": s1.distance_km,
            "end_km": s2.distance_km,
            "length_km": length,
            "kavach_status": sec_kavach,
            "division": s1.division,
            "zone": s1.zone,
        })

    return sections
