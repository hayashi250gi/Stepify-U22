export function render() {
    const titlePlaceholder = document.getElementById("detail-task-title-placeholder");
    const detailList = document.getElementById("detail-task-list");
    const backButton = document.getElementById("back-to-task-list-btn");
    const supportButton = document.getElementById("start-task-support-btn");
    const deleteButton = document.getElementById("delete-task-btn");

    if (!titlePlaceholder || !detailList) {
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const taskId = params.get("id") || "sample-task";

    titlePlaceholder.textContent = `タスク詳細 #${taskId}`;

    detailList.innerHTML = `
        <div class="task-detail-item task-detail-item-complete">
            <span>✓ まずはタスクの目的を確認する</span>
            <span class="task-detail-item-status task-detail-item-status-complete">完了</span>
        </div>
        <div class="task-detail-item">
            <span>□ 分解対象を整理する</span>
            <span class="task-detail-item-status">未完了</span>
        </div>
    `;

    if (backButton) {
        backButton.addEventListener("click", () => {
            window.navigate?.("task_list");
        });
    }

    if (supportButton) {
        supportButton.addEventListener("click", () => {
            window.navigate?.("task_suggestion");
        });
    }

    if (deleteButton) {
        deleteButton.addEventListener("click", () => {
            if (confirm("本当にこのタスクを削除しますか？")) {
                window.navigate?.("task_list");
            }
        });
    }
}