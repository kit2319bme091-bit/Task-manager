
from sqlalchemy.orm import Session
from app import models, schemas


def create_task(db: Session, task: schemas.TaskCreate):

    new_task = models.Task(
        title=task.title.strip(),
        description=task.description
    )

    db.add(new_task)
    db.commit()
    db.refresh(new_task)

    return new_task


def get_tasks(db: Session, status="all"):

    query = db.query(models.Task)

    if status == "completed":
        query = query.filter(models.Task.completed.is_(True))

    elif status == "pending":
        query = query.filter(models.Task.completed.is_(False))

    return query.order_by(models.Task.id.desc()).all()


def get_task(db: Session, task_id: int):

    return db.query(models.Task).filter(
        models.Task.id == task_id
    ).first()


def update_task(db: Session, task_id: int, task: schemas.TaskUpdate):

    db_task = get_task(db, task_id)

    if not db_task:
        return None

    data = task.model_dump(exclude_unset=True)

    if "title" in data and data["title"] is not None:
        data["title"] = data["title"].strip()

    for key, value in data.items():
        setattr(db_task, key, value)

    db.commit()
    db.refresh(db_task)

    return db_task


def delete_task(db: Session, task_id: int):

    db_task = get_task(db, task_id)

    if not db_task:
        return None

    db.delete(db_task)
    db.commit()

    return db_task
