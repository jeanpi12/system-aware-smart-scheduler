import { useEffect, useState } from "react";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import TasksPage from "./pages/TasksPage";
import SchedulesPage from "./pages/SchedulesPage";
import {
  clearAuthToken,
  getAuthToken,
  setAuthToken,
} from "./services/apiClient";
import { fetchCurrentUser } from "./services/authApi";

const pageMap = {
  dashboard: DashboardPage,
  tasks: TasksPage,
  schedules: SchedulesPage,
};

export default function App() {
  const [activePage, setActivePage] = useState("dashboard");
  const [currentUser, setCurrentUser] = useState(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    async function restoreSession() {
      const token = getAuthToken();

      if (!token) {
        setIsCheckingSession(false);
        return;
      }

      try {
        const user = await fetchCurrentUser();
        setCurrentUser(user);
      } catch {
        clearAuthToken();
        setCurrentUser(null);
      } finally {
        setIsCheckingSession(false);
      }
    }

    restoreSession();
  }, []);

  function handleAuthSuccess(token, user) {
    setAuthToken(token);
    setCurrentUser(user);
    setActivePage("dashboard");
  }

  function handleLogout() {
    clearAuthToken();
    setCurrentUser(null);
    setActivePage("dashboard");
  }

  if (isCheckingSession) {
    return (
      <div className="auth-shell">
        <div className="auth-card">
          <h2 className="section-title">Checking session...</h2>
          <p className="section-text">Loading your account.</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  const ActivePageComponent = pageMap[activePage];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <p className="brand-label">System-Aware</p>
          <h1 className="brand-title">Smart Scheduler</h1>
        </div>

        <nav className="sidebar-nav">
          <button
            className={activePage === "dashboard" ? "nav-button active" : "nav-button"}
            onClick={() => setActivePage("dashboard")}
          >
            Dashboard
          </button>

          <button
            className={activePage === "tasks" ? "nav-button active" : "nav-button"}
            onClick={() => setActivePage("tasks")}
          >
            Tasks
          </button>

          <button
            className={activePage === "schedules" ? "nav-button active" : "nav-button"}
            onClick={() => setActivePage("schedules")}
          >
            Schedules
          </button>
        </nav>
      </aside>

      <main className="main-content">
        <header className="page-header">
          <div>
            <p className="eyebrow">Frontend Foundation</p>
            <h2 className="page-title">System-Aware Smart Scheduler</h2>
          </div>

          <div className="header-user-panel">
            <span className="user-chip">{currentUser.email}</span>
            <button className="secondary-button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>

        <section className="page-body">
          <ActivePageComponent />
        </section>
      </main>
    </div>
  );
}