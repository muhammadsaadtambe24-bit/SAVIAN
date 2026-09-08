"""
Indian Railways Block Scheduling Optimization Engine (LINE CLEAR).

Core CP-SAT constraint-programming solver package built on Google OR-Tools.
"""

from app.solver.constraints import (
    add_equipment_clash_prevention,
    add_integrated_block_coupling,
    add_no_overlap_per_section,
    add_power_block_containment,
)
from app.solver.engine import (
    BlockDemandInput,
    RailwayBlockScheduler,
    SchedulerProgressCallback,
    TrainSlotInput,
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

__all__ = [
    "RailwayBlockScheduler",
    "TrainSlotInput",
    "BlockDemandInput",
    "SchedulerProgressCallback",
    "add_no_overlap_per_section",
    "add_equipment_clash_prevention",
    "add_power_block_containment",
    "add_integrated_block_coupling",
    "build_train_delay_cost",
    "build_block_deviation_cost",
    "build_shadow_merge_bonus",
    "build_speed_debt_cost",
    "build_night_preference_bonus",
    "apply_trust_weights",
    "get_section_buffer",
    "add_kavach_headway_constraints",
    "calculate_speed_debt",
    "apply_warm_start_hints",
]
