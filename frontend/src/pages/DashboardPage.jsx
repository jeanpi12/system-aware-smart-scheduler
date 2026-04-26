import { useEffect, useMemo, useState } from "react";
import StatCard from "../components/StatCard";
import { fetchScheduleComparison } from "../services/scheduleApi";
import { fetchTasks } from "../services/taskApi";

export default function DashboardPage() {
  const [tasks, setTasks] = useState([]);
  const [comparisonData, setComparisonData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  async function loadDashboardData() {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const [taskData, comparisonResponse] = await Promise.all([
        fetchTasks(),
        fetchScheduleComparison(),
      ]);

      setTasks(taskData);
      setComparisonData(comparisonResponse);
    } catch (error) {
      setErrorMessage(error.message || "Unable to load dashboard data.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadDashboardData();
  }, []);

  const dashboardMetrics = useMemo(() => {
    const totalTasks = tasks.length;
    const totalEstimatedHours = tasks.reduce(
      (sum, task) => sum + Number(task.estimated_hours || 0),
      0
    );

    const now = new Date();

    const overdueTasks = tasks.filter(
      (task) => new Date(task.deadline) < now
    ).length;

    const latestTask =
      tasks.length > 0 ? [...tasks].sort((a, b) => b.id - a.id)[0] : null;

    return {
      totalTasks,
      totalEstimatedHours: totalEstimatedHours.toFixed(2),
      overdueTasks,
      latestTask,
    };
  }, [tasks]);

  return (
    <div className="page-grid">
      <div className="content-card">
        <div className="section-header-row">
          <div>
            <p className="eyebrow">Project Overview</p>
            <h3 className="section-title">Scheduler Control Center</h3>
          </div>

          <button className="action-button" onClick={loadDashboardData}>
            Refresh Dashboard
          </button>
        </div>

        <p className="section-text">
          This dashboard combines live task data and live schedule-comparison
          data from the backend so you can quickly understand the state of the
          system.
        </p>
      </div>

      {isLoading ? (
        <div className="content-card">
          <p className="section-text">Loading dashboard data...</p>
        </div>
      ) : errorMessage ? (
        <div className="content-card">
          <p className="error-text">{errorMessage}</p>
        </div>
      ) : (
        <>
          <div className="stats-row">
            <StatCard
              label="Total Tasks"
              value={dashboardMetrics.totalTasks}
              detail="Tasks currently stored in PostgreSQL."
            />
            <StatCard
              label="Total Estimated Hours"
              value={dashboardMetrics.totalEstimatedHours}
              detail="Combined workload across all current tasks."
            />
            <StatCard
              label="Overdue Tasks"
              value={dashboardMetrics.overdueTasks}
              detail="Tasks whose deadlines are already in the past."
            />
          </div>

          <div className="stats-row">
            <StatCard
              label="Algorithms Available"
              value="3"
              detail="Priority, Shortest Job First, and Round Robin."
            />
            <StatCard
              label="Comparison Endpoints"
              value={comparisonData?.algorithms?.length || 0}
              detail="Algorithm summaries currently returned by the backend."
            />
            <StatCard
              label="Backend Status"
              value="Connected"
              detail="Frontend is successfully reading live backend data."
            />
          </div>

          <div className="dashboard-two-column">
            <div className="content-card">
              <p className="eyebrow">Latest Task</p>
              <h3 className="section-title">Most Recently Created Task</h3>

              {dashboardMetrics.latestTask ? (
                <div className="dashboard-highlight">
                  <h4 className="task-title">{dashboardMetrics.latestTask.title}</h4>
                  <p className="task-description">
                    {dashboardMetrics.latestTask.description ||
                      "No description provided."}
                  </p>

                  <div className="task-meta-grid">
                    <p>
                      <strong>Priority:</strong>{" "}
                      {dashboardMetrics.latestTask.priority}
                    </p>
                    <p>
                      <strong>Estimated Hours:</strong>{" "}
                      {dashboardMetrics.latestTask.estimated_hours}
                    </p>
                    <p>
                      <strong>Category:</strong>{" "}
                      {dashboardMetrics.latestTask.category || "Uncategorized"}
                    </p>
                    <p>
                      <strong>Deadline:</strong>{" "}
                      {new Date(
                        dashboardMetrics.latestTask.deadline
                      ).toLocaleString()}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="section-text">
                  No tasks exist yet. Create one from the Tasks page.
                </p>
              )}
            </div>

            <div className="content-card">
              <p className="eyebrow">Comparison Snapshot</p>
              <h3 className="section-title">Algorithm Summary</h3>

              {comparisonData?.algorithms?.length ? (
                <div className="dashboard-summary-list">
                  {comparisonData.algorithms.map((algorithm) => (
                    <div
                      key={algorithm.algorithm}
                      className="dashboard-summary-item"
                    >
                      <h4 className="task-title">{algorithm.algorithm}</h4>
                      <p className="section-text compact-text">
                        On time:{" "}
                        {algorithm.metrics.tasks_completed_before_deadline} | Late:{" "}
                        {algorithm.metrics.tasks_missed_deadline}
                      </p>
                      <p className="section-text compact-text">
                        First task:{" "}
                        {algorithm.ordered_task_titles[0] || "No tasks available"}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="section-text">
                  Comparison data is not available yet.
                </p>
              )}
            </div>
          </div>

          <div className="content-card">
            <p className="eyebrow">What this dashboard now proves</p>
            <h3 className="section-title">Live Full-Stack Summary</h3>
            <ul className="feature-list">
              <li>The frontend is reading live tasks from PostgreSQL through FastAPI.</li>
              <li>The frontend is reading live comparison data from the scheduler API.</li>
              <li>The dashboard can summarize current workload and scheduling outcomes.</li>
              <li>The project now has a real top-level monitoring view.</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}