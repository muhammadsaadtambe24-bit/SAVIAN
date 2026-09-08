from typing import Optional
from sqlmodel import Field, SQLModel


class TrainSlot(SQLModel, table=True):
    __tablename__ = "train_slot"

    id: Optional[int] = Field(default=None, primary_key=True)
    train_number: str = Field(
        index=True,
        description="Train number / rake ID, e.g. 12155",
    )
    train_name: str = Field(
        description="Official train name, e.g. Bhopal Express",
    )
    train_type: str = Field(
        description="Train classification: RAJDHANI | VANDE_BHARAT | EXPRESS | MAIL | PASSENGER | FREIGHT",
    )
    direction: str = Field(
        description="Direction of travel: UP (towards Delhi / North) | DOWN (towards Itarsi / South)",
    )
    priority_weight: int = Field(
        description="Operational priority weight (Rajdhani=100, VB=90, Express=60, Mail=50, Passenger=30, Freight=20)",
    )
    path_json: str = Field(
        description="JSON array of station timetables: [{'station_code': str, 'arrival_minutes': int, 'departure_minutes': int}]",
    )
