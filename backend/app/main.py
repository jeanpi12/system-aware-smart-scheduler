from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.db.init_db import init_db
from app.db.session import get_db
from app.models.user import UserModel
from app.schemas.schedule import ScheduleComparisonResponse, ScheduleResponse
from app.schemas.task import TaskCreate, TaskResponse, TaskUpdate
from app.schemas.user import TokenResponse, UserCreate, UserLogin, UserResponse
from app.services.auth_service import (
    authenticate_user,
    get_current_user,
    register_user,
)
from app.services.scheduler_service import (
    generate_priority_schedule,
    generate_round_robin_schedule,
    generate_schedule_comparison,
    generate_sjf_schedule,
)
from app.services.task_service import (
    create_task,
    delete_task,
    get_all_tasks,
    update_task,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost",
        "http://127.0.0.1",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "System-Aware Smart Scheduler is running"}


@app.post("/auth/register", response_model=UserResponse)
def register_route(user: UserCreate, db: Session = Depends(get_db)):
    return register_user(db, user)


@app.post("/auth/login", response_model=TokenResponse)
def login_route(user: UserLogin, db: Session = Depends(get_db)):
    return authenticate_user(db, user)


@app.get("/auth/me", response_model=UserResponse)
def me_route(current_user: UserModel = Depends(get_current_user)):
    return UserResponse.model_validate(current_user)


@app.post("/tasks", response_model=TaskResponse)
def create_task_route(
    task: TaskCreate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    return create_task(db, task, current_user.id)


@app.get("/tasks", response_model=list[TaskResponse])
def get_tasks(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    return get_all_tasks(db, current_user.id)


@app.put("/tasks/{task_id}", response_model=TaskResponse)
def update_task_route(
    task_id: int,
    task: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    return update_task(db, task_id, current_user.id, task)


@app.delete("/tasks/{task_id}")
def delete_task_route(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    delete_task(db, task_id, current_user.id)
    return {"message": "Task deleted successfully."}


@app.get("/schedule/priority", response_model=ScheduleResponse)
def get_priority_schedule(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    return generate_priority_schedule(db, current_user.id)


@app.get("/schedule/sjf", response_model=ScheduleResponse)
def get_sjf_schedule(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    return generate_sjf_schedule(db, current_user.id)


@app.get("/schedule/round-robin", response_model=ScheduleResponse)
def get_round_robin_schedule(
    time_quantum_hours: float = Query(default=1.0, gt=0, le=8),
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    return generate_round_robin_schedule(db, current_user.id, time_quantum_hours)


@app.get("/schedule/compare", response_model=ScheduleComparisonResponse)
def compare_schedules(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    return generate_schedule_comparison(db, current_user.id)