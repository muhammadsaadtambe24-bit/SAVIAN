"""
Trust Weights Adjustment Module for Indian Railways Block Scheduling (SAVIAN).

Indian Railways integrates multiple disparate departmental asset management feeds:
1. TMS (Track Management System - P-Way): Field-entered via SSE/P-Way handheld tablets,
   providing high-trust physical defect measurements (OMS, USFD, TRC).
2. TDMS (Traction Distribution Management System - Electrical/OHE): Automated telemetry
   and SCADA logs with reliable timestamps for contact wire wear, hot spots, and insulator health.
3. SMMS (Signalling Maintenance Management System - S&T): Often suffers from latency
   between relay room electronic interlocking alarms, track circuit fail counts, and manual
   log uploads.

Conservatism Principle:
When an SMMS demand has a lower confidence trust score (< 0.8) but reports a CRITICAL
or HIGH severity asset failure (such as point machine detection failure or digital axle
counter track sensor drift), we cannot afford to postpone it due to potentially stale
field reporting. The solver bumps its optimization priority weight by 1.3x so that safety
is never compromised by reporting latency.
"""

import copy
from typing import Any, List


def apply_trust_weights(demands: List[Any]) -> List[Any]:
    """
    Adjust priority weights across maintenance demands based on source system data veracity.

    Rules:
    - TMS (Track Management System): trust_score retained as-is (high fidelity tablet input).
    - SMMS (Signalling Maintenance Management System):
        If trust_score < 0.8 and severity_tier in ("CRITICAL", "HIGH"):
            priority_weight bumped by 1.3x (conservative safety escalation).
    - TDMS (Traction Distribution Management System): trust_score retained as-is.

    Args:
        demands: List of BlockDemandInput objects or dict-like objects.

    Returns:
        List of modified demand objects with updated priority weights.
    """
    adjusted_demands = []

    for d in demands:
        # Create a shallow or copy-based clone to avoid unintended side effects on caller
        demand_copy = copy.copy(d)

        source_system = str(getattr(demand_copy, "source_system", "")).upper()
        trust_score = float(getattr(demand_copy, "trust_score", 1.0))
        severity = str(getattr(demand_copy, "severity_tier", "MEDIUM")).upper()
        current_weight = int(getattr(demand_copy, "priority_weight", 50))

        if source_system == "SMMS":
            if trust_score < 0.8 and severity in ("CRITICAL", "HIGH"):
                # Bump priority weight by 1.3x (safety conservatism)
                new_weight = int(round(current_weight * 1.3))
                setattr(demand_copy, "priority_weight", new_weight)
                # Store audit annotation if supported
                if hasattr(demand_copy, "trust_adjustment_applied"):
                    demand_copy.trust_adjustment_applied = True

        elif source_system == "TMS":
            # Direct tablet field inspection data - highly trustworthy
            pass

        elif source_system == "TDMS":
            # SCADA and power monitoring logs - trustworthy
            pass

        adjusted_demands.append(demand_copy)

    return adjusted_demands
