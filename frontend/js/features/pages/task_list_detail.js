// タスク詳細ページ

import { fetchTask, deleteTask, updateTask } from "/js/features/api.js";
import { AuthState } from "/js/features/auth/auth_state.js";
import { AppStorage } from "/js/features/storage/app_storage.js";
import { handleRoute, navigate } from "/js/features/router/router.js";

export async function render(taskIdFromRouter = null) {
    const contentView = document.getElementById("content-viewport");

        contentView.innerHTML = `
            <div class="view-container">
                <div class="task-detail-back-row">
                    <button id="back-to-task-list-btn" class="btn btn-secondary task-detail-back-btn">← 一覧に戻る</button>
                </div>
                <div class="card">
                    <h2 class="card-title" id="detail-task-title-placeholder">タスク詳細</h2>
                    <p class="task-detail-description">このタスクに含まれる分解ステップ（子タスク）の状態です。</p>
                    <div id="detail-task-list" class="task-detail-list"></div>
                    <div class="task-detail-actions"></div>
                </div>
            </div>
        `;

    const titlePlaceholder = document.getElementById("detail-task-title-placeholder");
    const detailList = document.getElementById("detail-task-list");
    const backButton = document.getElementById("back-to-task-list-btn");
    if (!titlePlaceholder || !detailList) {
        return;
    }

    // taskIdの決定
    let taskId = taskIdFromRouter;
    if (!taskId) {
        const params = new URLSearchParams(window.location.search);
        taskId = params.get("id");
    }

    let currentTask = null;

    if (!taskId) {
        titlePlaceholder.textContent = "タスク詳細が見つかりません";
        detailList.innerHTML = "<p>タスクIDが指定されていません。</p>";
        return;
    }

    async function loadTask() {
    titlePlaceholder.textContent = `タスク詳細 #${taskId}`;
    detailList.innerHTML = "<p>読み込み中...</p>";
    try {
        if (AuthState.isLoggedIn()) {
            const apiId = taskId.startsWith("task_") ? taskId.replace("task_", "") : taskId;
                currentTask = await fetchTask(apiId);
        } else {
                // ゲストモードはtaskIdそのまま検索
                currentTask = await AppStorage.loadGuestData(taskId);
                if (!currentTask) throw new Error("タスクが見つかりません");
        }
            renderView();
            } catch (error) {
            detailList.innerHTML = `<p>タスクの読み込みに失敗しました: ${error.message}</p>`;
            console.error(error);
            }
    }

    function renderView(isEditing = false) {
        titlePlaceholder.textContent = currentTask.title || `タスク詳細 #${taskId}`;

        const detailActions = document.querySelector(".task-detail-actions");

        if (isEditing) {
            detailList.innerHTML = `
                <div class="task-edit-form" style="margin-bottom: 20px;">
                    <div style="margin-bottom: 10px;">
                        <label>タイトル:</label>
                        <input type="text" id="edit-task-title" value="${currentTask.title}" style="width: 100%;">
                    </div>
                    <div style="margin-bottom: 10px;">
                        <label>説明:</label>
                        <textarea id="edit-task-desc" style="width: 100%; height: 80px;">${currentTask.description || ""}</textarea>
                    </div>
                    <div style="display: flex; gap: 10px; margin-bottom: 10px;">
                        <div>
                            <label>締切:</label>
                            <input type="date" id="edit-task-deadline" value="${currentTask.deadline ? currentTask.deadline.split('T')[0] : ""}">
                        </div>
                        <div>
                            <label>優先度:</label>
                            <select id="edit-task-priority">
                                <option value="low" ${currentTask.priority === 'low' ? 'selected' : ''}>低</option>
                                <option value="medium" ${currentTask.priority === 'medium' ? 'selected' : ''}>中</option>
                                <option value="high" ${currentTask.priority === 'high' ? 'selected' : ''}>高</option>
                            </select>
                        </div>
                    </div>
                    <h3>サブタスク</h3>
                    <div id="subtasks-edit-list">
                        ${currentTask.subtasks.map((st, index) => `
                            <div class="subtask-edit-row" data-index="${index}" style="display: flex; gap: 5px; margin-bottom: 5px;">
                                <input type="text" class="subtask-title" value="${st.title}" style="flex-grow: 1;">
                                <input type="number" class="subtask-minutes" value="${st.estimated_minutes || 0}" style="width: 60px;">分
                                <button class="move-up-btn">↑</button>
                                <button class="move-down-btn">↓</button>
                                <button class="remove-subtask-btn">×</button>
                            </div>
                        `).join("")}
                    </div>
                    <button id="add-subtask-btn" class="btn btn-secondary" style="margin-top:10px;">＋ サブタスクを追加</button>
                </div>
            `;
            detailActions.innerHTML = `
                <button id="save-task-btn" class="btn btn-primary">保存</button>
                <button id="cancel-edit-btn" class="btn btn-secondary">キャンセル</button>
            `;

            // 順番変更のイベント
            document.querySelectorAll(".move-up-btn").forEach(btn => btn.addEventListener("click", (e) => moveSubtask(e, -1)));
            document.querySelectorAll(".move-down-btn").forEach(btn => btn.addEventListener("click", (e) => moveSubtask(e, 1)));
            document.querySelectorAll(".remove-subtask-btn").forEach(btn => btn.addEventListener("click", removeSubtask));
            document.getElementById("add-subtask-btn").addEventListener("click", addSubtask);

            document.getElementById("save-task-btn").addEventListener("click", saveTask);
            document.getElementById("cancel-edit-btn").addEventListener("click", () => renderView(false));
        } else {
            const total = currentTask.subtasks ? currentTask.subtasks.length : 0;
            const done = currentTask.subtasks ? currentTask.subtasks.filter(s => s.status === 'done').length : 0;
            const progress = total > 0 ? Math.round((done / total) * 100) : 0;

            const detailHtml = `
                <div class="task-metadata">
                    <div class="task-metadata-full">
                        <strong>進捗: ${progress}% (${done} / ${total})</strong>
                        <div class="progress-container" style="margin-top: 8px;"><div class="progress-bar" style="width: ${progress}%;"></div></div>
                    </div>
                    <p><strong>説明:</strong> ${currentTask.description || "設定なし"}</p>
                    <p><strong>締切:</strong> ${currentTask.deadline ? currentTask.deadline.split('T')[0] : "設定なし"}</p>
                    <p><strong>優先度:</strong> ${currentTask.priority === 'high' ? '高' : currentTask.priority === 'low' ? '低' : '中'}</p>
                </div>
                <div class="subtasks-list">
                    ${(!Array.isArray(currentTask.subtasks) || !currentTask.subtasks.length)
                        ? '<div class="task-detail-item"><span>このタスクにはサブタスクが登録されていません。</span></div>'
                        : currentTask.subtasks.map((subtask) => `
                            <div class="task-detail-item ${subtask.status === 'done' ? 'task-detail-item-complete' : ''}">
                                <span>${subtask.status === 'done' ? '✓ ' : '□ '}</span>
                                <strong>${subtask.title}</strong>
                                <span class="subtask-minutes-badge">${subtask.estimated_minutes || 0}分</span>
                                <span class="task-detail-item-status ${subtask.status === 'done' ? 'task-detail-item-status-complete' : ''}">${subtask.status === 'done' ? '完了' : '未完了'}</span>
                            </div>
                        `).join("")
    }
                </div>
            `;
            detailList.innerHTML = detailHtml;
            detailActions.innerHTML = `
                <button id="edit-task-btn" class="btn btn-secondary">編集</button>
                <button id="start-task-support-btn" class="btn btn-primary">このタスクを実行</button>
                <button id="delete-task-btn" class="btn btn-secondary task-detail-delete-btn">タスクを削除</button>
            `;
            document.getElementById("edit-task-btn").addEventListener("click", () => renderView(true));

            // 詳細画面の「実行支援」ボタン
            document.getElementById("start-task-support-btn").addEventListener("click", () => {
                navigate(`/suggest?task_id=${taskId}`);
            });
            document.getElementById("delete-task-btn").addEventListener("click", deleteHandler);
    }
    }

    function moveSubtask(e, direction) {
        const row = e.target.closest(".subtask-edit-row");
        const index = parseInt(row.dataset.index);
        const newIndex = index + direction;
        if (newIndex >= 0 && newIndex < currentTask.subtasks.length) {
            [currentTask.subtasks[index], currentTask.subtasks[newIndex]] = [currentTask.subtasks[newIndex], currentTask.subtasks[index]];
            renderView(true);
    }
}
    function addSubtask() {
        currentTask.subtasks.push({ title: "新しいサブタスク", estimated_minutes: 15, status: "todo" });
        renderView(true);
    }

    function removeSubtask(e) {
        const row = e.target.closest(".subtask-edit-row");
        const index = parseInt(row.dataset.index);
        currentTask.subtasks.splice(index, 1);
        renderView(true);
    }

    async function saveTask() {
        const updatedTask = {
            title: document.getElementById("edit-task-title").value,
            description: document.getElementById("edit-task-desc").value,
            deadline: document.getElementById("edit-task-deadline").value || null,
            priority: document.getElementById("edit-task-priority").value,
            subtasks: Array.from(document.querySelectorAll(".subtask-edit-row")).map((row) => ({
                ...currentTask.subtasks[parseInt(row.dataset.index)],
                title: row.querySelector(".subtask-title").value,
                estimated_minutes: parseInt(row.querySelector(".subtask-minutes").value) || 0
            }))
        };
        try {
            if (AuthState.isLoggedIn()) {
                await updateTask(taskId, updatedTask);
            } else {
                await AppStorage.saveGuestData(taskId, { ...currentTask, ...updatedTask });
            }
            currentTask = { ...currentTask, ...updatedTask };
            renderView(false);
            } catch (error) {
            alert("保存に失敗しました: " + error.message);
            }
    }

    async function deleteHandler() {
        if (!confirm("本当にこのタスクを削除しますか？")) return;
        try {
            if (AuthState.isLoggedIn()) {
            await deleteTask(taskId);
            } else {
                await AppStorage.clearGuestData(taskId);
            }
            window.history.pushState(null, '', '/tasks');
            handleRoute();
        } catch (error) {
            alert(error.message || "タスクの削除に失敗しました。");
        }
    }

    // ルーターからtaskIdを正しく取得して読み込み
    await loadTask();

    if (backButton) {
        backButton.addEventListener("click", () => navigate("/tasks"));
    }
}

