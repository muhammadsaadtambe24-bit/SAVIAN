"""
Core CP-SAT Railway Block Scheduling Engine for Indian Railways (SAVIAN).

Indian Railways (IR) operates the fourth largest railway network in the world.
On congested double-track trunk routes such as Bina Junction (BINA) to Itarsi Junction (ET)
on West Central Railway (WCR / Bhopal Division), balancing passenger train throughput
(Mission Raftaar, Rajdhani, Vande Bharat) against track maintenance blocks
(Civil/P-Way, Electrical/OHE, Signal/S&T) is a high-dimensional combinatorial problem.

This module provides the central RailwayBlockScheduler class using Google OR-Tools
CP-SAT (Constraint Programming - Satisfiability).

Key Design Highlights:
- Input dataclasses: TrainSlotInput and BlockDemandInput
- Threaded execution: asyncio.to_thread encapsulates the blocking CP-SAT solver
- Streaming callbacks: CpSolverSolutionCallback emits progress updates to on_progress()
- Comprehensive constraint enforcement: Absolute block safety, single-equipment clash
  prevention, traction power block containment, and integrated corridor megablocks
- Multi-objective optimization: Minimizes train delays, window deviations, and speed debt
  while maximizing shadow block merging and corridor night window utilization
- Explainable AI (XAI): Returns detailed audit logs and operational rationales
"""

import asyncio
from collections import defaultdict
from dataclasses import dataclass, field
import logging
from typing import Any, Callable, Dict, List, Optional, Sequence, Tuple, Union
import uuid

from ortools.sat.python import cp_model

from app.solver.constraints import (
    _canonical_section_id,
    add_equipment_clash_prevention,
    add_integrated_block_coupling,
    add_no_overlap_per_section,
    add_power_block_containment,
)
from app.solver.kavach import (
    add_kavach_headway_constraints,
    get_section_buffer,
)
from app.solver.objectives import (
    build_block_deviation_cost,
    build_night_preference_bonus,
    build_shadow_merge_bonus,
    build_speed_debt_cost,
    build_train_delay_cost,
)
from app.solver.speed_debt import calculate_speed_debt
from app.solver.trust_weights import apply_trust_weights
from app.solver.warm_start import apply_warm_start_hints

logger = logging.getLogger("railway_block_scheduling.solver")


# ==============================================================================
# INPUT DATACLASSES
# ==============================================================================


@dataclass
class TrainSlotInput:
    """
    Input representation of a scheduled train path across the corridor.

    Attributes:
        train_number: Unique train identifier, e.g. "12155", "22692".
        train_name: Descriptive name, e.g. "Shaan-e-Bhopal Express".
        train_type: RAJDHANI | VANDE_BHARAT | EXPRESS | MAIL | PASSENGER | FREIGHT.
        direction: UP (towards Delhi/North) | DOWN (towards Itarsi/South).
        priority_weight: Operational priority (Rajdhani=100, VB=90, Express=60, etc.).
        path: Ordered list of stop dicts, each with 'station_code', 'arrival_minutes', 'departure_minutes'.
        scheduled_start_minutes: Baseline departure from origin station.
        max_delay_minutes: Upper bound on permissible rescheduling delay (default 180 min).
    """

    train_number: str
    train_name: str
    train_type: str = "EXPRESS"
    direction: str = "UP"
    priority_weight: int = 60
    path: List[Dict[str, Any]] = field(default_factory=list)
    scheduled_start_minutes: Optional[int] = None
    max_delay_minutes: int = 180


@dataclass
class BlockDemandInput:
    """
    Input representation of an engineering maintenance block demand.

    Attributes:
        demand_code: Business code, e.g. "BDMS/WCR/BPL/2026/09/0101".
        source_system: Source system: "TMS" | "SMMS" | "TDMS".
        department: "P_WAY" (Civil) | "OHE" (Electrical) | "S_AND_T" (Signalling).
        section_from: Beginning station code, e.g. "BHS".
        section_to: Ending station code, e.g. "DWG".
        start_km: Chainage start kilometer.
        end_km: Chainage end kilometer.
        requested_date: Block date string (YYYY-MM-DD).
        requested_start_minutes: Desired start time (0-1439 min from midnight).
        requested_end_minutes: Desired end time (0-1439 min from midnight).
        required_minutes: Net maintenance window required in minutes.
        activity_description: Work summary (e.g. BCM deep screening, OHE overhaul).
        id: Optional database primary key.
        machinery_type: Machine category, e.g. "CSM-924", "Tower wagon".
        machinery_id: Asset identifier, e.g. "CSM-WCR-09", "TW-8W-BPL-11".
        status: "PROPOSED" | "REVIEWED" | "APPROVED".
        trust_score: Data veracity confidence (0.0 - 1.0).
        severity_tier: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW".
        priority_weight: Base optimization penalty weight.
        power_block_required: Whether 25kV traction power shutdown is required.
        disconnection_required: Whether S&T signalling disconnection memo is required.
        speed_restriction_kmph: Post-work TSR in km/h if applicable.
        is_integrated: Whether marked for joint multi-department corridor block.
        integrated_with: Target demand_code to couple with.
        direction: Optional track direction ("UP" | "DOWN" | "BOTH").
        min_start_minutes: Optional lower bound on start time.
        max_start_minutes: Optional upper bound on start time.
    """

    demand_code: str
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
    id: Optional[int] = None
    machinery_type: Optional[str] = None
    machinery_id: Optional[str] = None
    status: str = "PROPOSED"
    trust_score: float = 1.0
    severity_tier: str = "MEDIUM"
    priority_weight: int = 50
    power_block_required: bool = False
    disconnection_required: bool = False
    speed_restriction_kmph: Optional[int] = None
    is_integrated: bool = False
    integrated_with: Optional[str] = None
    direction: Optional[str] = None
    min_start_minutes: Optional[int] = None
    max_start_minutes: Optional[int] = None


# ==============================================================================
# CP-SAT SOLUTION PROGRESS CALLBACK
# ==============================================================================


class SchedulerProgressCallback(cp_model.CpSolverSolutionCallback):
    """
    CP-SAT solution callback subclass that notifies progress observers on every
    intermediate feasible solution found during the tree search.
    """

    def __init__(
        self,
        on_progress: Optional[Callable[[Dict[str, Any]], None]] = None,
        event_loop: Optional[asyncio.AbstractEventLoop] = None,
    ):
        super().__init__()
        self._on_progress = on_progress
        self._event_loop = event_loop
        self._iteration = 0

    def on_solution_callback(self):
        self._iteration += 1
        if not self._on_progress:
            return

        payload = {
            "iteration": self._iteration,
            "objective_cost": float(self.ObjectiveValue()),
            "best_bound": float(self.BestObjectiveBound()),
            "wall_time_sec": round(self.WallTime(), 3),
        }

        try:
            if asyncio.iscoroutinefunction(self._on_progress):
                if self._event_loop and self._event_loop.is_running():
                    asyncio.run_coroutine_threadsafe(
                        self._on_progress(payload), self._event_loop
                    )
            else:
                self._on_progress(payload)
        except Exception as ex:
            logger.debug(f"Progress callback notification error: {ex}")


# ==============================================================================
# MAIN SOLVER ENGINE
# ==============================================================================


class RailwayBlockScheduler:
    """
    Constraint-Programming (CP-SAT) Optimization Engine for Indian Railways Block Scheduling.
    """

    def __init__(self, horizon_minutes: int = 1440):
        """
        Initialize the scheduler for the given planning horizon.

        Args:
            horizon_minutes: Planning horizon in minutes (default 1440 = 24 hours).
        """
        self.horizon_minutes = int(horizon_minutes)

    async def solve(
        self,
        trains: Sequence[Union[TrainSlotInput, Any]],
        demands: Sequence[Union[BlockDemandInput, Any]],
        kavach_sections: Optional[Dict[str, str]] = None,
        mode: str = "COLD",
        previous_solution: Optional[Any] = None,
        on_progress: Optional[Callable[[Dict[str, Any]], Any]] = None,
        time_limit_sec: float = 30.0,
    ) -> Dict[str, Any]:
        """
        Asynchronously solve the block scheduling problem in a separate worker thread.

        Args:
            trains: Sequence of train slot definitions.
            demands: Sequence of engineering block requests.
            kavach_sections: Mapping of section_id -> Kavach status ("COMMISSIONED" etc.).
            mode: "COLD" (solve from scratch) or "WARM" (use previous hints).
            previous_solution: Optional previous solve result for warm-start hints.
            on_progress: Optional callback invoked on intermediate solutions.
            time_limit_sec: Maximum solver search time in seconds (default 30.0).

        Returns:
            Result dict with status, granted blocks, train schedules, and XAI metadata.
        """
        current_loop = asyncio.get_running_loop()

        return await asyncio.to_thread(
            self._solve_sync,
            trains=trains,
            demands=demands,
            kavach_sections=kavach_sections or {},
            mode=mode.upper(),
            previous_solution=previous_solution,
            on_progress=on_progress,
            time_limit_sec=float(time_limit_sec),
            event_loop=current_loop,
        )

    def _solve_sync(
        self,
        trains: Sequence[Any],
        demands: Sequence[Any],
        kavach_sections: Dict[str, str],
        mode: str,
        previous_solution: Optional[Any],
        on_progress: Optional[Callable[[Dict[str, Any]], Any]],
        time_limit_sec: float,
        event_loop: Optional[asyncio.AbstractEventLoop],
    ) -> Dict[str, Any]:
        """Synchronous internal method executed within asyncio.to_thread."""
        solve_id = str(uuid.uuid4())
        model = cp_model.CpModel()

        # 1. Apply source system trust weight adjustments
        adjusted_demands = apply_trust_weights(list(demands))

        # 2. Build decision variables
        variables: Dict[str, Any] = {}
        section_intervals: Dict[str, List[Any]] = defaultdict(list)
        section_occupancies: Dict[str, List[Tuple[Any, Any]]] = defaultdict(list)

        demand_intervals: Dict[str, Any] = {}
        demand_start_vars: Dict[str, Any] = {}
        demand_end_vars: Dict[str, Any] = {}

        # 2.1 Build variables for maintenance block demands
        for d in adjusted_demands:
            code = getattr(d, "demand_code", "")
            duration = int(getattr(d, "required_minutes", 120))
            req_start = int(getattr(d, "requested_start_minutes", 0))
            req_end = int(getattr(d, "requested_end_minutes", req_start + duration))

            # Determine variable search window [min_start, max_start]
            custom_min = getattr(d, "min_start_minutes", None)
            custom_max = getattr(d, "max_start_minutes", None)

            if custom_min is not None:
                min_start = max(0, int(custom_min))
            else:
                # Flexible window: allow searching up to 6 hours before/after to resolve clashes
                min_start = max(0, req_start - 360)

            if custom_max is not None:
                max_start = min(self.horizon_minutes - duration, int(custom_max))
            else:
                max_start = min(
                    self.horizon_minutes - duration,
                    max(req_start, req_end - duration) + 360,
                )

            # Ensure valid bounds
            if max_start < min_start:
                max_start = min_start

            clean_code = code.replace("/", "_").replace("-", "_")
            start_var = model.NewIntVar(
                min_start, max_start, f"blk_start_{clean_code}"
            )
            end_var = model.NewIntVar(
                min_start + duration,
                max_start + duration,
                f"blk_end_{clean_code}",
            )
            interval_var = model.NewIntervalVar(
                start_var, duration, end_var, f"blk_int_{clean_code}"
            )

            demand_intervals[code] = interval_var
            demand_start_vars[code] = start_var
            demand_end_vars[code] = end_var

            variables[f"block_start:{code}"] = start_var
            variables[f"block_end:{code}"] = end_var

            # Determine track direction (UP, DOWN, or BOTH) for double-track lines
            d_dir = getattr(d, "direction", None)
            if not d_dir:
                desc = getattr(d, "activity_description", "").upper()
                if "DOWN" in desc:
                    d_dir = "DOWN"
                elif "UP" in desc:
                    d_dir = "UP"
                else:
                    d_dir = "UP"
            d_dir = str(d_dir).upper()

            sec_from = getattr(d, "section_from", "")
            sec_to = getattr(d, "section_to", "")
            sec_id = _canonical_section_id(sec_from, sec_to)

            if d_dir == "BOTH":
                for branch in ("UP", "DOWN"):
                    trk_id = f"{sec_id}_{branch}"
                    section_intervals[trk_id].append(interval_var)
                    section_occupancies[trk_id].append((start_var, end_var))
            else:
                trk_id = f"{sec_id}_{d_dir}" if d_dir in ("UP", "DOWN") else sec_id
                section_intervals[trk_id].append(interval_var)
                section_occupancies[trk_id].append((start_var, end_var))

        # 2.2 Build variables for train paths & section occupancies
        train_start_vars: Dict[str, Any] = {}
        train_delay_vars: Dict[str, Any] = {}

        for t in trains:
            t_num = str(getattr(t, "train_number", ""))
            max_delay = int(getattr(t, "max_delay_minutes", 360))

            path = getattr(t, "path", [])
            # Parse path if it's a JSON string
            if isinstance(path, str):
                import json

                try:
                    path = json.loads(path)
                except Exception:
                    path = []

            if not path:
                continue

            # Determine baseline scheduled start
            first_stop = path[0]
            ideal_start = int(
                first_stop.get("departure_minutes", first_stop.get("arrival_minutes", 0))
            )
            setattr(t, "ideal_start_minutes", ideal_start)

            delay_var = model.NewIntVar(0, max_delay, f"train_delay_{t_num}")
            train_delay_vars[t_num] = delay_var

            actual_train_start = model.NewIntVar(
                ideal_start, ideal_start + max_delay, f"train_start_{t_num}"
            )
            model.Add(actual_train_start == ideal_start + delay_var)
            train_start_vars[t_num] = actual_train_start
            variables[f"train_start:{t_num}"] = actual_train_start

            t_dir = str(getattr(t, "direction", "UP")).upper()

            # For each consecutive station pair in path, create section interval
            for idx in range(len(path) - 1):
                st_curr = path[idx]
                st_next = path[idx + 1]

                st1 = st_curr.get("station_code", "")
                st2 = st_next.get("station_code", "")
                sec_id = _canonical_section_id(st1, st2)
                trk_id = f"{sec_id}_{t_dir}" if t_dir in ("UP", "DOWN") else sec_id

                t_dep = int(st_curr.get("departure_minutes", st_curr.get("arrival_minutes", 0)))
                t_arr = int(st_next.get("arrival_minutes", st_next.get("departure_minutes", t_dep + 5)))
                sec_duration = max(1, t_arr - t_dep)

                # Section start is shifted by the train's overall delay
                sec_start = model.NewIntVar(
                    0,
                    self.horizon_minutes + max_delay,
                    f"tr_{t_num}_{trk_id}_{idx}_start",
                )
                sec_end = model.NewIntVar(
                    0,
                    self.horizon_minutes + max_delay,
                    f"tr_{t_num}_{trk_id}_{idx}_end",
                )
                sec_interval = model.NewIntervalVar(
                    sec_start,
                    sec_duration,
                    sec_end,
                    f"tr_{t_num}_{trk_id}_{idx}_int",
                )

                model.Add(sec_start == t_dep + delay_var)
                model.Add(sec_end == sec_start + sec_duration)

                section_intervals[trk_id].append(sec_interval)
                section_occupancies[trk_id].append((sec_start, sec_end))

        # 3. Apply Hard Constraints
        add_no_overlap_per_section(model, section_intervals)
        add_equipment_clash_prevention(model, adjusted_demands, demand_intervals)
        add_power_block_containment(
            model,
            adjusted_demands,
            demand_intervals,
            demand_start_vars,
            demand_end_vars,
        )
        add_integrated_block_coupling(
            model,
            adjusted_demands,
            demand_intervals,
            demand_start_vars,
        )

        # 4. Apply Kavach Headway Safety Constraints
        for trk_id, occupancies in section_occupancies.items():
            base_sec = trk_id.rsplit("_", 1)[0] if ("_UP" in trk_id or "_DOWN" in trk_id) else trk_id
            status = kavach_sections.get(trk_id, kavach_sections.get(base_sec, "NOT_EQUIPPED"))
            add_kavach_headway_constraints(model, trk_id, status, occupancies)

        # 5. Apply Warm-Start Hints (if in WARM mode)
        if mode == "WARM" and previous_solution:
            apply_warm_start_hints(model, variables, previous_solution)

        # 6. Build Multi-Objective Function
        train_delay_cost = build_train_delay_cost(model, trains, train_start_vars)
        block_deviation_cost = build_block_deviation_cost(
            model, adjusted_demands, demand_start_vars, self.horizon_minutes
        )
        speed_debt_cost = build_speed_debt_cost(
            model, adjusted_demands, demand_start_vars
        )
        shadow_merge_bonus = build_shadow_merge_bonus(
            model, adjusted_demands, demand_start_vars, demand_end_vars
        )
        night_pref_bonus = build_night_preference_bonus(
            model, demand_start_vars
        )

        # Final Combined Objective:
        # Minimize(train_delay + block_deviation + speed_debt - shadow_bonus - night_bonus)
        model.Minimize(
            train_delay_cost
            + block_deviation_cost
            + speed_debt_cost
            - shadow_merge_bonus
            - night_pref_bonus
        )

        # 7. Configure and Run CP-SAT Solver
        solver = cp_model.CpSolver()
        solver.parameters.max_time_in_seconds = time_limit_sec
        solver.parameters.num_search_workers = 8
        solver.parameters.log_search_progress = False

        callback = SchedulerProgressCallback(on_progress, event_loop)
        status_code = solver.Solve(model, callback)

        status_str = {
            cp_model.OPTIMAL: "OPTIMAL",
            cp_model.FEASIBLE: "FEASIBLE",
            cp_model.INFEASIBLE: "INFEASIBLE",
            cp_model.MODEL_INVALID: "MODEL_INVALID",
            cp_model.UNKNOWN: "UNKNOWN",
        }.get(status_code, "UNKNOWN")

        # 8. Extract Solution Schedules and Construct Output
        granted_blocks = []
        train_schedules = []
        explanations = []

        total_train_delay = 0
        total_block_dev = 0
        total_speed_debt = 0.0
        night_blocks_count = 0

        if status_str in ("OPTIMAL", "FEASIBLE"):
            # 8.1 Extract granted blocks
            for d in adjusted_demands:
                code = getattr(d, "demand_code", "")
                if code not in demand_start_vars:
                    continue

                start_val = int(solver.Value(demand_start_vars[code]))
                end_val = int(solver.Value(demand_end_vars[code]))
                req_start = int(getattr(d, "requested_start_minutes", 0))
                dev = abs(start_val - req_start)
                total_block_dev += dev

                is_night = start_val >= 1380 or start_val <= 300
                if is_night:
                    night_blocks_count += 1

                # Calculate speed debt if applicable
                tsr = getattr(d, "speed_restriction_kmph", None)
                if tsr is not None:
                    s_debt = calculate_speed_debt(d)["debt_score"]
                    total_speed_debt += s_debt

                granted_blocks.append(
                    {
                        "demand_id": getattr(d, "id", None),
                        "demand_code": code,
                        "department": getattr(d, "department", ""),
                        "section_from": getattr(d, "section_from", ""),
                        "section_to": getattr(d, "section_to", ""),
                        "granted_start_minutes": start_val,
                        "granted_end_minutes": end_val,
                        "required_minutes": int(getattr(d, "required_minutes", 0)),
                        "is_shadow": False,
                        "shadow_parent_code": None,
                        "speed_restriction_kmph": tsr,
                        "machinery_id": getattr(d, "machinery_id", None),
                    }
                )

                # Generate operational explanation
                if dev > 0:
                    explanations.append(
                        f"Demand {code} ({getattr(d, 'department', '')} on {getattr(d, 'section_from', '')}-{getattr(d, 'section_to', '')}) "
                        f"scheduled at min {start_val} (shifted by {dev} min from requested min {req_start}) "
                        f"to prevent conflicts with higher-priority corridor movements."
                    )
                else:
                    explanations.append(
                        f"Demand {code} granted at requested time (min {start_val} - {end_val}) on section "
                        f"{getattr(d, 'section_from', '')}-{getattr(d, 'section_to', '')}."
                    )

            # Detect and tag shadow blocks
            shadow_count = self._tag_shadow_blocks(granted_blocks)

            # 8.2 Extract train schedules
            for t in trains:
                t_num = str(getattr(t, "train_number", ""))
                if t_num not in train_start_vars:
                    continue

                actual_start = int(solver.Value(train_start_vars[t_num]))
                delay_val = int(solver.Value(train_delay_vars[t_num]))
                ideal_start = getattr(t, "ideal_start_minutes", actual_start)
                total_train_delay += delay_val

                train_schedules.append(
                    {
                        "train_number": t_num,
                        "train_name": getattr(t, "train_name", ""),
                        "train_type": getattr(t, "train_type", ""),
                        "direction": getattr(t, "direction", ""),
                        "scheduled_start_minutes": ideal_start,
                        "actual_start_minutes": actual_start,
                        "delay_minutes": delay_val,
                        "priority_weight": int(getattr(t, "priority_weight", 50)),
                    }
                )

                if delay_val > 0:
                    explanations.append(
                        f"Train {t_num} ({getattr(t, 'train_name', '')}) delayed by {delay_val} min to clear block possession."
                    )

            # 8.3 Add explanations for trust weight adjustments
            for d in adjusted_demands:
                if getattr(d, "trust_adjustment_applied", False):
                    explanations.append(
                        f"Safety escalation: Priority of demand {getattr(d, 'demand_code', '')} (SMMS critical asset) "
                        f"escalated by 1.3x due to low source confidence score ({getattr(d, 'trust_score', 0):.2f})."
                    )

        obj_val = float(solver.ObjectiveValue()) if status_str in ("OPTIMAL", "FEASIBLE") else None
        best_bound = float(solver.BestObjectiveBound()) if status_str in ("OPTIMAL", "FEASIBLE") else None
        opt_gap = (
            abs(obj_val - best_bound) / abs(obj_val)
            if (obj_val is not None and best_bound is not None and abs(obj_val) > 1e-6)
            else 0.0
        )

        return {
            "solve_id": solve_id,
            "status": status_str,
            "objective_value": obj_val,
            "best_bound": best_bound,
            "optimality_gap": round(opt_gap, 4) if opt_gap is not None else None,
            "wall_time_sec": round(solver.WallTime(), 3),
            "mode": mode,
            "granted_blocks": granted_blocks,
            "train_schedules": train_schedules,
            "xai": {
                "total_train_delay_minutes": total_train_delay,
                "total_block_deviation_minutes": total_block_dev,
                "total_speed_debt_score": round(total_speed_debt, 4),
                "shadow_blocks_count": shadow_count if status_str in ("OPTIMAL", "FEASIBLE") else 0,
                "night_blocks_count": night_blocks_count,
                "kavach_buffers_applied": {
                    sec: get_section_buffer(status)
                    for sec, status in kavach_sections.items()
                },
                "explanations": explanations,
            },
        }

    def _tag_shadow_blocks(self, granted_blocks: List[Dict[str, Any]]) -> int:
        """Identify and tag blocks that overlap in time and share/adjacent sections as shadow blocks."""
        shadow_count = 0
        n = len(granted_blocks)

        for i in range(n):
            b1 = granted_blocks[i]
            s1, e1 = b1["granted_start_minutes"], b1["granted_end_minutes"]

            for j in range(i + 1, n):
                b2 = granted_blocks[j]
                s2, e2 = b2["granted_start_minutes"], b2["granted_end_minutes"]

                # Overlap check
                if s1 < e2 and s2 < e1:
                    # Check section compatibility
                    sec1 = _canonical_section_id(b1["section_from"], b1["section_to"])
                    sec2 = _canonical_section_id(b2["section_from"], b2["section_to"])

                    st1_set = {b1["section_from"].upper(), b1["section_to"].upper()}
                    st2_set = {b2["section_from"].upper(), b2["section_to"].upper()}

                    if sec1 == sec2 or (st1_set & st2_set):
                        # Secondary block becomes shadow of primary
                        if b1["required_minutes"] >= b2["required_minutes"]:
                            if not b2["is_shadow"]:
                                b2["is_shadow"] = True
                                b2["shadow_parent_code"] = b1["demand_code"]
                                shadow_count += 1
                        else:
                            if not b1["is_shadow"]:
                                b1["is_shadow"] = True
                                b1["shadow_parent_code"] = b2["demand_code"]
                                shadow_count += 1

        return shadow_count
