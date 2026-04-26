import { apiRequest, parseErrorMessage } from "./apiClient";

export async function registerUser(userData) {
  const response = await apiRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    throw new Error(
      await parseErrorMessage(response, "Failed to create account.")
    );
  }

  return response.json();
}

export async function loginUser(userData) {
  const response = await apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response, "Login failed."));
  }

  return response.json();
}

export async function fetchCurrentUser() {
  const response = await apiRequest("/auth/me");

  if (!response.ok) {
    throw new Error(
      await parseErrorMessage(response, "Failed to load current user.")
    );
  }

  return response.json();
}