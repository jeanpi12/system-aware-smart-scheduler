function formatMetricValue(value) {
  if (typeof value === "number" && !Number.isInteger(value)) {
    return value.toFixed(2);
  }

  return value;
}

function MetricRow({ label, algorithms, getValue }) {
  const values = algorithms.map(getValue);
  const maxValue = Math.max(...values, 1);

  return (
    <div className="metric-row">
      <p className="metric-row-label">{label}</p>

      <div className="metric-row-bars">
        {algorithms.map((algorithm) => {
          const value = getValue(algorithm);
          const widthPercent = (value / maxValue) * 100;

          return (
            <div key={`${label}-${algorithm.algorithm}`} className="metric-bar-card">
              <div className="metric-bar-header">
                <span>{algorithm.algorithm}</span>
                <strong>{formatMetricValue(value)}</strong>
              </div>

              <div className="metric-bar-track">
                <div
                  className="metric-bar-fill"
                  style={{ width: `${widthPercent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ComparisonMetricBars({ comparisonData }) {
  const algorithms = comparisonData?.algorithms || [];

  if (!algorithms.length) {
    return null;
  }

  return (
    <div className="content-card">
      <p className="eyebrow">Visual Comparison</p>
      <h3 className="section-title">Algorithm Metric Bars</h3>
      <p className="section-text">
        These bars make it easier to compare summary metrics without reading
        every value individually.
      </p>

      <div className="metric-bar-grid">
        <MetricRow
          label="Tasks Completed Before Deadline"
          algorithms={algorithms}
          getValue={(algorithm) =>
            algorithm.metrics.tasks_completed_before_deadline
          }
        />

        <MetricRow
          label="Tasks Missed Deadline"
          algorithms={algorithms}
          getValue={(algorithm) => algorithm.metrics.tasks_missed_deadline}
        />

        <MetricRow
          label="Total Estimated Hours"
          algorithms={algorithms}
          getValue={(algorithm) => algorithm.metrics.total_estimated_hours}
        />

        <MetricRow
          label="Total Blocks"
          algorithms={algorithms}
          getValue={(algorithm) => algorithm.metrics.total_blocks}
        />
      </div>
    </div>
  );
}