"""
Routers for LINE CLEAR Railway Block Scheduling API.
"""

from app.routers.corridor import router as corridor_router
from app.routers.demands import router as demands_router
from app.routers.lifecycle import router as lifecycle_router
from app.routers.pdf import router as pdf_router
from app.routers.solver import router as solver_router
from app.routers.telemetry import router as telemetry_router, telemetry_bus

__all__ = [
    "corridor_router",
    "demands_router",
    "solver_router",
    "telemetry_router",
    "lifecycle_router",
    "pdf_router",
    "telemetry_bus",
]
