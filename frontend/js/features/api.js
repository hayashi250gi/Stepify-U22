// ===================================================
// ファイル名: api.js
// 最終更新日: 2026/08/27
// 作成者: 林健太
// 概要: API機能へのアクセスをまとめて提供するモジュール
// ===================================================

import { ApiClient } from "./api/api_client.js";

export async function fetchTasks() {
    return ApiClient.get("/api/tasks");
}

export async function fetchTask(taskId) {
    return ApiClient.get(`/api/tasks/${taskId}`);
}

export async function createTask(title, description, subtasks, priority, deadline) {
    return ApiClient.post("/api/tasks", {
        title,
        description,
        subtasks,
        priority,
        deadline: deadline || null // 締切がない場合はnullを明示
    });
}

export async function importTasks(tasks) {
    return ApiClient.post("/api/tasks/import", { tasks });
}

export async function deleteTask(taskId) {
    return ApiClient.delete(`/api/tasks/${taskId}`);
}

export async function updateTask(taskId, taskData) {
    return ApiClient.put(`/api/tasks/${taskId}`, taskData);
}

export async function suggestTask(taskId = null) {
    const query = taskId ? `?task_id=${encodeURIComponent(taskId)}` : "";
    return ApiClient.get(`/api/tasks/suggest${query}`);
}

export async function fetchSettings(userId) {
    return ApiClient.get(`/api/users/${userId}/settings`);
}

export async function updateSettings(userId, settings) {
    return ApiClient.put(`/api/users/${userId}/settings`, settings);
}

export async function updateSubtaskStatus(taskId, subtaskId, status) {
    return ApiClient.put(`/api/tasks/${taskId}/subtasks/${subtaskId}`, { status });
}

export async function saveHistory(taskId, subtaskId, action) {
    return ApiClient.post(`/api/tasks/${taskId}/history`, { subtaskId, action });
}

export async function fetchRecentHistory() {
    return ApiClient.get("/api/tasks/history/recent");
}

