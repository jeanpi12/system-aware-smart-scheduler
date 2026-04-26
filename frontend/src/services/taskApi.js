import { apiRequest, parseErrorMessage } from "./apiClient";

export async function fetchTasks() {
  const response = await apiRequest("/tasks");

  if (!response.ok) {
    throw new Error(
      await parseErrorMessage(response, "Failed to load tasks from the backend.")
    );
  }

  return response.json();
}

export async function createTask(taskData) {
  const response = await apiRequest("/tasks", {
    method: "POST",
    body: JSON.stringify(taskData),
  });

  if (!response.ok) {
    throw new Error(
      await parseErrorMessage(response, "Failed to create task.")
    );
  }

  return response.json();
}

export async function updateTask(taskId, taskData) {
  const response = await apiRequest(`/tasks/${taskId}`, {
    method: "PUT",
    body: JSON.stringify(taskData),
  });

  if (!response.ok) {
    throw new Error(
      await parseErrorMessage(response, "Failed to update task.")
    );
  }

  return response.json();
}

export async function deleteTask(taskId) {
  const response = await apiRequest(`/tasks/${taskId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(
      await parseErrorMessage(response, "Failed to delete task.")
    );
  }

  return response.json();
}