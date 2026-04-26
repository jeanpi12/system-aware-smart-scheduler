from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class ScheduledBlock(BaseModel):
    execution_order: int
    task_id: int
    title: str
    priority: int
    block_hours: float
    remaining_hours_after_block: float
    deadline: datetime
    block_start: datetime
    block_end: datetime
    is_final_block: bool
    completed_before_deadline: Optional[bool] = None


class ScheduleMetrics(BaseModel):
    total_tasks: int
    total_estimated_hours: float
    tasks_completed_before_deadline: int
    tasks_missed_deadline: int
    total_blocks: int


class ScheduleResponse(BaseModel):
    algorithm: str
    generated_at: datetime
    scheduled_blocks: list[ScheduledBlock]
    metrics: ScheduleMetrics
    time_quantum_hours: Optional[float] = None


class AlgorithmComparison(BaseModel):
    algorithm: str
    ordered_task_ids: list[int]
    ordered_task_titles: list[str]
    metrics: ScheduleMetrics


class ScheduleComparisonResponse(BaseModel):
    generated_at: datetime
    comparison_basis: str
    algorithms: list[AlgorithmComparison]