"""
Kavach Automatic Train Protection (ATP) Headway Module for Indian Railways (SAVIAN).

Kavach is the indigenous Automatic Train Protection (ATP) system adopted by Indian Railways
(Research Designs and Standards Organisation - RDSO, Specification TAC-903 / SPG-903).

Key Operational Headway Rules:
1. COMMISSIONED Sections:
   - Equipped with Station Kavach, Locomotive Kavach, Trackside RFID balises, and UHF/LTE
     continuous radio transmission of dynamic Movement Authority (MA).
   - Allows tighter dynamic headway buffer: 3 minutes between consecutive block occupancies.
2. IN_TRIALS Sections:
   - Under active 30-day commissioning or field trial monitoring.
   - Operating under precautionary speed restrictions (e.g. 10-30 km/h) and conservative
     separation limits: 8 minutes headway buffer.
3. NOT_EQUIPPED Sections:
   - Operating under traditional Absolute Block System (double-line lock & block instruments)
     with fixed aspect signals (MACLS).
   - Standard headway clearance buffer: 5 minutes (encompassing line clear granting, block
     instrument release, and signal replacement time).
"""

from typing import Any, Dict, List, Sequence, Tuple, Union


def get_section_buffer(kavach_status: str) -> int:
    """
    Return the safety headway buffer (in minutes) based on track section Kavach ATP deployment status.

    Args:
        kavach_status: "COMMISSIONED", "IN_TRIALS", or "NOT_EQUIPPED".

    Returns:
        Headway buffer in minutes:
            - COMMISSIONED: 3 minutes
            - IN_TRIALS: 8 minutes
            - NOT_EQUIPPED: 5 minutes (default fallback)
    """
    status_clean = str(kavach_status or "").strip().upper()

    if status_clean == "COMMISSIONED":
        return 3
    elif status_clean == "IN_TRIALS":
        return 8
    elif status_clean == "NOT_EQUIPPED":
        return 5
    else:
        # Default safety fallback for unclassified or missing status
        return 5


def add_kavach_headway_constraints(
    model: Any,
    section_id: str,
    kavach_status: str,
    intervals: Sequence[Any],
) -> int:
    """
    Enforce Kavach headway separation buffer between consecutive occupancies on the same section.

    For any two occupancies i and j on section_id, either:
        end_i + buffer <= start_j  (i runs before j)
      OR
        end_j + buffer <= start_i  (j runs before i)

    Args:
        model: cp_model.CpModel instance.
        section_id: Identifier of the track block section (e.g. "BHS-DWG").
        kavach_status: Status string ("COMMISSIONED" | "IN_TRIALS" | "NOT_EQUIPPED").
        intervals: Sequence of occupancy descriptors. Each element can be:
            - tuple: (start_var, end_var)
            - dict: {"start": start_var, "end": end_var}
            - object with .start and .end attributes
            - tuple with interval var if start/end can be referenced

    Returns:
        Number of pairwise headway constraints added.
    """
    buffer_min = get_section_buffer(kavach_status)

    if not intervals or len(intervals) < 2:
        return 0

    # Extract start and end IntVar expressions for each occupancy
    normalized_pairs: List[Tuple[Any, Any]] = []
    for item in intervals:
        if isinstance(item, (tuple, list)):
            if len(item) >= 2:
                normalized_pairs.append((item[0], item[1]))
        elif isinstance(item, dict):
            if "start" in item and "end" in item:
                normalized_pairs.append((item["start"], item["end"]))
        elif hasattr(item, "start") and hasattr(item, "end"):
            normalized_pairs.append((item.start, item.end))
        elif hasattr(item, "StartExpr") and hasattr(item, "EndExpr"):
            normalized_pairs.append((item.StartExpr(), item.EndExpr()))

    count = 0
    clean_sec = section_id.replace("-", "_").replace(" ", "_")

    for i in range(len(normalized_pairs)):
        start_i, end_i = normalized_pairs[i]
        for j in range(i + 1, len(normalized_pairs)):
            start_j, end_j = normalized_pairs[j]

            # Boolean indicator: True if i precedes j, False if j precedes i
            b_precedes = model.NewBoolVar(f"kavach_{clean_sec}_{i}_before_{j}")

            # i before j: end_i + buffer <= start_j
            model.Add(end_i + buffer_min <= start_j).OnlyEnforceIf(b_precedes)
            # j before i: end_j + buffer <= start_i
            model.Add(end_j + buffer_min <= start_i).OnlyEnforceIf(b_precedes.Not())

            count += 1

    return count
