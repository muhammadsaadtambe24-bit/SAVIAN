"""
Shadow Block Opportunity Detection Service (LINE CLEAR).

Identifies inter-departmental co-utilization opportunities where engineering
demands (P-Way, OHE, S&T) on the same or adjacent track sections can be merged
into a single corridor possession window, avoiding duplicate track closures and
multiplying crew productivity.
"""

from typing import Any, Dict, List, Sequence, Union


def _canonical_section(s1: str, s2: str) -> str:
    """Return canonical sorted station pair representation, e.g. BHS-DWG."""
    a, b = sorted([str(s1 or "").strip().upper(), str(s2 or "").strip().upper()])
    return f"{a}-{b}"


def _is_section_compatible(d1: Any, d2: Any) -> bool:
    """Check if two demands are on identical, overlapping, or adjacent sections."""
    sec1 = _canonical_section(getattr(d1, "section_from", ""), getattr(d1, "section_to", ""))
    sec2 = _canonical_section(getattr(d2, "section_from", ""), getattr(d2, "section_to", ""))

    if sec1 == sec2:
        return True

    st1 = {str(getattr(d1, "section_from", "")).upper(), str(getattr(d1, "section_to", "")).upper()}
    st2 = {str(getattr(d2, "section_from", "")).upper(), str(getattr(d2, "section_to", "")).upper()}
    if st1 & st2:
        return True

    # Check chainage overlap
    start1 = getattr(d1, "start_km", 0.0)
    end1 = getattr(d1, "end_km", 0.0)
    start2 = getattr(d2, "start_km", 0.0)
    end2 = getattr(d2, "end_km", 0.0)

    min_km1, max_km1 = min(start1, end1), max(start1, end1)
    min_km2, max_km2 = min(start2, end2), max(start2, end2)

    return max(min_km1, min_km2) < min(max_km1, max_km2)


def detect_shadow_opportunities(demands: Sequence[Any]) -> List[Dict[str, Any]]:
    """
    Find pairs of demands from different departments on adjacent or overlapping
    sections that could share a corridor-night possession.

    Args:
        demands: Sequence of BlockDemand models or demand input dictionaries.

    Returns:
        List of shadow opportunity dictionaries:
        [{
            "primary_id": int | str,
            "shadow_id": int | str,
            "primary_code": str,
            "shadow_code": str,
            "primary_dept": str,
            "shadow_dept": str,
            "section": str,
            "overlap_minutes": int,
            "mobilization_hours_saved": float
        }]
    """
    opportunities: List[Dict[str, Any]] = []
    n = len(demands)

    for i in range(n):
        d1 = demands[i]
        dept1 = getattr(d1, "department", None) if not isinstance(d1, dict) else d1.get("department")
        id1 = getattr(d1, "id", i + 1) if not isinstance(d1, dict) else d1.get("id", i + 1)
        code1 = getattr(d1, "demand_code", f"DEM-{i}") if not isinstance(d1, dict) else d1.get("demand_code", f"DEM-{i}")
        s1 = getattr(d1, "requested_start_minutes", 0) if not isinstance(d1, dict) else d1.get("requested_start_minutes", 0)
        e1 = getattr(d1, "requested_end_minutes", 120) if not isinstance(d1, dict) else d1.get("requested_end_minutes", 120)
        dur1 = getattr(d1, "required_minutes", e1 - s1) if not isinstance(d1, dict) else d1.get("required_minutes", e1 - s1)
        prio1 = getattr(d1, "priority_weight", 50) if not isinstance(d1, dict) else d1.get("priority_weight", 50)

        for j in range(i + 1, n):
            d2 = demands[j]
            dept2 = getattr(d2, "department", None) if not isinstance(d2, dict) else d2.get("department")
            id2 = getattr(d2, "id", j + 1) if not isinstance(d2, dict) else d2.get("id", j + 1)
            code2 = getattr(d2, "demand_code", f"DEM-{j}") if not isinstance(d2, dict) else d2.get("demand_code", f"DEM-{j}")
            s2 = getattr(d2, "requested_start_minutes", 0) if not isinstance(d2, dict) else d2.get("requested_start_minutes", 0)
            e2 = getattr(d2, "requested_end_minutes", 120) if not isinstance(d2, dict) else d2.get("requested_end_minutes", 120)
            dur2 = getattr(d2, "required_minutes", e2 - s2) if not isinstance(d2, dict) else d2.get("required_minutes", e2 - s2)
            prio2 = getattr(d2, "priority_weight", 50) if not isinstance(d2, dict) else d2.get("priority_weight", 50)

            # Must be from different engineering departments
            if str(dept1).upper() == str(dept2).upper():
                continue

            # Check section proximity or overlap
            if not _is_section_compatible(d1, d2):
                continue

            # Check time compatibility (overlap or within 240 minutes of each other)
            time_overlap = max(0, min(e1, e2) - max(s1, s2))
            within_proximity = abs(s1 - s2) <= 240

            # Both fall within night or standard window
            if time_overlap > 0 or within_proximity:
                effective_overlap = time_overlap if time_overlap > 0 else min(dur1, dur2)

                # Designate primary vs shadow (longer duration or higher priority is primary)
                if (dur1, prio1) >= (dur2, prio2):
                    p_id, s_id = id1, id2
                    p_code, s_code = code1, code2
                    p_dept, s_dept = dept1, dept2
                else:
                    p_id, s_id = id2, id1
                    p_code, s_code = code2, code1
                    p_dept, s_dept = dept2, dept1

                # Each shadow block saves separate track possession mobilization,
                # section locking, and clearance overhead (typically 1.5 to 2.5 hours)
                hours_saved = round(max(1.5, min(3.0, effective_overlap / 60.0)), 2)

                sec_name = f"{getattr(d1, 'section_from', '')}-{getattr(d1, 'section_to', '')}"

                opportunities.append({
                    "primary_id": p_id,
                    "shadow_id": s_id,
                    "primary_code": p_code,
                    "shadow_code": s_code,
                    "primary_dept": p_dept,
                    "shadow_dept": s_dept,
                    "section": sec_name,
                    "overlap_minutes": int(effective_overlap),
                    "mobilization_hours_saved": hours_saved,
                })

    return opportunities
