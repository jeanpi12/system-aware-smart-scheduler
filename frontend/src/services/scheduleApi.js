import { apiRequest, parseErrorMessage } from "./apiClient";

async function fetchJson(path, errorMessage) {
  const response = await apiRequest(path);

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response, errorMessage));
  }

  return response.json();
}

export async function fetchPrioritySchedule() {
  return fetchJson(
    "/schedule/priority",
    "Failed to load the priority schedule."
  );
}

export async function fetchSjfSchedule() {
  return fetchJson(
    "/schedule/sjf",
    "Failed to load the shortest-job-first schedule."
  );
}

export async function fetchRoundRobinSchedule(timeQuantumHours = 1.0) {
  return fetchJson(
    `/schedule/round-robin?time_quantum_hours=${encodeURIComponent(
      timeQuantumHours
    )}`,
    "Failed to load the round robin schedule."
  );
}

export async function fetchScheduleComparison() {
  return fetchJson(
    "/schedule/compare",
    "Failed to load the schedule comparison data."
  );
}