import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import init_db
from app.routers import (
    corridor_router,
    demands_router,
    solver_router,
    telemetry_router,
    lifecycle_router,
    pdf_router,
)
from seed.seed_data import seed_database


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: ensure DB tables exist + seed data."""
    os.makedirs("data", exist_ok=True)
    os.makedirs("backend/data", exist_ok=True)
    init_db()
    seed_database()
    yield


app = FastAPI(
    title="SAVIAN",
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

# --- Include Block 4 Routers ---
app.include_router(corridor_router, prefix="/api/corridor", tags=["Corridor"])
app.include_router(demands_router, prefix="/api/demands", tags=["Demands"])
app.include_router(solver_router, prefix="/api/solve", tags=["Solver"])
app.include_router(telemetry_router, prefix="/api/telemetry", tags=["Telemetry"])
app.include_router(lifecycle_router, prefix="/api/lifecycle", tags=["Lifecycle"])
app.include_router(pdf_router, prefix="/api/pdf", tags=["PDF"])


@app.get("/", tags=["health"])
async def root():
    """Health check endpoint."""
    return {"app": "SAVIAN", "version": "1.0.0", "status": "running"}

