"""
Warm Start Module for Indian Railways Block Scheduling (LINE CLEAR).

In active railway operations, the train timetable and planned maintenance blocks
are subject to frequent real-time revisions (e.g. an unplanned emergency rail defect
discovered by USFD ultrasonic flaw detection, or an urgent OHE neutral section repair).

Rather than solving a 24-hour corridor problem from scratch (cold-start), CP-SAT
supports variable hinting via `model.AddHint(var, value)`. This warm-start mechanism
seeds the SAT search heuristic with the proven assignments of the prior plan.
Unchanged blocks and trains are guided to retain their previous timings, allowing
the solver to focus search capacity almost entirely on accommodating the new/modified
demands within seconds.
"""

from typing import Any, Dict, Optional


def apply_warm_start_hints(
    model: Any,
    variables: Dict[str, Any],
    previous_solution: Optional[Any],
) -> int:
    """
    Apply decision variable hints from a prior optimization run to accelerate re-optimization.

    Args:
        model: cp_model.CpModel instance.
        variables: Dictionary mapping variable keys to CP-SAT IntVar or BoolVar instances.
                   Keys typically include:
                     - "block_start:<demand_code>"
                     - "block_end:<demand_code>"
                     - "train_start:<train_number>"
                     - Direct variable name strings
        previous_solution: Previous solver output. Can be:
                     - A dict mapping variable keys to assigned values: {"key": value, ...}
                     - A result dict returned by RailwayBlockScheduler.solve() containing
                       "granted_blocks" and "train_schedules".

    Returns:
        Number of variable hints applied to the model.
    """
    if not previous_solution or not variables:
        return 0

    # Normalize previous_solution into a flat key -> int value dictionary
    hint_values: Dict[str, int] = {}

    if isinstance(previous_solution, dict):
        # Case 1: Result dict from previous solver run
        if "granted_blocks" in previous_solution or "train_schedules" in previous_solution:
            for gb in previous_solution.get("granted_blocks", []):
                code = gb.get("demand_code")
                start = gb.get("granted_start_minutes")
                end = gb.get("granted_end_minutes")
                if code and start is not None:
                    hint_values[f"block_start:{code}"] = int(start)
                    hint_values[code] = int(start)
                if code and end is not None:
                    hint_values[f"block_end:{code}"] = int(end)

            for ts in previous_solution.get("train_schedules", []):
                t_num = ts.get("train_number")
                actual_start = ts.get("actual_start_minutes")
                if t_num and actual_start is not None:
                    hint_values[f"train_start:{t_num}"] = int(actual_start)
                    hint_values[t_num] = int(actual_start)

        # Case 2: Direct key-value mapping
        for k, v in previous_solution.items():
            if isinstance(v, (int, float)) and k not in ("objective_value", "best_bound", "optimality_gap", "wall_time_sec"):
                hint_values[str(k)] = int(v)

    # Apply hints for matching variables
    applied_count = 0
    for var_key, var in variables.items():
        if var_key in hint_values and var is not None:
            val = hint_values[var_key]
            try:
                model.AddHint(var, val)
                applied_count += 1
            except Exception:
                # If variable type or domain does not match hint value, ignore gracefully
                pass

    return applied_count
