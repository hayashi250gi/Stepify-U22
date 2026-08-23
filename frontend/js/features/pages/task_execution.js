// タスク実行ページ。タイマー操作と完了・キャンセルの遷移を管理する。

import { NotificationManager } from "/js/utils/notification.js";
import { AppStorage } from "/js/features/storage/app_storage.js?v=20260822-17";
import { AuthState } from "/js/features/auth/auth_state.js";
import { updateSubtaskStatus, fetchTask, saveHistory } from "/js/features/api.js";
import { navigate } from "/js/features/router/router.js";
import { Header } from "/js/features/components/header.js";

export async function render() {
    const contentView = document.getElementById("content-viewport");

    if (!document.getElementById("timer-display")) {
        contentView.innerHTML = `
            <div class="view-container task-action-view">
                <div class="card task-action-card">
                    <p class="task-action-caption">タスクを実行中...</p>
                    <h2 class="task-action-title">読み込み中...</h2>
                    <div id="timer-display" class="timer-display">00:00</div>
                    <div class="task-action-buttons">
                        <button id="complete-task-btn" class="btn btn-primary task-action-complete-btn">完了した！</button>
                        <button id="cancel-action-btn" class="btn btn-secondary">中断する</button>
                    </div>
                </div>
            </div>
        `;
    }

    console.log(
        "task action loaded"
    );

    /*
    今後:
    backend timer連携予定
    */

    // 初回ロード時に通知権限をリクエスト
    NotificationManager.requestPermission();

    const params = new URLSearchParams(window.location.search);
    const taskId = params.get("task_id");
    const subtaskId = params.get("subtask_id");
    const title = params.get("title");
    const minutes = parseInt(params.get("minutes")) || 15;
    const startTime = params.get("start_time") || new Date().toISOString();

    const titleEl = document.querySelector(".task-action-title");
    const timerDisplay = document.getElementById("timer-display");

    if (titleEl) titleEl.textContent = title;

    // 経過時間を考慮して残り時間を計算
    const start = new Date(startTime).getTime();
    const now = Date.now();
    const elapsedSeconds = Math.floor((now - start) / 1000);
    let timeRemaining = Math.max(0, minutes * 60 - elapsedSeconds);
    function updateTimerDisplay() {
        const m = Math.floor(timeRemaining / 60);
        const s = timeRemaining % 60;
        timerDisplay.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }

    updateTimerDisplay();

    // 実行状態をストレージに保存
    await AppStorage.saveGuestData("running_task", { taskId, subtaskId, title, minutes, startTime });
    Header.renderRunningTask();
    let timerInterval = setInterval(async () => {
        if (timeRemaining > 0) {
            timeRemaining--;
        updateTimerDisplay();
        } else {
            clearInterval(timerInterval);
            timerDisplay.textContent = "00:00";

            // 通知とサウンドを再生
            NotificationManager.show("タスク時間終了", "お疲れ様でした！時間になりました。");
            NotificationManager.playCompleteSound();
        await AppStorage.clearGuestData("running_task");
        await Header.renderRunningTask();
    }
    }, 1000);

    // 完了/中断時
    async function cleanupTask() {
        await AppStorage.clearGuestData("running_task");
        await Header.renderRunningTask();
    }
    const completeButton = document.getElementById("complete-task-btn");
    const cancelButton = document.getElementById("cancel-action-btn");

    async function completeTask() {
        const params = new URLSearchParams(window.location.search);
        const taskId = params.get("task_id");
        const subtaskId = params.get("subtask_id") ? params.get("subtask_id").toString() : null;

        // デバッグログ追加
        console.log("Completing subtask:", subtaskId, "of task:", taskId);
        try {
            if (!taskId) throw new Error("タスクIDが不明です。");

            let task;
            if (AuthState.isLoggedIn()) {
                await updateSubtaskStatus(taskId, subtaskId, 'done');
                await saveHistory(taskId, subtaskId, 'complete');
                task = await fetchTask(taskId);
            } else {
                task = await AppStorage.loadGuestData(taskId);
                if (task && task.subtasks) {
                    // 旧データなどIDがないサブタスクにも、タスク内で一意なIDを補完する。
                    task.subtasks = task.subtasks.map((subtask, index) => ({
                        ...subtask,
                        subtask_id: subtask.subtask_id || `${taskId}_subtask_${index}`
                    }));
                    const subtask = task.subtasks.find(s => String(s.subtask_id) === subtaskId);
                    if (subtask) {
                        subtask.status = 'done';
                    }
                    if (task.subtasks.every(subtaskItem => subtaskItem.status === 'done')) {
                        task.status = 'done';
                    }
                    await AppStorage.saveGuestData(taskId, task);
                }
                await AppStorage.saveHistory(taskId, subtaskId, 'complete');
            }
            await cleanupTask();

            // 未完了サブタスクの確認
            const remainingSubtasks = task.subtasks.filter(s => s.status !== 'done');
            if (remainingSubtasks.length > 0) {
                navigate(`/suggest?task_id=${taskId}`);
            } else {
                navigate(`/result?status=complete&task_id=${encodeURIComponent(taskId)}&task_title=${encodeURIComponent(task.title)}`);
            }
        } catch (error) {
            console.error("Complete task error:", error);
            alert("完了処理に失敗しました: " + error.message);
        }
    }

    if (completeButton) {
        completeButton.addEventListener("click", () => {
            clearInterval(timerInterval);
            completeTask();
        });
    }

    if (cancelButton) {
        cancelButton.addEventListener("click", async () => {
            const params = new URLSearchParams(window.location.search);
            const taskId = params.get("task_id");
            const subtaskId = params.get("subtask_id");
            if (!AuthState.isLoggedIn()) {
                await AppStorage.saveHistory(taskId, subtaskId, 'interrupt');
            }
            clearInterval(timerInterval);
            await cleanupTask();
            navigate(`/result?status=interrupt&task_id=${taskId}&subtask_id=${subtaskId}`);
        });
    }
}

