
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from typing import Literal
from pathlib import Path

from app import models, schemas, crud
from app.database import engine, get_db


# Create database tables
models.Base.metadata.create_all(bind=engine)


# Initialize FastAPI
app = FastAPI(
    title="Task Manager API",
    description="Simple Task Manager Application",
    version="1.0.0"
)


# CREATE TASK
@app.post(
    "/tasks/",
    response_model=schemas.TaskResponse,
    status_code=status.HTTP_201_CREATED
)
def create_task(
    task: schemas.TaskCreate,
    db: Session = Depends(get_db)
):
    if not task.title.strip():
        raise HTTPException(400, "Task title cannot be empty")

    return crud.create_task(db, task)


# GET ALL TASKS WITH FILTER
@app.get("/tasks/", response_model=list[schemas.TaskResponse])
def read_tasks(
    status_filter: Literal["all", "completed", "pending"] = "all",
    db: Session = Depends(get_db)
):
    return crud.get_tasks(db, status_filter)


# GET TASK BY ID
@app.get("/tasks/{task_id}", response_model=schemas.TaskResponse)
def read_task(
    task_id: int,
    db: Session = Depends(get_db)
):
    task = crud.get_task(db, task_id)

    if not task:
        raise HTTPException(404, "Task not found")

    return task


# UPDATE TASK
@app.put("/tasks/{task_id}", response_model=schemas.TaskResponse)
@app.patch("/tasks/{task_id}", response_model=schemas.TaskResponse)
def update_task(
    task_id: int,
    task: schemas.TaskUpdate,
    db: Session = Depends(get_db)
):
    updated_task = crud.update_task(db, task_id, task)

    if not updated_task:
        raise HTTPException(404, "Task not found")

    return updated_task


# DELETE TASK
@app.delete("/tasks/{task_id}")
def remove_task(
    task_id: int,
    db: Session = Depends(get_db)
):
    deleted = crud.delete_task(db, task_id)

    if not deleted:
        raise HTTPException(404, "Task not found")

    return {"message": "Task deleted successfully"}


# SERVE FRONTEND
BASE_DIR = Path(__file__).resolve().parent.parent
STATIC_DIR = BASE_DIR / "static"

app.mount(
    "/",
    StaticFiles(directory=STATIC_DIR, html=True),
    name="frontend"
)
 