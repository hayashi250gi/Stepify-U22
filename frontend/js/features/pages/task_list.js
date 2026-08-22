// タスク一覧ページ

import { fetchTasks } from "../api.js";
import { AuthState } from "../auth/auth_state.js";
import { AppStorage } from "../storage/app_storage.js?v=20260822-14";
import { navigate } from "../router/router.js";

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

    async function loadTasks() {
    tableBody.innerHTML = "<tr><td colspan=5 style=\"text-align:center;\">読み込み中...</td></tr>";

    try {
        let tasks = [];
        if (AuthState.isLoggedIn()) {
            // ログイン中: DBから取得
            const result = await Promise.race([
                fetchTasks(),
                new Promise((_, reject) => setTimeout(() => reject(new Error("タスク一覧の読み込みがタイムアウトしました。")), 8000))
            ]);
            tasks = result.tasks || [];
        } else {
            // 未ログイン: IndexedDBから取得
            const loadGuestData = () => Promise.race([
                AppStorage.getAllData(),
                new Promise((_, reject) => setTimeout(() => reject(new Error("ローカルデータの読み込みがタイムアウトしました。")), 3000))
            ]);
            let data;
            try {
                data = await loadGuestData();
            } catch (error) {
                AppStorage.close();
                data = await loadGuestData();
            }
            tasks = data.filter(item => item.id !== "user_settings" && item.data?.title).map(item => ({
                task_id: item.id,
                title: item.data.title,
                deadline: item.data.deadline,
                priority: item.data.priority,
                status: item.data.status || 'todo',
                progress: (item.data.subtasks ? (item.data.subtasks.filter(s => s.status === 'done').length / item.data.subtasks.length) * 100 : 0)
            }));
        }

        const priorityOrder = { high: 3, medium: 2, low: 1, 高: 3, 中: 2, 低: 1 };
        let sortKey = "title";
        let sortDirection = 1;
        const sortTasks = () => {
            tasks.sort((left, right) => {
                let leftValue = left[sortKey] ?? "";
                let rightValue = right[sortKey] ?? "";
                if (sortKey === "progress") {
                    leftValue = Number(leftValue);
                    rightValue = Number(rightValue);
                } else if (sortKey === "priority") {
                    leftValue = priorityOrder[leftValue] || 0;
                    rightValue = priorityOrder[rightValue] || 0;
                } else {
                    leftValue = String(leftValue).toLocaleLowerCase("ja");
                    rightValue = String(rightValue).toLocaleLowerCase("ja");
                }
                return (leftValue < rightValue ? -1 : leftValue > rightValue ? 1 : 0) * sortDirection;
            });
        };
        const renderRows = () => {
        sortTasks();
        document.querySelectorAll(".task-sort-btn").forEach((button) => {
            const isActive = button.dataset.sortKey === sortKey;
            button.classList.toggle("is-active", isActive);
            button.dataset.direction = isActive ? (sortDirection === 1 ? "asc" : "desc") : "";
            button.setAttribute("aria-sort", isActive ? (sortDirection === 1 ? "ascending" : "descending") : "none");
        });
        if (!tasks.length) {
            tableBody.innerHTML = "<tr><td colspan=5 style=\"text-align:center;\">登録されたタスクはありません</td></tr>";
        } else {
        tableBody.innerHTML = tasks.map((task) => {
            const progress = task.progress ?? 0;
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
                            <span>${progress}%</span>
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
                    navigate(`/tasks/${taskId}`);
                }
            });
        });

        };
        renderRows();
        document.querySelectorAll(".task-sort-btn").forEach((button) => {
            button.addEventListener("click", () => {
                const nextKey = button.dataset.sortKey;
                if (sortKey === nextKey) sortDirection *= -1;
                else { sortKey = nextKey; sortDirection = 1; }
                renderRows();
            });
        });

    const createButton = document.getElementById("create-task-btn");
    if (createButton) {
        createButton.addEventListener("click", () => {
                navigate("/new");
        });
    }
}
        } catch (error) {
            console.error("タスク一覧の取得に失敗しました", error);
            tableBody.innerHTML = "<tr><td colspan=5 style=\"text-align:center;\">読み込みに失敗しました</td></tr>";
        }
    }

    await loadTasks();
}

