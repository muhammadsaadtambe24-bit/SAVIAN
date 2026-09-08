"""
LINE CLEAR — FastAPI Application Entry Point
AI-powered Railway Block Scheduling & Arbitration System
"""

import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.database import create_db_and_tables


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: create DB tables + seed data. Shutdown: cleanup."""
    # Ensure data directory exists for SQLite
    os.makedirs("data", exist_ok=True)
    await create_db_and_tables()

    # Seed data will be called here once Block 2 is integrated:
    # from seed_data import seed_all
    # await seed_all()

    yield


app = FastAPI(
    title="LINE CLEAR",
    description="AI-powered Railway Block Scheduling & Arbitration System — SIH 2026",
    version="1.0.0",
    lifespan=lifespan,
)

# --- CORS Middleware ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Placeholder Routers ---
# These will be replaced with real implementations when Block 4 arrives.

def _make_placeholder(name: str, prefix: str) -> APIRouter:
    """Create a placeholder router that returns 501 Not Implemented."""
    router = APIRouter(prefix=prefix, tags=[name])

    @router.get("/", operation_id=f"{name}_placeholder")
    async def _placeholder():
        return JSONResponse(
            status_code=501,
            content={"detail": f"{name} router not implemented yet — awaiting Block 4"},
        )

    return router


app.include_router(_make_placeholder("corridor", "/api/corridor"))
app.include_router(_make_placeholder("demands", "/api/demands"))
app.include_router(_make_placeholder("solve", "/api/solve"))
app.include_router(_make_placeholder("telemetry", "/api/telemetry"))
app.include_router(_make_placeholder("lifecycle", "/api/lifecycle"))
app.include_router(_make_placeholder("pdf", "/api/pdf"))


@app.get("/", tags=["health"])
async def root():
    """Health check endpoint."""
    return {"app": "LINE CLEAR", "version": "1.0.0", "status": "running"}
