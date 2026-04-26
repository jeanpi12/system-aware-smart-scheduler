from collections import deque
from datetime import timedelta

from app.scheduler.common import build_schedule_metrics, get_schedule_start
from app.schemas.schedule import ScheduleResponse, ScheduledBlock
from app.schemas.task import TaskResponse


def build_round_robin_schedule(
    tasks: list[TaskResponse],
    time_quantum_hours: float = 1.0,
) -> ScheduleResponse:
    schedule_start = get_schedule_start(tasks)

    ordered_tasks = sorted(tasks, key=lambda task: (task.created_at, task.id))

    execution_queue = deque(
        {
            "task": task,
            "remaining_hours": task.estimated_hours,
        }
        for task in ordered_tasks
    )

    current_time = schedule_start
    execution_order = 1
    scheduled_blocks: list[ScheduledBlock] = []

    while execution_queue:
        current_item = execution_queue.popleft()
        task = current_item["task"]
        remaining_hours = current_item["remaining_hours"]

        block_hours = round(min(remaining_hours, time_quantum_hours), 2)
        block_start = current_time
        block_end = block_start + timedelta(hours=block_hours)

        remaining_hours_after_block = round(
            max(remaining_hours - block_hours, 0), 2
        )
        is_final_block = remaining_hours_after_block == 0

        completed_before_deadline = (
            block_end <= task.deadline if is_final_block else None
        )

        scheduled_block = ScheduledBlock(
            execution_order=execution_order,
            task_id=task.id,
            title=task.title,
            priority=task.priority,
            block_hours=block_hours,
            remaining_hours_after_block=remaining_hours_after_block,
            deadline=task.deadline,
            block_start=block_start,
            block_end=block_end,
            is_final_block=is_final_block,
            completed_before_deadline=completed_before_deadline,
        )

        scheduled_blocks.append(scheduled_block)
        current_time = block_end
        execution_order += 1

        if not is_final_block:
            execution_queue.append(
                {
                    "task": task,
                    "remaining_hours": remaining_hours_after_block,
                }
            )

    metrics = build_schedule_metrics(tasks, scheduled_blocks)

    return ScheduleResponse(
        algorithm="Round Robin",
        generated_at=schedule_start,
        scheduled_blocks=scheduled_blocks,
        metrics=metrics,
        time_quantum_hours=time_quantum_hours,
    )