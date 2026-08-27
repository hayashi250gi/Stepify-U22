// ===================================================
// ファイル名: task_list.js
// 最終更新日: 2026/08/27
// 作成者: 林健太
// 概要: タスクリストページの表示と操作を制御するモジュール
// ===================================================

// タスク一覧ページ

import { fetchTasks } from "../api.js";
import { AuthState } from "../auth/auth_state.js";
import { AppStorage } from "../storage/app_storage.js?v=20260822-36";

export async function render() {
    const contentView = document.getElementById("content-viewport");
    if (!contentView) return;

        contentView.innerHTML = `
            <div class="view-container">
                <div class="task-list-header">
                    <h2 class="card-title task-list-title">登録中の親タスク一覧</h2>
                    <button id="create-task-btn" class="btn btn-primary task-list-create-btn">＋ 新規登録</button>
                </div>
                <div class="card task-list-card">
                    <table class="data-table" id="task-list-table">
                        <thead>
                            <tr>
                                <th><button class="task-sort-btn" data-sort-key="title">親タスク名</button></th>
                                <th><button class="task-sort-btn" data-sort-key="deadline">締切</button></th>
                                <th><button class="task-sort-btn" data-sort-key="priority">優先度</button></th>
                                <th><button class="task-sort-btn" data-sort-key="progress">進捗率</button></th>
                                <th><button class="task-sort-btn" data-sort-key="status">ステータス</button></th>
                            </tr>
                        </thead>
                        <tbody></tbody>
                    </table>
                </div>
            </div>
        `;
    const tableBody = document.querySelector("#task-list-table tbody");

    if (!tableBody) {
        return;
    }

    const createButton = document.getElementById("create-task-btn");
    if (createButton) {
        createButton.onclick = () => {
            window.location.href = "/new";
        };
    }

    const bindTaskRowEvents = () => {
        tableBody.querySelectorAll(".clickable-row").forEach((row) => {
            row.onclick = () => {
                const taskId = row.dataset.taskId;
                if (taskId) window.location.href = `/tasks/${encodeURIComponent(taskId)}`;
            };
        });
    };
    let loadedTasks = [];
    const sortState = {
        key: "title",
        direction: 1,
        renderRows: null,
    };

    if (!tableBody.dataset.sortBound) {
        tableBody.dataset.sortBound = "true";
        tableBody.closest("table").addEventListener("click", (event) => {
            const button = event.target.closest(".task-sort-btn");
            if (!button || !sortState.renderRows) return;

            const nextKey = button.dataset.sortKey;
            if (sortState.key === nextKey) sortState.direction *= -1;
            else {
                sortState.key = nextKey;
                sortState.direction = 1;
            }
            sortState.renderRows();
        });
    }

    const loadingFallback = setTimeout(() => {
        if (tableBody.textContent.includes("読み込み中")) {
            tableBody.innerHTML = "<tr><td colspan=5 style=\"text-align:center;\">タスクを読み込めませんでした。ページを再読み込みしてください。</td></tr>";
        }
    }, 10000);

    async function loadTasks() {
    tableBody.innerHTML = "<tr><td colspan=5 style=\"text-align:center;\">登録されたタスクはありません</td></tr>";

    try {
        let tasks = [];
        if (AuthState.isLoggedIn()) {
            // ログイン中: DBから取得
            const result = await Promise.race([
                fetchTasks(),
                new Promise((_, reject) => setTimeout(() => reject(new Error("タスク一覧の読み込みがタイムアウトしました。")), 5000))
            ]);
            tasks = Array.isArray(result) ? result : (result?.tasks || []);
        } else {
            // 未ログイン: IndexedDBから取得
            const data = await AppStorage.getAllData();
            tasks = data.filter(item => item.id !== "user_settings" && item.data?.title).map(item => ({
                task_id: item.id,
                title: item.data.title,
                deadline: item.data.deadline,
                priority: item.data.priority,
                status: item.data.status || 'todo',
                progress: (item.data.subtasks ? (item.data.subtasks.filter(s => s.status === 'done').length / item.data.subtasks.length) * 100 : 0)
            }));
        }
        loadedTasks = tasks;


        const priorityOrder = { high: 3, medium: 2, low: 1, 高: 3, 中: 2, 低: 1 };
        const sortTasks = () => {
            tasks.sort((left, right) => {
                let leftValue = left[sortState.key] ?? "";
                let rightValue = right[sortState.key] ?? "";
                if (sortState.key === "progress") {
                    leftValue = Number(leftValue);
                    rightValue = Number(rightValue);
                } else if (sortState.key === "priority") {
                    leftValue = priorityOrder[leftValue] || 0;
                    rightValue = priorityOrder[rightValue] || 0;
                } else {
                    leftValue = String(leftValue).toLocaleLowerCase("ja");
                    rightValue = String(rightValue).toLocaleLowerCase("ja");
                }
                return (leftValue < rightValue ? -1 : leftValue > rightValue ? 1 : 0) * sortState.direction;
            });
        };
        sortState.renderRows = () => {
        sortTasks();
        document.querySelectorAll(".task-sort-btn").forEach((button) => {
            const isActive = button.dataset.sortKey === sortState.key;
            button.classList.toggle("is-active", isActive);
            button.dataset.direction = isActive ? (sortState.direction === 1 ? "asc" : "desc") : "";
            button.setAttribute("aria-sort", isActive ? (sortState.direction === 1 ? "ascending" : "descending") : "none");
        });
        if (!tasks.length) {
            tableBody.innerHTML = "<tr><td colspan=5 style=\"text-align:center;\">登録されたタスクはありません</td></tr>";
        } else {
        tableBody.innerHTML = tasks.map((task) => {
            const progress = Number(task.progress ?? 0);
            const progressLabel = progress.toFixed(1);
            const statusLabel = task.status || "未着手";
            const deadlineLabel = task.deadline ? task.deadline.split('T')[0] : "-";
            const priorityLabel = task.priority || "中";
                    const statusColor = (task.status === "done" || task.status === "完了") ? "#4caf50" : (task.status === "in_progress" || task.status === "進行中") ? "#ff9800" : "var(--text-muted)";

            return `
                <tr class="clickable-row" data-task-id="${task.task_id}">
                    <td><strong>${task.title}</strong></td>
                    <td>${deadlineLabel}</td>
                    <td>${priorityLabel}</td>
                    <td>
                        <div style="display:flex; align-items:center; gap:8px;">
                            <div class="progress-container" style="width: 80px;"><div class="progress-bar" style="width: ${progress}%;"></div></div>
                            <span>${progressLabel}%</span>
                        </div>
                    </td>
                    <td><span style="color:${statusColor};">${statusLabel}</span></td>
                </tr>
            `;
        }).join("");

        tableBody.querySelectorAll(".clickable-row").forEach((row) => {
            row.addEventListener("click", () => {
                const taskId = row.dataset.taskId;
                if (taskId) {
                    window.location.href = `/tasks/${encodeURIComponent(taskId)}`;
                }
            });
        });

        }
        };
        sortState.renderRows();

        } catch (error) {
            console.error("タスク一覧の取得に失敗しました", error);
            tableBody.innerHTML = "<tr><td colspan=5 style=\"text-align:center;\">読み込みに失敗しました</td></tr>";
        }
    }

    await loadTasks();
    clearTimeout(loadingFallback);
    if (loadedTasks.length && !tableBody.querySelector(".clickable-row")) {
        tableBody.innerHTML = loadedTasks.map((task) => `
            <tr class="clickable-row" data-task-id="${task.task_id}">
                <td><strong>${task.title}</strong></td>
                <td>${task.deadline ? task.deadline.split('T')[0] : "-"}</td>
                <td>${task.priority || "中"}</td>
                <td>${Number(task.progress ?? 0).toFixed(1)}%</td>
                <td>${task.status || "未着手"}</td>
            </tr>
        `).join("");
        bindTaskRowEvents();
    }
}

