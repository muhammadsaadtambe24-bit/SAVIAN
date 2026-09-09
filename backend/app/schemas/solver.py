from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class TrainScheduleOutput(BaseModel):
    start: int
    delay: int

class ConflictResolution(BaseModel):
    block_id: str
    shifted_minutes: int
    reason: str

class ShadowDetection(BaseModel):
    primary: str
    shadow: str
    time_saved_hours: float

class XAIResponse(BaseModel):
    conflict_resolutions: List[ConflictResolution]
    shadow_detections: List[ShadowDetection]

class TelemetryPoint(BaseModel):
    iteration: int
    objective_cost: float
    best_bound: float
    time_sec: float

class SolveRequest(BaseModel):
    demands: Optional[List[Dict[str, Any]]] = None
    chaos_mode: bool = False
    section: str = "BINA-ITARSI"
    max_solve_time_sec: float = 8.0

class SolveResponse(BaseModel):
    solve_id: str
    status: str
    optimality_gap: float
    wall_time_sec: float
    clashes_detected: int
    shadow_merges: int
    train_schedules: Dict[str, TrainScheduleOutput]
    xai: XAIResponse
    telemetry: List[TelemetryPoint]
