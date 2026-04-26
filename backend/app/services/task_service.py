from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.task import TaskModel
from app.schemas.task import TaskCreate, TaskResponse, TaskUpdate


def create_task(db: Session, task: TaskCreate, owner_id: int) -> TaskResponse:
    db_task = TaskModel(**task.model_dump(), owner_id=owner_id)

    db.add(db_task)
    db.commit()
    db.refresh(db_task)

    return TaskResponse.model_validate(db_task)


def get_all_tasks(db: Session, owner_id: int) -> list[TaskResponse]:
    statement = (
        select(TaskModel)
        .where(TaskModel.owner_id == owner_id)
        .order_by(TaskModel.id)
    )
    tasks = db.scalars(statement).all()

    return [TaskResponse.model_validate(task) for task in tasks]


def get_task_model_by_id(
    db: Session,
    task_id: int,
    owner_id: int,
) -> TaskModel:
    statement = select(TaskModel).where(
        TaskModel.id == task_id,
        TaskModel.owner_id == owner_id,
    )
    db_task = db.scalar(statement)

    if db_task is None:
        raise HTTPException(status_code=404, detail="Task not found.")

    return db_task


def update_task(
    db: Session,
    task_id: int,
    owner_id: int,
    task_update: TaskUpdate,
) -> TaskResponse:
    db_task = get_task_model_by_id(db, task_id, owner_id)

    update_data = task_update.model_dump()

    for field_name, field_value in update_data.items():
        setattr(db_task, field_name, field_value)

    db.commit()
    db.refresh(db_task)

    return TaskResponse.model_validate(db_task)


def delete_task(db: Session, task_id: int, owner_id: int) -> None:
    db_task = get_task_model_by_id(db, task_id, owner_id)

    db.delete(db_task)
    db.commit()