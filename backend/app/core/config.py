import os

class Settings:
    PROJECT_NAME: str = "SAVIAN — Railway Arbitration Platform"
    VERSION: str = "2.0.0"
    API_V1_STR: str = "/api"
    
    # Corridor Configuration (Bina - Itarsi)
    CORRIDOR_SECTION: str = "BINA-ITARSI"
    CORRIDOR_LENGTH_KM: float = 152.4
    KAVACH_BUFFER_METERS: int = 1200
    NIGHT_REPLAN_SECONDS: int = 8
    
    # Database (Default to local SQLite with seamless PostgreSQL upgrade)
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./line_clear.db")
    
    # CORS Origins for Frontend UI
    CORS_ORIGINS: list = [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "*"
    ]

settings = Settings()
