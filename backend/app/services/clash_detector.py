"""
Clash Detection Service for Indian Railways Block Scheduling (LINE CLEAR).

Evaluates schedules for:
1. Section Overlaps: Train and maintenance block occupying the same track section simultaneously.
2. Equipment Conflicts: Multiple blocks concurrently allocated the same track machine asset.
3. Power Block Violations: Electric trains traversing a section where 25kV traction power is isolated.
"""

import json
from typing import Any, Dict, List, Optional, Tuple, Union


def _canonical_section(s1: str, s2: str) -> str:
    """Return canonical sorted station pair representation, e.g. BHS-DWG."""
    a, b = sorted([str(s1 or "").strip().upper(), str(s2 or "").strip().upper()])
    return f"{a}-{b}"


def _parse_path(path_val: Any) -> List[Dict[str, Any]]:
    """Parse timetable path into a list of station stop dicts."""
    if isinstance(path_val, list):
        return path_val
    if isinstance(path_val, str) and path_val.strip():
        try:
            parsed = json.loads(path_val)
            if isinstance(parsed, list):
                return parsed
        except Exception:
            return []
    return []


def detect_clashes(schedule: Union[Dict[str, Any], Any]) -> List[Dict[str, Any]]:
    """
    Check a schedule for section overlaps, equipment conflicts, and power block violations.

    Args:
        schedule: Dictionary or object containing `granted_blocks` and `train_schedules` (or `trains`).

    Returns:
        List of clash dictionaries:
        [{
            "type": "SECTION_OVERLAP" | "EQUIPMENT_CONFLICT" | "POWER_BLOCK_VIOLATION",
            "entity_a": str,
            "entity_b": str,
            "section": str,
            "overlap_minutes": int,
            "severity": "CRITICAL" | "HIGH" | "MEDIUM"
        }]
    """
    if isinstance(schedule, dict):
        blocks = schedule.get("granted_blocks", [])
        trains = schedule.get("train_schedules", schedule.get("trains", []))
    else:
        blocks = getattr(schedule, "granted_blocks", [])
        trains = getattr(schedule, "train_schedules", getattr(schedule, "trains", []))

    clashes: List[Dict[str, Any]] = []

    # --------------------------------------------------------------------------
    # 1. Equipment Conflicts (Same machine double-booked in overlapping time)
    # --------------------------------------------------------------------------
    for i in range(len(blocks)):
        b1 = blocks[i]
        m1 = getattr(b1, "machinery_id", None) if not isinstance(b1, dict) else b1.get("machinery_id")
        if not m1:
            continue

        s1 = getattr(b1, "granted_start_minutes", None) if not isinstance(b1, dict) else b1.get("granted_start_minutes")
        e1 = getattr(b1, "granted_end_minutes", None) if not isinstance(b1, dict) else b1.get("granted_end_minutes")
        c1 = getattr(b1, "demand_code", f"Demand-{i}") if not isinstance(b1, dict) else b1.get("demand_code", f"Demand-{i}")
        sec1_from = getattr(b1, "section_from", "") if not isinstance(b1, dict) else b1.get("section_from", "")
        sec1_to = getattr(b1, "section_to", "") if not isinstance(b1, dict) else b1.get("section_to", "")

        for j in range(i + 1, len(blocks)):
            b2 = blocks[j]
            m2 = getattr(b2, "machinery_id", None) if not isinstance(b2, dict) else b2.get("machinery_id")
            if not m2 or str(m1).strip().upper() != str(m2).strip().upper():
                continue

            s2 = getattr(b2, "granted_start_minutes", None) if not isinstance(b2, dict) else b2.get("granted_start_minutes")
            e2 = getattr(b2, "granted_end_minutes", None) if not isinstance(b2, dict) else b2.get("granted_end_minutes")
            c2 = getattr(b2, "demand_code", f"Demand-{j}") if not isinstance(b2, dict) else b2.get("demand_code", f"Demand-{j}")
            sec2_from = getattr(b2, "section_from", "") if not isinstance(b2, dict) else b2.get("section_from", "")
            sec2_to = getattr(b2, "section_to", "") if not isinstance(b2, dict) else b2.get("section_to", "")

            if s1 is None or e1 is None or s2 is None or e2 is None:
                continue

            overlap = min(e1, e2) - max(s1, s2)
            if overlap > 0:
                clashes.append({
                    "type": "EQUIPMENT_CONFLICT",
                    "entity_a": f"Block {c1} (Machinery: {m1})",
                    "entity_b": f"Block {c2} (Machinery: {m2})",
                    "section": f"{sec1_from}-{sec1_to} / {sec2_from}-{sec2_to}",
                    "overlap_minutes": int(overlap),
                    "severity": "HIGH",
                })

    # --------------------------------------------------------------------------
    # 2. Extract Train Section Occupancies
    # --------------------------------------------------------------------------
    # Format: list of (train_num, train_name, direction, canonical_sec, t_start, t_end, is_electric)
    train_occupancies = []
    for t in trains:
        t_num = getattr(t, "train_number", "") if not isinstance(t, dict) else t.get("train_number", "")
        t_name = getattr(t, "train_name", "") if not isinstance(t, dict) else t.get("train_name", "")
        t_dir = getattr(t, "direction", "UP") if not isinstance(t, dict) else t.get("direction", "UP")
        delay = getattr(t, "delay_minutes", 0) if not isinstance(t, dict) else t.get("delay_minutes", 0)
        delay = int(delay or 0)

        path = getattr(t, "path", None) if not isinstance(t, dict) else t.get("path")
        if not path:
            path_json = getattr(t, "path_json", None) if not isinstance(t, dict) else t.get("path_json")
            path = _parse_path(path_json)
        else:
            path = _parse_path(path)

        if not path or len(path) < 2:
            continue

        for k in range(len(path) - 1):
            st1 = path[k].get("station_code", "")
            st2 = path[k + 1].get("station_code", "")
            if not st1 or not st2:
                continue

            sec_id = _canonical_section(st1, st2)
            t_dep = int(path[k].get("departure_minutes", path[k].get("arrival_minutes", 0))) + delay
            t_arr = int(path[k + 1].get("arrival_minutes", path[k + 1].get("departure_minutes", t_dep + 5))) + delay
            t_start = min(t_dep, t_arr)
            t_end = max(t_dep, t_arr)
            if t_end == t_start:
                t_end = t_start + 5

            train_occupancies.append({
                "train_number": t_num,
                "train_name": t_name,
                "direction": str(t_dir).upper(),
                "section": sec_id,
                "start": t_start,
                "end": t_end,
            })

    # --------------------------------------------------------------------------
    # 3. Section Overlaps & Power Block Violations (Train vs Granted Block)
    # --------------------------------------------------------------------------
    for b in blocks:
        b_code = getattr(b, "demand_code", "DEMAND") if not isinstance(b, dict) else b.get("demand_code", "DEMAND")
        b_sec_from = getattr(b, "section_from", "") if not isinstance(b, dict) else b.get("section_from", "")
        b_sec_to = getattr(b, "section_to", "") if not isinstance(b, dict) else b.get("section_to", "")
        b_sec = _canonical_section(b_sec_from, b_sec_to)

        b_start = getattr(b, "granted_start_minutes", None) if not isinstance(b, dict) else b.get("granted_start_minutes")
        b_end = getattr(b, "granted_end_minutes", None) if not isinstance(b, dict) else b.get("granted_end_minutes")
        if b_start is None or b_end is None:
            continue

        pwr_req = getattr(b, "power_block_required", False) if not isinstance(b, dict) else b.get("power_block_required", False)
        b_dept = getattr(b, "department", "CIVIL") if not isinstance(b, dict) else b.get("department", "CIVIL")

        # Determine block direction if available
        b_dir = getattr(b, "direction", None) if not isinstance(b, dict) else b.get("direction")
        if not b_dir:
            desc = (getattr(b, "activity_description", "") if not isinstance(b, dict) else b.get("activity_description", "")) or ""
            if "DOWN" in desc.upper():
                b_dir = "DOWN"
            elif "UP" in desc.upper():
                b_dir = "UP"
            else:
                b_dir = "BOTH"
        b_dir = str(b_dir).upper()

        for tr_occ in train_occupancies:
            if tr_occ["section"] != b_sec:
                continue

            # Track direction matching
            if b_dir != "BOTH" and tr_occ["direction"] != b_dir:
                continue

            overlap = min(b_end, tr_occ["end"]) - max(b_start, tr_occ["start"])
            if overlap > 0:
                # Direct Section Overlap Clash
                clashes.append({
                    "type": "SECTION_OVERLAP",
                    "entity_a": f"Train {tr_occ['train_number']} ({tr_occ['train_name']})",
                    "entity_b": f"Block {b_code} ({b_dept})",
                    "section": b_sec,
                    "overlap_minutes": int(overlap),
                    "severity": "CRITICAL",
                })

                # Power Block Violation (Traction Cut while train running)
                if pwr_req:
                    clashes.append({
                        "type": "POWER_BLOCK_VIOLATION",
                        "entity_a": f"Train {tr_occ['train_number']} ({tr_occ['train_name']})",
                        "entity_b": f"Power Block {b_code} ({b_dept})",
                        "section": b_sec,
                        "overlap_minutes": int(overlap),
                        "severity": "CRITICAL",
                    })

    return clashes
