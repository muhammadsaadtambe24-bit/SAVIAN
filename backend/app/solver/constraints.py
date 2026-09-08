"""
Hard Constraints Module for Indian Railways Block Scheduling (SAVIAN).

Under Indian Railways General Rules (GR) and Block Working Manual:
1. No-Overlap per Track Section (GR 4.35 & Block Rules):
   Absolute block safety: No two trains or maintenance blocks may occupy the same
   station-to-station block section simultaneously.
2. Equipment Clash Prevention:
   High-value track machines (CSM, BCM, PQRS, TRT, Tower Wagons) cannot operate
   in two locations at once.
3. Power Block Containment (OHE Traction Cut):
   P-Way or S&T maintenance requiring overhead 25kV AC traction shutdown
   (power_block_required=True) must be temporally enclosed within an approved
   OHE department block on that section.
4. Integrated Corridor Block Coupling:
   Multi-disciplinary blocks (Civil/P-Way + Electrical/OHE + Signal/S&T) coordinated
   as joint mega-blocks must share synchronized commencement times.
"""

from collections import defaultdict
from typing import Any, Dict, List, Optional, Sequence, Tuple


def _canonical_section_id(section_from: str, section_to: str) -> str:
    """Return an order-independent canonical key for a station-to-station track section."""
    s1, s2 = str(section_from).strip().upper(), str(section_to).strip().upper()
    return f"{min(s1, s2)}-{max(s1, s2)}"


def add_no_overlap_per_section(
    model: Any,
    section_intervals: Dict[str, List[Any]],
) -> int:
    """
    Enforce the fundamental safety rule: No two track occupancies (train or block)
    may share the same section at the same time.

    Calls `model.AddNoOverlap(intervals)` for every track section having multiple intervals.

    Args:
        model: cp_model.CpModel instance.
        section_intervals: Mapping of section_id -> list of cp_model.IntervalVar objects.

    Returns:
        Number of track sections where AddNoOverlap was applied.
    """
    applied_sections = 0

    for section_id, intervals in section_intervals.items():
        if intervals and len(intervals) > 1:
            model.AddNoOverlap(intervals)
            applied_sections += 1

    return applied_sections


def add_equipment_clash_prevention(
    model: Any,
    demands: Sequence[Any],
    demand_intervals: Dict[str, Any],
) -> int:
    """
    Prevent equipment clashes: If two demands require the same machinery_id,
    they cannot overlap in time, even across different sections.

    Args:
        model: cp_model.CpModel instance.
        demands: Sequence of block demand inputs.
        demand_intervals: Mapping from demand_code -> cp_model.IntervalVar.

    Returns:
        Number of machinery groups constrained.
    """
    machinery_to_intervals: Dict[str, List[Any]] = defaultdict(list)

    for d in demands:
        m_id = getattr(d, "machinery_id", None)
        if m_id:
            m_id_str = str(m_id).strip().upper()
            # Ignore empty or placeholder strings
            if m_id_str not in ("", "NONE", "NULL", "N/A", "MANUAL"):
                code = getattr(d, "demand_code", None)
                if code and code in demand_intervals:
                    machinery_to_intervals[m_id_str].append(demand_intervals[code])

    clashes_prevented = 0
    for m_id, intervals in machinery_to_intervals.items():
        if len(intervals) > 1:
            model.AddNoOverlap(intervals)
            clashes_prevented += 1

    return clashes_prevented


def add_power_block_containment(
    model: Any,
    demands: Sequence[Any],
    demand_intervals: Dict[str, Any],
    demand_start_vars: Optional[Dict[str, Any]] = None,
    demand_end_vars: Optional[Dict[str, Any]] = None,
) -> int:
    """
    Enforce power block containment: If a demand requires a traction power cut
    (power_block_required=True) and is not itself an OHE block, its scheduled interval
    must be fully contained within a corresponding OHE department block on the same section:
        ohe_start <= demand_start  AND  demand_end <= ohe_end

    Args:
        model: cp_model.CpModel instance.
        demands: Sequence of block demand inputs.
        demand_intervals: Mapping from demand_code -> IntervalVar.
        demand_start_vars: Optional mapping from demand_code -> IntVar (start).
        demand_end_vars: Optional mapping from demand_code -> IntVar (end).

    Returns:
        Number of power block containment constraints enforced.
    """
    # Group OHE demands by canonical section
    ohe_by_section: Dict[str, List[Any]] = defaultdict(list)
    for d in demands:
        dept = str(getattr(d, "department", "")).upper()
        if dept == "OHE":
            sec_from = getattr(d, "section_from", "")
            sec_to = getattr(d, "section_to", "")
            sec_key = _canonical_section_id(sec_from, sec_to)
            ohe_by_section[sec_key].append(d)

    containment_count = 0

    for d in demands:
        dept = str(getattr(d, "department", "")).upper()
        power_required = bool(getattr(d, "power_block_required", False))

        # Only non-OHE demands requiring power block need to be nested in an OHE window
        if power_required and dept != "OHE":
            d_code = getattr(d, "demand_code", None)
            if not d_code or d_code not in demand_intervals:
                continue

            sec_from = getattr(d, "section_from", "")
            sec_to = getattr(d, "section_to", "")
            sec_key = _canonical_section_id(sec_from, sec_to)

            matching_ohe = ohe_by_section.get(sec_key, [])
            if not matching_ohe:
                # If no OHE demand exists on the same section, cannot contain; continue
                continue

            d_int = demand_intervals[d_code]
            d_start = demand_start_vars[d_code] if demand_start_vars else d_int.StartExpr()
            d_end = demand_end_vars[d_code] if demand_end_vars else d_int.EndExpr()

            if len(matching_ohe) == 1:
                # Direct containment in the single OHE block
                ohe_d = matching_ohe[0]
                ohe_code = getattr(ohe_d, "demand_code", None)
                if ohe_code and ohe_code in demand_intervals:
                    ohe_int = demand_intervals[ohe_code]
                    o_start = demand_start_vars[ohe_code] if demand_start_vars else ohe_int.StartExpr()
                    o_end = demand_end_vars[ohe_code] if demand_end_vars else ohe_int.EndExpr()

                    model.Add(o_start <= d_start)
                    model.Add(d_end <= o_end)
                    containment_count += 1
            else:
                # Multiple candidate OHE blocks: d must be contained in at least one
                candidate_booleans = []
                for idx, ohe_d in enumerate(matching_ohe):
                    ohe_code = getattr(ohe_d, "demand_code", None)
                    if ohe_code and ohe_code in demand_intervals:
                        ohe_int = demand_intervals[ohe_code]
                        o_start = demand_start_vars[ohe_code] if demand_start_vars else ohe_int.StartExpr()
                        o_end = demand_end_vars[ohe_code] if demand_end_vars else ohe_int.EndExpr()

                        b_in = model.NewBoolVar(f"power_nest_{d_code}_in_{ohe_code}_{idx}")
                        model.Add(o_start <= d_start).OnlyEnforceIf(b_in)
                        model.Add(d_end <= o_end).OnlyEnforceIf(b_in)
                        candidate_booleans.append(b_in)

                if candidate_booleans:
                    model.AddBoolOr(candidate_booleans)
                    containment_count += 1

    return containment_count


def add_integrated_block_coupling(
    model: Any,
    demands: Sequence[Any],
    demand_intervals: Dict[str, Any],
    demand_start_vars: Optional[Dict[str, Any]] = None,
) -> int:
    """
    Coupling constraint for integrated blocks: Demands marked as integrated
    must share the same start time (simultaneous block kickoff).

    Coupling applies when:
    - Demands share an `integrated_group_id`, OR
    - Demand specifies `integrated_with` equal to another demand's code, OR
    - Multiple demands have `is_integrated=True` on the same track section.

    Args:
        model: cp_model.CpModel instance.
        demands: Sequence of block demand inputs.
        demand_intervals: Mapping from demand_code -> IntervalVar.
        demand_start_vars: Optional mapping from demand_code -> IntVar (start).

    Returns:
        Number of integrated start couplings added.
    """
    def _get_start(code: str):
        if demand_start_vars and code in demand_start_vars:
            return demand_start_vars[code]
        if code in demand_intervals:
            return demand_intervals[code].StartExpr()
        return None

    couplings_count = 0

    # 1. Direct pairing via integrated_with
    code_to_demand = {getattr(d, "demand_code", ""): d for d in demands}
    for d in demands:
        target_code = getattr(d, "integrated_with", None)
        if target_code and target_code in code_to_demand:
            s1 = _get_start(getattr(d, "demand_code", ""))
            s2 = _get_start(target_code)
            if s1 is not None and s2 is not None:
                model.Add(s1 == s2)
                couplings_count += 1

    # 2. Grouping via integrated_group_id
    groups: Dict[str, List[Any]] = defaultdict(list)
    for d in demands:
        grp = getattr(d, "integrated_group_id", None)
        if grp:
            groups[str(grp)].append(d)

    for grp_id, grp_demands in groups.items():
        if len(grp_demands) > 1:
            first_start = _get_start(getattr(grp_demands[0], "demand_code", ""))
            for other_d in grp_demands[1:]:
                other_start = _get_start(getattr(other_d, "demand_code", ""))
                if first_start is not None and other_start is not None:
                    model.Add(first_start == other_start)
                    couplings_count += 1

    # 3. Demands with is_integrated=True on the same section
    section_integrated: Dict[str, List[Any]] = defaultdict(list)
    for d in demands:
        if bool(getattr(d, "is_integrated", False)):
            sec_from = getattr(d, "section_from", "")
            sec_to = getattr(d, "section_to", "")
            sec_key = _canonical_section_id(sec_from, sec_to)
            section_integrated[sec_key].append(d)

    for sec_key, sec_demands in section_integrated.items():
        if len(sec_demands) > 1:
            leader_start = _get_start(getattr(sec_demands[0], "demand_code", ""))
            for member in sec_demands[1:]:
                member_start = _get_start(getattr(member, "demand_code", ""))
                if leader_start is not None and member_start is not None:
                    model.Add(leader_start == member_start)
                    couplings_count += 1

    return couplings_count
