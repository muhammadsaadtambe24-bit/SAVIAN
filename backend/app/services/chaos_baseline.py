"""
Chaos Baseline Scheduling Service (LINE CLEAR).

Simulates the legacy manual or naive FIFO block scheduling practice:
- Demands are granted in strict arrival order at their exact requested times without deconfliction.
- Trains are scheduled without dynamic holding, leading to severe physical clashes,
  safety violations, and equipment deadlocks.
"""

import json
from typing import Any, Dict, List, Sequence, Union
import uuid

from app.services.clash_detector import detect_clashes
from app.solver.speed_debt import calculate_speed_debt


def _parse_path(path_val: Any) -> List[Dict[str, Any]]:
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


def run_chaos_baseline(
    trains: Sequence[Any],
    demands: Sequence[Any],
) -> Dict[str, Any]:
    """
    Execute naive FIFO scheduler:
    Assigns each demand its requested window without checking for conflicts.
    Returns the exact same result schema as RailwayBlockScheduler.solve(),
    with detected clashes and operational friction exposed.

    Args:
        trains: Sequence of TrainSlot instances or train dictionaries.
        demands: Sequence of BlockDemand instances or demand dictionaries.

    Returns:
        Result dictionary mirroring the solver engine's output schema.
    """
    solve_id = f"chaos-{uuid.uuid4()}"
    granted_blocks: List[Dict[str, Any]] = []
    train_schedules: List[Dict[str, Any]] = []
    explanations: List[str] = []

    total_speed_debt = 0.0
    night_blocks_count = 0

    # 1. FIFO naive assignment for block demands
    for d in demands:
        d_id = getattr(d, "id", None) if not isinstance(d, dict) else d.get("id")
        d_code = getattr(d, "demand_code", "") if not isinstance(d, dict) else d.get("demand_code", "")
        dept = getattr(d, "department", "") if not isinstance(d, dict) else d.get("department", "")
        sec_from = getattr(d, "section_from", "") if not isinstance(d, dict) else d.get("section_from", "")
        sec_to = getattr(d, "section_to", "") if not isinstance(d, dict) else d.get("section_to", "")
        req_start = getattr(d, "requested_start_minutes", 0) if not isinstance(d, dict) else d.get("requested_start_minutes", 0)
        req_end = getattr(d, "requested_end_minutes", req_start + 120) if not isinstance(d, dict) else d.get("requested_end_minutes", req_start + 120)
        req_min = getattr(d, "required_minutes", req_end - req_start) if not isinstance(d, dict) else d.get("required_minutes", req_end - req_start)
        machinery_id = getattr(d, "machinery_id", None) if not isinstance(d, dict) else d.get("machinery_id")
        tsr = getattr(d, "speed_restriction_kmph", None) if not isinstance(d, dict) else d.get("speed_restriction_kmph")
        pwr = getattr(d, "power_block_required", False) if not isinstance(d, dict) else d.get("power_block_required", False)

        # In naive FIFO, granted window == requested window
        granted_start = int(req_start)
        granted_end = int(req_end)

        is_night = granted_start >= 1380 or granted_start <= 300
        if is_night:
            night_blocks_count += 1

        if tsr is not None:
            try:
                s_debt = calculate_speed_debt(d)["debt_score"]
                total_speed_debt += s_debt
            except Exception:
                pass

        granted_blocks.append({
            "demand_id": d_id,
            "demand_code": d_code,
            "department": dept,
            "section_from": sec_from,
            "section_to": sec_to,
            "granted_start_minutes": granted_start,
            "granted_end_minutes": granted_end,
            "required_minutes": int(req_min),
            "is_shadow": False,
            "shadow_parent_code": None,
            "speed_restriction_kmph": tsr,
            "machinery_id": machinery_id,
            "power_block_required": pwr,
        })

    # 2. Baseline train timetables (zero proactive adjustment)
    for t in trains:
        t_num = str(getattr(t, "train_number", "") if not isinstance(t, dict) else t.get("train_number", ""))
        t_name = getattr(t, "train_name", "") if not isinstance(t, dict) else t.get("train_name", "")
        t_type = getattr(t, "train_type", "EXPRESS") if not isinstance(t, dict) else t.get("train_type", "EXPRESS")
        t_dir = getattr(t, "direction", "UP") if not isinstance(t, dict) else t.get("direction", "UP")
        prio = getattr(t, "priority_weight", 50) if not isinstance(t, dict) else t.get("priority_weight", 50)

        path = getattr(t, "path", None) if not isinstance(t, dict) else t.get("path")
        if not path:
            path_json = getattr(t, "path_json", None) if not isinstance(t, dict) else t.get("path_json")
            path = _parse_path(path_json)
        else:
            path = _parse_path(path)

        ideal_start = 0
        if path and len(path) > 0:
            ideal_start = int(path[0].get("departure_minutes", path[0].get("arrival_minutes", 0)))

        train_schedules.append({
            "train_number": t_num,
            "train_name": t_name,
            "train_type": t_type,
            "direction": t_dir,
            "scheduled_start_minutes": ideal_start,
            "actual_start_minutes": ideal_start,
            "delay_minutes": 0,
            "priority_weight": int(prio),
            "path": path,
        })

    # 3. Detect all conflicts created by the naive schedule
    interim_schedule = {
        "granted_blocks": granted_blocks,
        "train_schedules": train_schedules,
    }
    clashes = detect_clashes(interim_schedule)

    for c in clashes:
        explanations.append(
            f"CLASH HAZARD [{c['severity']}]: {c['type']} on section {c['section']} "
            f"between {c['entity_a']} and {c['entity_b']} (overlap: {c['overlap_minutes']} min)."
        )

    if not clashes:
        explanations.append("Naive FIFO schedule resulted in 0 conflicts under current requests.")
    else:
        explanations.append(
            f"Naive FIFO schedule produced {len(clashes)} operational clashes requiring manual emergency intervention."
        )

    # In naive scheduling, objective penalty can reflect the cost of clashes
    clash_penalty = sum(
        (5000 if c["severity"] == "CRITICAL" else 2000) * c["overlap_minutes"]
        for c in clashes
    )
    objective_value = float(clash_penalty + total_speed_debt)

    return {
        "solve_id": solve_id,
        "status": "CHAOS_UNCONSTRAINED" if clashes else "OPTIMAL",
        "objective_value": objective_value,
        "best_bound": None,
        "optimality_gap": None,
        "wall_time_sec": 0.005,
        "mode": "CHAOS_BASELINE",
        "granted_blocks": granted_blocks,
        "train_schedules": train_schedules,
        "xai": {
            "total_train_delay_minutes": 0,
            "total_block_deviation_minutes": 0,
            "total_speed_debt_score": round(total_speed_debt, 4),
            "shadow_blocks_count": 0,
            "night_blocks_count": night_blocks_count,
            "clashes_detected": clashes,
            "total_clashes": len(clashes),
            "explanations": explanations,
        },
    }
