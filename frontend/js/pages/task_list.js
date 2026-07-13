import { fetchTasks } from "../api.js";

export async function render() {
    const tableBody = document.querySelector("#task-list-table tbody");

    if (!tableBody) {
        return;
    }

    tableBody.innerHTML = "<tr><td colspan=5 style=\"text-align:center;\">読み込み中...</td></tr>";

    try {
        const result = await fetchTasks();
        const tasks = result.tasks || [];

        if (!tasks.length) {
            tableBody.innerHTML = "<tr><td colspan=5 style=\"text-align:center;\">登録されたタスクはありません</td></tr>";
            return;
        }

        tableBody.innerHTML = tasks.map((task) => {
            const progress = task.progress ?? 0;
            const statusLabel = task.status || "未着手";
            const statusColor = task.status === "完了" ? "#4caf50" : task.status === "進行中" ? "#ff9800" : "var(--text-muted)";

            return `
                <tr class="clickable-row" data-task-id="${task.id}">
                    <td><strong>${task.title}</strong></td>
                    <td>${task.deadline || "-"}</td>
                    <td>${task.priority || "-"}</td>
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
                    window.location.hash = `task-detail?id=${taskId}`;
                    window.navigate?.("task_detail");
                }
            });
        });

        const createButton = document.getElementById("create-task-btn");
        if (createButton) {
            createButton.addEventListener("click", () => {
                window.navigate?.("task_create");
            });
        }
    } catch (error) {
        console.error("タスク一覧の取得に失敗しました", error);
        tableBody.innerHTML = "<tr><td colspan=5 style=\"text-align:center;\">読み込みに失敗しました</td></tr>";
    }
}