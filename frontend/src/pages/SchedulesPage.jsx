import { useEffect, useState } from "react";
import ComparisonMetricBars from "../components/ComparisonMetricBars";
import ScheduleTimeline from "../components/ScheduleTimeline";
import StatCard from "../components/StatCard";
import {
  fetchPrioritySchedule,
  fetchRoundRobinSchedule,
  fetchScheduleComparison,
  fetchSjfSchedule,
} from "../services/scheduleApi";

export default function SchedulesPage() {
  const [activeAlgorithm, setActiveAlgorithm] = useState("priority");
  const [roundRobinQuantum, setRoundRobinQuantum] = useState("1.0");
  const [scheduleData, setScheduleData] = useState(null);
  const [comparisonData, setComparisonData] = useState(null);

  const [isLoadingSchedule, setIsLoadingSchedule] = useState(true);
  const [isLoadingComparison, setIsLoadingComparison] = useState(true);

  const [scheduleErrorMessage, setScheduleErrorMessage] = useState("");
  const [comparisonErrorMessage, setComparisonErrorMessage] = useState("");

  async function loadSchedule() {
    setIsLoadingSchedule(true);
    setScheduleErrorMessage("");

    try {
      let data;

      if (activeAlgorithm === "priority") {
        data = await fetchPrioritySchedule();
      } else if (activeAlgorithm === "sjf") {
        data = await fetchSjfSchedule();
      } else {
        data = await fetchRoundRobinSchedule(Number(roundRobinQuantum));
      }

      setScheduleData(data);
    } catch (error) {
      setScheduleErrorMessage(
        error.message || "Unable to load schedule data."
      );
    } finally {
      setIsLoadingSchedule(false);
    }
  }

  async function loadComparison() {
    setIsLoadingComparison(true);
    setComparisonErrorMessage("");

    try {
      const data = await fetchScheduleComparison();
      setComparisonData(data);
    } catch (error) {
      setComparisonErrorMessage(
        error.message || "Unable to load comparison data."
      );
    } finally {
      setIsLoadingComparison(false);
    }
  }

  async function refreshAll() {
    await Promise.all([loadSchedule(), loadComparison()]);
  }

  useEffect(() => {
    loadSchedule();
  }, [activeAlgorithm, roundRobinQuantum]);

  useEffect(() => {
    loadComparison();
  }, []);

  function getBlockStatusText(block) {
    if (!block.is_final_block) {
      return "Task still has remaining work after this block.";
    }

    return block.completed_before_deadline
      ? "Task completed before its deadline."
      : "Task missed its deadline.";
  }

  return (
    <div className="page-grid">
      <div className="content-card">
        <div className="section-header-row">
          <div>
            <p className="eyebrow">Scheduling Module</p>
            <h3 className="section-title">Live Scheduling Engine</h3>
          </div>

          <button className="action-button" onClick={refreshAll}>
            Refresh Schedule Data
          </button>
        </div>

        <p className="section-text">
          This page calls the backend scheduling endpoints and displays live
          algorithm results directly from FastAPI.
        </p>

        <div className="algorithm-controls">
          <button
            className={
              activeAlgorithm === "priority"
                ? "algorithm-button active"
                : "algorithm-button"
            }
            onClick={() => setActiveAlgorithm("priority")}
          >
            Priority
          </button>

          <button
            className={
              activeAlgorithm === "sjf"
                ? "algorithm-button active"
                : "algorithm-button"
            }
            onClick={() => setActiveAlgorithm("sjf")}
          >
            SJF
          </button>

          <button
            className={
              activeAlgorithm === "roundRobin"
                ? "algorithm-button active"
                : "algorithm-button"
            }
            onClick={() => setActiveAlgorithm("roundRobin")}
          >
            Round Robin
          </button>
        </div>

        {activeAlgorithm === "roundRobin" ? (
          <div className="quantum-row">
            <label className="form-field quantum-field">
              <span>Round Robin Time Quantum (hours)</span>
              <select
                value={roundRobinQuantum}
                onChange={(event) => setRoundRobinQuantum(event.target.value)}
              >
                <option value="0.5">0.5</option>
                <option value="1.0">1.0</option>
                <option value="1.5">1.5</option>
                <option value="2.0">2.0</option>
                <option value="3.0">3.0</option>
              </select>
            </label>
          </div>
        ) : null}
      </div>

      {isLoadingSchedule ? (
        <div className="content-card">
          <p className="section-text">Loading schedule data...</p>
        </div>
      ) : scheduleErrorMessage ? (
        <div className="content-card">
          <p className="error-text">{scheduleErrorMessage}</p>
        </div>
      ) : scheduleData ? (
        <>
          <div className="stats-row">
            <StatCard
              label="Selected Algorithm"
              value={scheduleData.algorithm}
              detail="This is the currently loaded live schedule."
            />
            <StatCard
              label="Total Tasks"
              value={scheduleData.metrics.total_tasks}
              detail="How many tasks were included in the schedule."
            />
            <StatCard
              label="Total Blocks"
              value={scheduleData.metrics.total_blocks}
              detail="Execution blocks produced by the algorithm."
            />
          </div>

          <div className="stats-row">
            <StatCard
              label="Total Estimated Hours"
              value={scheduleData.metrics.total_estimated_hours}
              detail="Combined estimated duration of all tasks."
            />
            <StatCard
              label="Completed Before Deadline"
              value={scheduleData.metrics.tasks_completed_before_deadline}
              detail="Tasks that finished on time."
            />
            <StatCard
              label="Missed Deadlines"
              value={scheduleData.metrics.tasks_missed_deadline}
              detail="Tasks that finished late."
            />
          </div>

          <ScheduleTimeline scheduleData={scheduleData} />

          <div className="content-card">
            <p className="eyebrow">Execution Blocks</p>
            <h3 className="section-title">Detailed Schedule Output</h3>
            <p className="section-text">
              This is the detailed backend output for each execution block. The
              timeline above helps you see the flow visually, while this section
              gives the full data for every block.
            </p>

            <div className="schedule-block-list">
              {scheduleData.scheduled_blocks.map((block) => (
                <div
                  key={`${block.task_id}-${block.execution_order}-${block.block_start}`}
                  className="schedule-block-card"
                >
                  <div className="task-card-header">
                    <div>
                      <p className="block-order">
                        Execution Block #{block.execution_order}
                      </p>
                      <h4 className="task-title">{block.title}</h4>
                    </div>

                    <span
                      className={
                        block.is_final_block ? "task-priority" : "block-badge"
                      }
                    >
                      {block.is_final_block ? "Final Block" : "In Progress"}
                    </span>
                  </div>

                  <div className="block-meta-grid">
                    <p>
                      <strong>Task ID:</strong> {block.task_id}
                    </p>
                    <p>
                      <strong>Priority:</strong> {block.priority}
                    </p>
                    <p>
                      <strong>Block Hours:</strong> {block.block_hours}
                    </p>
                    <p>
                      <strong>Remaining After Block:</strong>{" "}
                      {block.remaining_hours_after_block}
                    </p>
                    <p>
                      <strong>Block Start:</strong>{" "}
                      {new Date(block.block_start).toLocaleString()}
                    </p>
                    <p>
                      <strong>Block End:</strong>{" "}
                      {new Date(block.block_end).toLocaleString()}
                    </p>
                    <p>
                      <strong>Deadline:</strong>{" "}
                      {new Date(block.deadline).toLocaleString()}
                    </p>
                    <p>
                      <strong>Final Block:</strong>{" "}
                      {block.is_final_block ? "Yes" : "No"}
                    </p>
                  </div>

                  <p
                    className={
                      block.completed_before_deadline === false
                        ? "block-status late"
                        : "block-status"
                    }
                  >
                    {getBlockStatusText(block)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : null}

      <div className="content-card">
        <p className="eyebrow">Algorithm Comparison</p>
        <h3 className="section-title">Comparison Summary</h3>
        <p className="section-text">
          This section compares the backend’s Priority Scheduling and Shortest
          Job First summary output side by side.
        </p>

        {isLoadingComparison ? (
          <p className="section-text">Loading comparison data...</p>
        ) : comparisonErrorMessage ? (
          <p className="error-text">{comparisonErrorMessage}</p>
        ) : comparisonData ? (
          <>
            <ComparisonMetricBars comparisonData={comparisonData} />

            <div className="comparison-grid">
              {comparisonData.algorithms.map((algorithm) => (
                <div key={algorithm.algorithm} className="comparison-card">
                  <h4 className="task-title">{algorithm.algorithm}</h4>

                  <div className="task-meta-grid comparison-meta-grid">
                    <p>
                      <strong>Total Tasks:</strong> {algorithm.metrics.total_tasks}
                    </p>
                    <p>
                      <strong>Total Hours:</strong>{" "}
                      {algorithm.metrics.total_estimated_hours}
                    </p>
                    <p>
                      <strong>On Time:</strong>{" "}
                      {algorithm.metrics.tasks_completed_before_deadline}
                    </p>
                    <p>
                      <strong>Late:</strong>{" "}
                      {algorithm.metrics.tasks_missed_deadline}
                    </p>
                  </div>

                  <p className="comparison-subtitle">
                    First-appearance execution order
                  </p>

                  <ol className="comparison-list">
                    {algorithm.ordered_task_titles.map((title, index) => (
                      <li key={`${algorithm.algorithm}-${index}`}>{title}</li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}