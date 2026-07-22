import { ApiClient } from "./api/api_client.js";

export async function fetchTasks() {
    return ApiClient.get("/api/tasks");
}

export async function fetchTask(taskId) {
    return ApiClient.get(`/api/tasks/${taskId}`);
}

export async function createTask(title, description, subtasks) {
    return ApiClient.post("/api/tasks", { title, description, subtasks });
}

export async function deleteTask(taskId) {
    return ApiClient.delete(`/api/tasks/${taskId}`);
}