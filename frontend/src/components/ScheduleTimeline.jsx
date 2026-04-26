const accentPalette = [
  "#2563eb",
  "#7c3aed",
  "#059669",
  "#ea580c",
  "#dc2626",
  "#0891b2",
];

function getAccentColor(taskId) {
  return accentPalette[(taskId - 1) % accentPalette.length];
}

function formatDateTime(value) {
  return new Date(value).toLocaleString();
}

export default function ScheduleTimeline({ scheduleData }) {
  if (!scheduleData?.scheduled_blocks?.length) {
    return (
      <div className="content-card">
        <p className="section-text">No schedule blocks are available yet.</p>
      </div>
    );
  }

  const totalBlockHours = scheduleData.scheduled_blocks.reduce(
    (sum, block) => sum + Number(block.block_hours || 0),
    0
  );

  return (
    <div className="content-card">
      <div className="section-header-row">
        <div>
          <p className="eyebrow">Visual Timeline</p>
          <h3 className="section-title">{scheduleData.algorithm}</h3>
        </div>

        <div className="timeline-badge-group">
          <span className="timeline-badge">
            {scheduleData.metrics.total_blocks} blocks
          </span>

          <span className="timeline-badge">
            {totalBlockHours.toFixed(2)} total hours
          </span>

          {scheduleData.time_quantum_hours ? (
            <span className="timeline-badge">
              Quantum {scheduleData.time_quantum_hours}h
            </span>
          ) : (
            <span className="timeline-badge">Non-preemptive</span>
          )}
        </div>
      </div>

      <p className="section-text">
        Each segment below represents one execution block returned by the
        backend. Wider segments represent longer block durations, and Round
        Robin may show the same task multiple times.
      </p>

      <div className="timeline-track">
        {scheduleData.scheduled_blocks.map((block) => (
          <div
            key={`${block.task_id}-${block.execution_order}-${block.block_start}`}
            className="timeline-segment"
            style={{
              "--segment-accent": getAccentColor(block.task_id),
              flexGrow: Math.max(Number(block.block_hours || 0), 0.5),
            }}
          >
            <div className="timeline-segment-inner">
              <p className="timeline-segment-order">
                Block #{block.execution_order}
              </p>
              <h4 className="timeline-segment-title">{block.title}</h4>
              <p className="timeline-segment-hours">{block.block_hours}h</p>
              <p className="timeline-segment-range">
                {formatDateTime(block.block_start)} →{" "}
                {formatDateTime(block.block_end)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="timeline-sequence-list">
        {scheduleData.scheduled_blocks.map((block) => (
          <div
            key={`${block.task_id}-${block.execution_order}-summary`}
            className="timeline-sequence-item"
            style={{ "--segment-accent": getAccentColor(block.task_id) }}
          >
            <span className="timeline-sequence-dot" />
            <div>
              <p className="timeline-sequence-title">
                #{block.execution_order} — {block.title}
              </p>
              <p className="timeline-sequence-detail">
                {block.block_hours}h block
                {block.is_final_block
                  ? block.completed_before_deadline
                    ? " • completed before deadline"
                    : " • completed after deadline"
                  : ` • ${block.remaining_hours_after_block}h remaining after this block`}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}