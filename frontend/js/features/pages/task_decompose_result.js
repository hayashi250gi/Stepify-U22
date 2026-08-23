// タスク分解結果ページ

import { createTask } from "../api.js";
import { appState } from "../state.js";
import { AppStorage } from "../storage/app_storage.js?v=20260822-17";
import { AuthState } from "../auth/auth_state.js";
import { navigate } from "../router/router.js";

function attachEvents() {
    const container = document.getElementById("steps-list-container");
    if (!container || container.dataset.eventsBound) return;

    container.dataset.eventsBound = "true";
    // イベント委任で親要素にて一括管理
    container.onclick = (e) => {
        const removeButton = e.target.closest(".remove-step-btn");
        if (removeButton) {
            const index = Number(removeButton.dataset.index);
            const steps = appState.decompositionResult;
            if (!Number.isInteger(index) || !steps[index]) return;
            steps.splice(index, 1);
            appState.decompositionResult = steps;
            renderSteps();
        }
    };

    container.oninput = (e) => {
        const index = Number(e.target.dataset.index);
        if (isNaN(index)) return;
        const steps = appState.decompositionResult;
        if (!steps[index]) return;
        if (e.target.classList.contains("editable-step-title")) {
            steps[index].title = e.target.textContent.trim();
        } else if (e.target.classList.contains("editable-step-desc")) {
            steps[index].description = e.target.value;
        }
        appState.decompositionResult = steps;
    };

    container.onchange = (e) => {
        if (e.target.classList.contains("editable-step-minutes")) {
            const index = Number(e.target.dataset.index);
            const val = e.target.value;
            const steps = appState.decompositionResult;
            if (!steps[index]) return;
            steps[index].estimated_minutes = val !== "" ? parseInt(val, 10) : null;
            appState.decompositionResult = steps;
            }
    };
}

function renderSteps() {
    const container = document.getElementById("steps-list-container");
    const titleInput = document.getElementById("parent-task-title-input");
    const detailInput = document.getElementById("parent-task-detail-input");

    if (!container) return;
    if (titleInput) titleInput.value = appState.currentTaskTitle || "";
    if (detailInput) detailInput.value = appState.currentTaskDetail || "";

    // 描画前に一度クリアする
    container.innerHTML = "";

    if (!appState.decompositionResult || appState.decompositionResult.length === 0) {
        container.innerHTML = '<div class="card result-breakdown-step-card"><div>分解結果がありません。</div></div>';
                } else {
        container.innerHTML = appState.decompositionResult.map((step, index) => {
            const safeTitle = step.title || "";
            const safeMinutes = step.estimated_minutes != null ? step.estimated_minutes : "";
            return `
                <div class="card result-breakdown-step-card" draggable="true" data-index="${index}">
                    <div class="drag-handle" title="ドラッグで並べ替え">☰</div>
                    <div class="result-breakdown-step-content">
                        <div class="result-breakdown-step-head">
                            <strong>${index + 1}.</strong>
                            <span class="editable-step-title" contenteditable="true" data-index="${index}">${safeTitle}</span>
                            <button class="remove-step-btn" data-index="${index}" style="margin-left:10px;">×</button>
                        </div>
                        <div class="result-breakdown-step-meta">
                            <label>
                                予定所要時間
                                <input type="number" class="editable-step-minutes" data-index="${index}"
                                    value="${safeMinutes}" min="1" placeholder="分" style="width:80px;" /> 分
                            </label>
                        </div>
                        <div class="editable-step-desc-area">
                            <textarea class="editable-step-desc" data-index="${index}" placeholder="ステップの説明（任意）">${step.description || ""}</textarea>
                        </div>
                    </div>
                </div>
            `;
        }).join("");
    }

    attachEvents();

    // Drag & drop reorder
    let dragSrcIndex = null;
    container.querySelectorAll('.result-breakdown-step-card').forEach((card) => {
        card.addEventListener('dragstart', (e) => {
            dragSrcIndex = Number(card.dataset.index);
            card.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
        });
        card.addEventListener('dragend', () => { card.classList.remove('dragging'); dragSrcIndex = null; });
        card.addEventListener('dragover', (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; card.classList.add('drag-over'); });
        card.addEventListener('dragleave', () => { card.classList.remove('drag-over'); });
        card.addEventListener('drop', (e) => {
            e.preventDefault();
            card.classList.remove('drag-over');
            const targetIndex = Number(card.dataset.index);
            const sourceIndex = dragSrcIndex !== null ? dragSrcIndex : Number(e.dataTransfer.getData('text/plain'));
            if (sourceIndex === targetIndex) return;
            const steps = appState.decompositionResult;
            const item = steps.splice(sourceIndex, 1)[0];
            steps.splice(targetIndex, 0, item);
            appState.decompositionResult = steps;
            renderSteps();
        });
    });
}

export function render() {
    const addButton = document.getElementById("add-step-btn");
    if (addButton) addButton.onclick = () => {
            const steps = appState.decompositionResult;
            steps.push({ title: "新しいステップ", estimated_minutes: 15, status: "todo" });
            appState.decompositionResult = steps;
            renderSteps();
    };

    const retryButton = document.getElementById("retry-breakdown-btn");
    if (retryButton) retryButton.onclick = () => navigate("/new");
    const confirmButton = document.getElementById("to-proposal-btn");
    if (!confirmButton) return;
    confirmButton.onclick = async () => {
        // ... (以下既存の保存処理)
        const titleInput = document.getElementById("parent-task-title-input");
        const detailInput = document.getElementById("parent-task-detail-input");
            if (titleInput) appState.currentTaskTitle = titleInput.value;
            if (detailInput) appState.currentTaskDetail = detailInput.value;

        const priorityInput = document.getElementById("parent-task-priority-input");
        const deadlineInput = document.getElementById("parent-task-deadline-input");
            const taskPriority = priorityInput ? priorityInput.value : 'medium';
            const taskDeadline = deadlineInput ? deadlineInput.value || null : null;
            const emptyTitles = appState.decompositionResult.filter(
                (s) => !s.title || s.title.trim() === ""
            );
            if (emptyTitles.length > 0) {
                alert("全てのサブタスクにタイトルを入力してください。");
                return;
            }

            confirmButton.disabled = true;
            confirmButton.textContent = "保存中...";
            try {
                const guestTaskId = `task_${Date.now()}`;
                const payloadSubtasks = appState.decompositionResult.map((s, i) => ({
                    title: s.title || "",
                    description: s.description || null,
                    order_no: i + 1,
                    estimated_minutes: s.estimated_minutes || null
                }));

                const taskData = {
                    title: appState.currentTaskTitle,
                    description: appState.currentTaskDetail,
                    subtasks: payloadSubtasks.map((subtask, index) => ({
                        ...subtask,
                        subtask_id: `${guestTaskId}_subtask_${index}`
                    })),
                    priority: taskPriority,
                    deadline: taskDeadline,
                    status: 'todo'
                };

                if (AuthState.isLoggedIn()) {
                await createTask(taskData.title, taskData.description, taskData.subtasks, taskData.priority, taskData.deadline);
                } else {
                    await AppStorage.saveGuestData(guestTaskId, taskData);
                }
                alert("タスクを保存しました");
                appState.reset();
                navigate("/tasks");
            } catch (error) {
                console.error("保存に失敗しました", error);
            alert("保存に失敗しました。");
            } finally {
                confirmButton.disabled = false;
                confirmButton.textContent = "この内容で確定して進む";
            }
    };

    try {
        renderSteps();
    } catch (e) {
        console.error("レンダリングエラー:", e);
    }
}

