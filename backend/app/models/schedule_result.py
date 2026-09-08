from datetime import datetime, timezone
from typing import Optional
from sqlmodel import Field, SQLModel


def get_current_utc_time() -> datetime:
    return datetime.now(timezone.utc)


class ScheduleResult(SQLModel, table=True):
    __tablename__ = "schedule_result"

    id: Optional[int] = Field(default=None, primary_key=True)
    solve_id: str = Field(
        unique=True,
        index=True,
        description="Unique optimization run identifier (UUID string)",
    )
    status: str = Field(
        description="Optimization outcome: OPTIMAL | FEASIBLE | INFEASIBLE",
    )
    objective_value: Optional[float] = Field(
        default=None,
        description="Solver objective function score",
    )
    optimality_gap: Optional[float] = Field(
        default=None,
        description="Optimality gap percentage (e.g. 0.02 for 2%)",
    )
    wall_time_sec: Optional[float] = Field(
        default=None,
        description="Solver execution duration in seconds",
    )
    mode: str = Field(
        default="COLD",
        description="Execution mode: COLD | WARM",
    )
    created_at: datetime = Field(
        default_factory=get_current_utc_time,
        description="Timestamp when optimization solve was executed",
    )


class GrantedBlock(SQLModel, table=True):
    __tablename__ = "granted_block"

    id: Optional[int] = Field(default=None, primary_key=True)
    solve_id: str = Field(
        foreign_key="schedule_result.solve_id",
        index=True,
        description="Foreign key referencing ScheduleResult.solve_id",
    )
    demand_id: int = Field(
        index=True,
        description="ID of the associated BlockDemand",
    )
    demand_code: str = Field(
        description="Business code of the associated BlockDemand",
    )
    granted_start_minutes: int = Field(
        description="Scheduled start time in minutes from midnight (0-1439)",
    )
    granted_end_minutes: int = Field(
        description="Scheduled end time in minutes from midnight (0-1439)",
    )
    section_from: str = Field(
        description="Section start station code",
    )
    section_to: str = Field(
        description="Section end station code",
    )
    is_shadow: bool = Field(
        default=False,
        description="Whether this block piggybacks on another primary block (shadow block)",
    )
    shadow_parent_id: Optional[int] = Field(
        default=None,
        description="Reference to primary GrantedBlock id if this is a shadow block",
    )
