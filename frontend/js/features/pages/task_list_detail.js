// タスク詳細ページ

import { fetchTask, deleteTask } from "../api.js";
import { Router } from "../router/router.js";

export async function render() {
    const titlePlaceholder = document.getElementById("detail-task-title-placeholder");
    const detailList = document.getElementById("detail-task-list");
    const backButton = document.getElementById("back-to-task-list-btn");
    const supportButton = document.getElementById("start-task-support-btn");
    const deleteButton = document.getElementById("delete-task-btn");

    if (!titlePlaceholder || !detailList) {
        return;
    }

    // Router 経由でクエリパラメータを取得
    const params = Router.getQueryParams();
    const taskId = params.get("id");

    if (!taskId) {
        titlePlaceholder.textContent = "タスク詳細が見つかりません";
        detailList.innerHTML = "<p>タスクIDが指定されていません。</p>";
        return;
    }

    titlePlaceholder.textContent = `タスク詳細 #${taskId}`;
    detailList.innerHTML = "<p>読み込み中...</p>";

    try {
        const task = await fetchTask(taskId);

        titlePlaceholder.textContent = task.title || `タスク詳細 #${taskId}`;

        if (!Array.isArray(task.subtasks) || !task.subtasks.length) {
            detailList.innerHTML = "<div class=\"task-detail-item\"><span>このタスクにはサブタスクが登録されていません。</span></div>";
        } else {
            detailList.innerHTML = task.subtasks.map((subtask) => `
                <div class="task-detail-item ${subtask.status === 'done' ? 'task-detail-item-complete' : ''}">
                    <span>${subtask.status === 'done' ? '✓ ' : '□ '}${subtask.title}</span>
                    <span class="task-detail-item-status ${subtask.status === 'done' ? 'task-detail-item-status-complete' : ''}">${subtask.status === 'done' ? '完了' : '未完了'}</span>
                </div>
            `).join("");
        }
    } catch (error) {
        detailList.innerHTML = `<p>タスクの読み込みに失敗しました: ${error.message}</p>`;
        console.error(error);
    }

    if (backButton) {
        backButton.addEventListener("click", () => {
            Router.navigate("task_list");
        });
    }

    if (supportButton) {
        supportButton.addEventListener("click", () => {
            Router.navigate("task_suggestion");
        });
    }

    if (deleteButton) {
        deleteButton.addEventListener("click", async () => {
            if (!confirm("本当にこのタスクを削除しますか？")) {
                return;
            }

            try {
                await deleteTask(taskId);
                Router.navigate("task_list");
            } catch (error) {
                alert(error.message || "タスクの削除に失敗しました。");
            }
        });
    }
}