// タスク実行完了後の結果表示ページ。次の行動へ遷移する。
import { navigate } from "/js/features/router/router.js";

export async function render() {
    const contentView = document.getElementById("content-viewport");
    const params = new URLSearchParams(window.location.search);
    const status = params.get("status"); // complete or interrupt
    const taskTitle = params.get("task_title") || "タスク";
    const subtaskTitle = params.get("subtask_title");
    const progress = params.get("progress") || 0;
    const done = params.get("done") || 0;
    const total = params.get("total") || 0;

    const isComplete = status === "complete";
    contentView.innerHTML = `
        <div class="view-container task-complete-view">
            <div class="card task-complete-card">
                <div class="task-complete-icon">${isComplete ? "🎉" : "⚠️"}</div>
                <h2 class="task-complete-title">${isComplete ? "お疲れ様です！" : "タスクを中断しました"}</h2>
                <p id="task-complete-summary" class="task-complete-summary">
                    ${isComplete ? `「${taskTitle}」を完了しました！` : `「${taskTitle}」の実行を中断しました。`}
                </p>
                ${isComplete ? `
                    <div class="card task-complete-progress-card">
                        <div class="task-complete-progress-row">
                            <span>親タスクの進捗状況</span>
                            <strong>${total ? `${done} / ${total}` : "完了"}</strong>
                        </div>
                        <div class="progress-container">
                            <div class="progress-bar progress-bar-complete" style="width: ${total ? progress : 100}%;"></div>
                        </div>
                    </div>
                ` : ""}
                <div class="task-complete-actions">
                    <button id="next-step-btn" class="btn btn-primary task-complete-primary-btn">次のタスクを実行する</button>
                    <button id="finish-step-btn" class="btn btn-secondary task-complete-secondary-btn">終了してタスク入力へ戻る</button>
                </div>
            </div>
        </div>
    `;

    document.getElementById("next-step-btn").onclick = () => navigate("/suggest");
    document.getElementById("finish-step-btn").onclick = () => navigate("/new");
}

