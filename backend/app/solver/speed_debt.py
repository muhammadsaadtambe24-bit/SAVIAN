"""
Speed Debt Calculation Module for Indian Railways Block Scheduling (LINE CLEAR).

In Indian Railways (IR) permanent-way (P-Way) maintenance, executing track works
such as deep screening (BCM), through rail renewal (TRR), turn-out renewals,
or de-stressing often leaves track in an unsettled state. Consequently, a
Temporary Speed Restriction (TSR) (e.g. 20, 30, or 45 km/h) is imposed in lieu
of the sectional Maximum Permissible Speed (MPS, typically 130 km/h on Group A
trunk routes such as Bina - Itarsi).

Every day a speed restriction lingers, every train passing through that block
suffers deceleration, run-out, and acceleration losses. The "Speed Debt" quantifies
this operational penalty:
    debt_score = (speed_reduction * affected_km * estimated_days) / 1000
"""

from typing import Any, Dict, Optional


def calculate_speed_debt(
    demand: Any,
    max_line_speed: int = 130,
    default_days: Optional[int] = None,
) -> Dict[str, Any]:
    """
    Calculate the speed debt penalty incurred by imposing a Temporary Speed Restriction (TSR).

    Args:
        demand: Block demand object or dataclass having start_km, end_km,
                speed_restriction_kmph, and optionally severity_tier or estimated_days.
        max_line_speed: Sectional Maximum Permissible Speed (MPS) in km/h (default 130 km/h).
        default_days: Explicit duration in days of TSR relaxation period if known.

    Returns:
        Dict containing:
            - speed_reduction: Difference between MPS and TSR in km/h (>= 0).
            - affected_km: Track length subject to caution order in kilometers.
            - estimated_days: Number of days before full sectional speed is restored.
            - debt_score: Normalized operational speed debt score (floating point).
    """
    speed_restriction = getattr(demand, "speed_restriction_kmph", None)

    # If no speed restriction is specified or it is not lower than line speed, debt is zero
    if speed_restriction is None or speed_restriction >= max_line_speed:
        speed_reduction = 0
    else:
        speed_reduction = max(0, max_line_speed - int(speed_restriction))

    start_km = float(getattr(demand, "start_km", 0.0))
    end_km = float(getattr(demand, "end_km", 0.0))
    affected_km = abs(end_km - start_km)

    # Determine estimated days required for progressive speed relaxation
    # (e.g., 20 km/h -> 30 km/h -> 45 km/h -> 75 km/h -> Normal)
    if default_days is not None:
        estimated_days = default_days
    elif hasattr(demand, "estimated_days") and demand.estimated_days is not None:
        estimated_days = int(demand.estimated_days)
    else:
        severity = str(getattr(demand, "severity_tier", "MEDIUM")).upper()
        # High-severity urgent tracks get prioritized fast consolidation (fewer lingering days)
        # Low severity or routine caution orders may linger longer under traffic consolidation
        severity_days_map = {
            "CRITICAL": 3,
            "HIGH": 7,
            "MEDIUM": 14,
            "LOW": 21,
        }
        estimated_days = severity_days_map.get(severity, 7)

    debt_score = (speed_reduction * affected_km * estimated_days) / 1000.0

    return {
        "speed_reduction": speed_reduction,
        "affected_km": round(affected_km, 3),
        "estimated_days": estimated_days,
        "debt_score": round(debt_score, 4),
    }
