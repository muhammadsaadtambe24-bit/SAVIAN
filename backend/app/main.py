from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base
from app.api.router import api_router

# Initialize database schema
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Backend microservices platform for Indian Railways Corridor Block Scheduling, OR-Tools CP-SAT Optimization, and Form T/409 Governance.",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Cross-Origin Resource Sharing (CORS) for Next.js / Vite React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Endpoints
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "system": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "corridor": settings.CORRIDOR_SECTION,
        "kavach_status": "SIL-4 ACTIVE",
        "docs": "/docs",
        "api_v1": settings.API_V1_STR
    }

@app.get("/health")
def health_check():
    return {
        "status": "HEALTHY",
        "database": "CONNECTED",
        "solver_engine": "OR-Tools CP-SAT READY",
        "kavach_headway_buffer": f"{settings.KAVACH_BUFFER_METERS}m"
    }
