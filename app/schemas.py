
from pydantic import BaseModel, Field
from datetime import datetime


class TaskCreate(BaseModel):

    title: str = Field(min_length=1, max_length=200)

    description: str | None = Field(default=None, max_length=500)


class TaskUpdate(BaseModel):

    title: str | None = Field(default=None, min_length=1, max_length=200)

    description: str | None = Field(default=None, max_length=500)

    completed: bool | None = None


class TaskResponse(BaseModel):

    id: int
    title: str
    description: str | None
    completed: bool
    created_at: datetime

    model_config = {"from_attributes": True}
