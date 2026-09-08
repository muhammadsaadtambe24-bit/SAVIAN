from typing import Optional
from sqlmodel import Field, SQLModel


class Station(SQLModel, table=True):
    __tablename__ = "station"

    id: Optional[int] = Field(default=None, primary_key=True)
    code: str = Field(unique=True, index=True, description="Station code, e.g. BINA")
    name: str = Field(description="Full station name, e.g. Bina Junction")
    distance_km: float = Field(description="Chainage distance in km from reference station BINA")
    division: str = Field(default="BPL", description="Railway division code, e.g. BPL")
    zone: str = Field(default="WCR", description="Railway zone code, e.g. WCR")
    kavach_status: str = Field(
        default="NOT_EQUIPPED",
        description="Automatic Train Protection (ATP) Kavach status: NOT_EQUIPPED | IN_TRIALS | COMMISSIONED",
    )
    line_type: str = Field(
        default="DOUBLE",
        description="Track configuration, e.g. DOUBLE, SINGLE, TRIPLE",
    )
