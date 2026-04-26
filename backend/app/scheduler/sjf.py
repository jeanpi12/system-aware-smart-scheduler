from datetime import timedelta

from app.scheduler.common import build_schedule_metrics, get_schedule_start
from app.schemas.schedule import ScheduleResponse, ScheduledBlock
from app.schemas.task import TaskResponse


def build_sjf_schedule(tasks: list[TaskResponse]) -> ScheduleResponse:
    schedule_start = get_schedule_start(tasks)

    ordered_tasks = sorted(
        tasks,
        key=lambda task: (
            task.estimated_hours,
            task.deadline,
            -task.priority,
            task.id,
        ),
    )

    current_time = schedule_start
    scheduled_blocks: list[ScheduledBlock] = []

    for execution_order, task in enumerate(ordered_tasks, start=1):
        block_start = current_time
        block_end = block_start + timedelta(hours=task.estimated_hours)
        completed_before_deadline = block_end <= task.deadline

        scheduled_block = ScheduledBlock(
            execution_order=execution_order,
            task_id=task.id,
            title=task.title,
            priority=task.priority,
            block_hours=task.estimated_hours,
            remaining_hours_after_block=0.0,
            deadline=task.deadline,
            block_start=block_start,
            block_end=block_end,
            is_final_block=True,
            completed_before_deadline=completed_before_deadline,
        )

        scheduled_blocks.append(scheduled_block)
        current_time = block_end

    metrics = build_schedule_metrics(tasks, scheduled_blocks)

    return ScheduleResponse(
        algorithm="Shortest Job First (Non-Preemptive)",
        generated_at=schedule_start,
        scheduled_blocks=scheduled_blocks,
        metrics=metrics,
    )