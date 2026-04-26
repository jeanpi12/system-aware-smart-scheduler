from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.scheduler.priority import build_priority_schedule
from app.scheduler.round_robin import build_round_robin_schedule
from app.scheduler.sjf import build_sjf_schedule
from app.schemas.schedule import (
    AlgorithmComparison,
    ScheduleComparisonResponse,
    ScheduleResponse,
)
from app.services.task_service import get_all_tasks


def generate_priority_schedule(db: Session, owner_id: int) -> ScheduleResponse:
    tasks = get_all_tasks(db, owner_id)
    return build_priority_schedule(tasks)


def generate_sjf_schedule(db: Session, owner_id: int) -> ScheduleResponse:
    tasks = get_all_tasks(db, owner_id)
    return build_sjf_schedule(tasks)


def generate_round_robin_schedule(
    db: Session,
    owner_id: int,
    time_quantum_hours: float,
) -> ScheduleResponse:
    tasks = get_all_tasks(db, owner_id)
    return build_round_robin_schedule(tasks, time_quantum_hours)


def build_algorithm_comparison(schedule: ScheduleResponse) -> AlgorithmComparison:
    ordered_task_ids: list[int] = []
    ordered_task_titles: list[str] = []
    seen_task_ids: set[int] = set()

    for block in schedule.scheduled_blocks:
        if block.task_id not in seen_task_ids:
            seen_task_ids.add(block.task_id)
            ordered_task_ids.append(block.task_id)
            ordered_task_titles.append(block.title)

    return AlgorithmComparison(
        algorithm=schedule.algorithm,
        ordered_task_ids=ordered_task_ids,
        ordered_task_titles=ordered_task_titles,
        metrics=schedule.metrics,
    )


def generate_schedule_comparison(
    db: Session,
    owner_id: int,
) -> ScheduleComparisonResponse:
    priority_schedule = generate_priority_schedule(db, owner_id)
    sjf_schedule = generate_sjf_schedule(db, owner_id)

    return ScheduleComparisonResponse(
        generated_at=datetime.now(timezone.utc),
        comparison_basis=(
            "Algorithms are compared by first-appearance execution order "
            "and deadline-based metrics."
        ),
        algorithms=[
            build_algorithm_comparison(priority_schedule),
            build_algorithm_comparison(sjf_schedule),
        ],
    )