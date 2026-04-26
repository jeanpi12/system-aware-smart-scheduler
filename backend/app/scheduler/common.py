from datetime import datetime, timezone

from app.schemas.schedule import ScheduleMetrics, ScheduledBlock
from app.schemas.task import TaskResponse


def is_timezone_aware(value: datetime) -> bool:
    return value.tzinfo is not None and value.tzinfo.utcoffset(value) is not None


def get_schedule_start(tasks: list[TaskResponse]) -> datetime:
    if tasks and is_timezone_aware(tasks[0].deadline):
        return datetime.now(timezone.utc)
    return datetime.now()


def build_schedule_metrics(
    input_tasks: list[TaskResponse],
    scheduled_blocks: list[ScheduledBlock],
) -> ScheduleMetrics:
    final_blocks = [block for block in scheduled_blocks if block.is_final_block]

    return ScheduleMetrics(
        total_tasks=len(input_tasks),
        total_estimated_hours=round(
            sum(task.estimated_hours for task in input_tasks), 2
        ),
        tasks_completed_before_deadline=sum(
            1 for block in final_blocks if block.completed_before_deadline is True
        ),
        tasks_missed_deadline=sum(
            1 for block in final_blocks if block.completed_before_deadline is False
        ),
        total_blocks=len(scheduled_blocks),
    )