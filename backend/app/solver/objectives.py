"""
Soft Objectives Module for Indian Railways Block Scheduling (LINE CLEAR).

Balancing Multi-Objective Railway Operations:
1. Train Delay Penalty (Punctuality):
   Preserves passenger train punctuality (Mission Raftaar / Section Controller KPIs).
   Trains are weighted by class: Rajdhani (100) > Vande Bharat (90) > Express (60) >
   Mail (50) > Passenger (30) > Freight (20).
   Delay cost = sum(priority_weight * (start - ideal_start)).

2. Maintenance Window Deviation Penalty:
   Minimizes disruption to field maintenance crews (P-Way gangs, OHE tower wagon staff)
   by keeping granted blocks close to their requested time slot.
   Deviation cost = sum(priority_weight * |start - requested_start|).

3. Shadow Block Merge Bonus:
   Encourages corridor synergy: When two compatible maintenance blocks on adjacent
   sections run concurrently, single corridor protection covers both works,
   reducing net operational disruption.

4. Speed Debt Cost:
   Penalizes scheduling blocks that impose severe Temporary Speed Restrictions (TSR),
   favoring scheduling sequences that clear urgent track defects quickly.

5. Corridor Night Preference Bonus:
   In Indian Railways, the 23:00 to 05:00 window (minutes 1380 to 1440 and 0 to 300)
   is the designated "Corridor Night" when passenger train density is lowest.
   Blocks scheduled within this window receive a preference bonus.

Final Objective:
   Minimize(train_delay + block_deviation + speed_debt - shadow_bonus - night_bonus)
"""

from typing import Any, Dict, List, Optional, Sequence, Tuple
from app.solver.speed_debt import calculate_speed_debt


def build_train_delay_cost(
    model: Any,
    trains: Sequence[Any],
    train_start_vars: Dict[str, Any],
    max_delay: int = 720,
) -> Any:
    """
    Build punctuality objective: Minimize sum(priority_weight * delay) for all trains.

    Args:
        model: cp_model.CpModel instance.
        trains: Sequence of TrainSlotInput objects.
        train_start_vars: Mapping from train_number -> IntVar (actual departure/start).
        max_delay: Maximum permissible train rescheduling delay in minutes.

    Returns:
        Linear expression representing total weighted train delay cost.
    """
    delay_terms = []

    for t in trains:
        t_num = getattr(t, "train_number", "")
        if t_num not in train_start_vars:
            continue

        # Determine ideal scheduled start minute
        ideal_start = getattr(t, "ideal_start_minutes", None)
        if ideal_start is None:
            ideal_start = getattr(t, "scheduled_start_minutes", None)
        if ideal_start is None and hasattr(t, "path") and t.path:
            # First stop arrival or departure
            first_stop = t.path[0]
            if isinstance(first_stop, dict):
                ideal_start = first_stop.get("departure_minutes", first_stop.get("arrival_minutes", 0))
            else:
                ideal_start = getattr(first_stop, "departure_minutes", getattr(first_stop, "arrival_minutes", 0))

        if ideal_start is None:
            ideal_start = 0

        ideal_start = int(ideal_start)
        p_weight = int(getattr(t, "priority_weight", 50))

        actual_start = train_start_vars[t_num]

        # delay = actual_start - ideal_start (delay >= 0)
        delay_var = model.NewIntVar(0, max_delay, f"train_delay_{t_num}")
        model.Add(delay_var == actual_start - ideal_start)

        delay_terms.append(p_weight * delay_var)

    if delay_terms:
        return sum(delay_terms)
    return 0


def build_block_deviation_cost(
    model: Any,
    demands: Sequence[Any],
    block_start_vars: Dict[str, Any],
    horizon_minutes: int = 1440,
) -> Any:
    """
    Build window deviation objective: Penalize shifting blocks away from requested time.
    Uses absolute deviation: sum(priority_weight * |start - requested_start|).

    Args:
        model: cp_model.CpModel instance.
        demands: Sequence of block demand inputs.
        block_start_vars: Mapping from demand_code -> IntVar (block start minute).
        horizon_minutes: Planning horizon in minutes.

    Returns:
        Linear expression representing total weighted block deviation penalty.
    """
    deviation_terms = []

    for d in demands:
        code = getattr(d, "demand_code", "")
        if code not in block_start_vars:
            continue

        req_start = int(getattr(d, "requested_start_minutes", 0))
        p_weight = int(getattr(d, "priority_weight", 50))

        start_var = block_start_vars[code]

        # diff = start - req_start (-horizon to +horizon)
        diff_var = model.NewIntVar(-horizon_minutes, horizon_minutes, f"diff_{code}")
        model.Add(diff_var == start_var - req_start)

        # abs_dev = |diff|
        abs_dev = model.NewIntVar(0, horizon_minutes, f"abs_dev_{code}")
        model.AddAbsEquality(abs_dev, diff_var)

        deviation_terms.append(p_weight * abs_dev)

    if deviation_terms:
        return sum(deviation_terms)
    return 0


def build_shadow_merge_bonus(
    model: Any,
    demands: Sequence[Any],
    block_start_vars: Dict[str, Any],
    block_end_vars: Dict[str, Any],
    bonus_weight: int = 300,
) -> Any:
    """
    Build shadow block merge bonus for compatible blocks on adjacent sections.

    If two adjacent maintenance blocks overlap in time, single corridor protection
    covers both works, yielding a corridor-night maintenance efficiency bonus.
    Uses boolean reification: bonus_var is 1 if blocks overlap, 0 otherwise.

    Args:
        model: cp_model.CpModel instance.
        demands: Sequence of block demand inputs.
        block_start_vars: Mapping from demand_code -> IntVar (start).
        block_end_vars: Mapping from demand_code -> IntVar (end).
        bonus_weight: Objective bonus reward per merged adjacent pair.

    Returns:
        Linear expression for total shadow bonus (positive value; subtract in minimization).
    """
    bonus_terms = []

    def _are_adjacent(d1: Any, d2: Any) -> bool:
        # Check if demands share a common station boundary or contiguous chainage
        st1_f, st1_t = str(getattr(d1, "section_from", "")).upper(), str(getattr(d1, "section_to", "")).upper()
        st2_f, st2_t = str(getattr(d2, "section_from", "")).upper(), str(getattr(d2, "section_to", "")).upper()

        # Shared junction/station boundary: e.g. BHS-DWG and DWG-SMT
        if {st1_f, st1_t} & {st2_f, st2_t}:
            return True

        # Close chainage distance (within 10 km)
        km1_e = max(float(getattr(d1, "start_km", 0)), float(getattr(d1, "end_km", 0)))
        km2_s = min(float(getattr(d2, "start_km", 0)), float(getattr(d2, "end_km", 0)))
        if abs(km1_e - km2_s) <= 10.0:
            return True

        return False

    n = len(demands)
    for i in range(n):
        d1 = demands[i]
        code1 = getattr(d1, "demand_code", "")
        if code1 not in block_start_vars or code1 not in block_end_vars:
            continue

        for j in range(i + 1, n):
            d2 = demands[j]
            code2 = getattr(d2, "demand_code", "")
            if code2 not in block_start_vars or code2 not in block_end_vars:
                continue

            # Check adjacency
            if not _are_adjacent(d1, d2):
                continue

            s1, e1 = block_start_vars[code1], block_end_vars[code1]
            s2, e2 = block_start_vars[code2], block_end_vars[code2]

            # Overlap condition: s1 < e2 AND s2 < e1
            c1 = code1.replace("/", "_").replace("-", "_")[-8:]
            c2 = code2.replace("/", "_").replace("-", "_")[-8:]

            b_s1_lt_e2 = model.NewBoolVar(f"ovlp_a_{c1}_{c2}")
            model.Add(s1 < e2).OnlyEnforceIf(b_s1_lt_e2)
            model.Add(s1 >= e2).OnlyEnforceIf(b_s1_lt_e2.Not())

            b_s2_lt_e1 = model.NewBoolVar(f"ovlp_b_{c1}_{c2}")
            model.Add(s2 < e1).OnlyEnforceIf(b_s2_lt_e1)
            model.Add(s2 >= e1).OnlyEnforceIf(b_s2_lt_e1.Not())

            bonus_var = model.NewBoolVar(f"shadow_merge_{c1}_{c2}")
            # bonus_var <=> (b_s1_lt_e2 AND b_s2_lt_e1)
            model.Add(bonus_var <= b_s1_lt_e2)
            model.Add(bonus_var <= b_s2_lt_e1)
            model.Add(bonus_var >= b_s1_lt_e2 + b_s2_lt_e1 - 1)

            bonus_terms.append(bonus_weight * bonus_var)

    if bonus_terms:
        return sum(bonus_terms)
    return 0


def build_speed_debt_cost(
    model: Any,
    demands: Sequence[Any],
    block_start_vars: Dict[str, Any],
    max_line_speed: int = 130,
) -> Any:
    """
    Build speed debt penalty cost for demands imposing temporary speed restrictions (TSR).
    Cost = sum((max_speed - restricted_speed) * affected_km * duration_days).

    Args:
        model: cp_model.CpModel instance.
        demands: Sequence of block demand inputs.
        block_start_vars: Mapping from demand_code -> IntVar (start).
        max_line_speed: Sectional MPS in km/h.

    Returns:
        Linear expression representing total speed debt penalty.
    """
    debt_terms = []

    for d in demands:
        code = getattr(d, "demand_code", "")
        if code not in block_start_vars:
            continue

        tsr = getattr(d, "speed_restriction_kmph", None)
        if tsr is not None and tsr < max_line_speed:
            calc = calculate_speed_debt(d, max_line_speed=max_line_speed)
            debt_score = calc["debt_score"]
            # Scale debt_score into an integer objective cost term (e.g. multiplied by 10)
            int_debt_cost = int(round(debt_score * 10))

            # If delayed beyond requested time, add an incremental penalty for keeping defect active
            req_start = int(getattr(d, "requested_start_minutes", 0))
            start_var = block_start_vars[code]

            # Additional penalty for deferred repairs of speed-restricted sections
            delay_var = model.NewIntVar(0, 1440, f"speed_delay_{code}")
            model.Add(delay_var >= start_var - req_start)
            model.Add(delay_var >= 0)

            debt_terms.append(int_debt_cost + 2 * delay_var)

    if debt_terms:
        return sum(debt_terms)
    return 0


def build_night_preference_bonus(
    model: Any,
    block_start_vars: Dict[str, Any],
    bonus_weight: int = 200,
) -> Any:
    """
    Build night preference bonus: Rewards scheduling maintenance blocks in the
    designated Indian Railways corridor night window between 23:00 (minute 1380)
    and 05:00 (minute 300).

    Uses boolean reification:
        is_night = 1 if (start >= 1380 or start <= 300) else 0

    Args:
        model: cp_model.CpModel instance.
        block_start_vars: Mapping from demand_code -> IntVar (start).
        bonus_weight: Objective bonus reward per block starting at night.

    Returns:
        Linear expression for total night bonus (positive value; subtract in minimization).
    """
    night_terms = []

    for code, start_var in block_start_vars.items():
        c_clean = code.replace("/", "_").replace("-", "_")[-8:]

        # Late night condition: start >= 1380 (23:00 - 24:00)
        b_late = model.NewBoolVar(f"night_late_{c_clean}")
        model.Add(start_var >= 1380).OnlyEnforceIf(b_late)
        model.Add(start_var < 1380).OnlyEnforceIf(b_late.Not())

        # Early morning condition: start <= 300 (00:00 - 05:00)
        b_early = model.NewBoolVar(f"night_early_{c_clean}")
        model.Add(start_var <= 300).OnlyEnforceIf(b_early)
        model.Add(start_var > 300).OnlyEnforceIf(b_early.Not())

        # Night bonus indicator: b_night <=> (b_late OR b_early)
        b_night = model.NewBoolVar(f"night_pref_{c_clean}")
        model.Add(b_night <= b_late + b_early)
        model.Add(b_late <= b_night)
        model.Add(b_early <= b_night)

        night_terms.append(bonus_weight * b_night)

    if night_terms:
        return sum(night_terms)
    return 0
