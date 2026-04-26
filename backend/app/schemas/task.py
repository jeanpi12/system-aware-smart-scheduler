from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class TaskBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(default=None, max_length=500)
    priority: int = Field(..., ge=1, le=5)
    estimated_hours: float = Field(..., gt=0, le=24)
    deadline: datetime
    category: Optional[str] = Field(default=None, max_length=50)
    energy_required: int = Field(..., ge=1, le=5)


class TaskCreate(TaskBase):
    pass


class TaskUpdate(TaskBase):
    pass


class TaskResponse(TaskBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime