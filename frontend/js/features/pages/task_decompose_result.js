// タスク分解結果ページ

import { createTask } from "../api.js";
import { appState } from "../state.js";

function renderSteps() {
    const container = document.getElementById("steps-list-container");
    const titleInput = document.getElementById("parent-task-title-input");
    const detailInput = document.getElementById("parent-task-detail-input");

    if (!container) {
        return;
    }

    if (titleInput) {
        titleInput.value = appState.currentTaskTitle || "";
    }

    if (detailInput) {
        detailInput.value = appState.currentTaskDetail || "";
    }

    if (!appState.decompositionResult.length) {
        container.innerHTML = '<div class="card result-breakdown-step-card"><div>分解結果がありません。もう一度お試しください。</div></div>';
        return;
    }

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
                    </div>
                    <div class="result-breakdown-step-meta">
                        <label>
                            予定所要時間
                            <input type="number" class="editable-step-minutes" data-index="${index}"
                                value="${safeMinutes}" min="1" placeholder="分" style="width:80px;" />
                            分
                        </label>
                    </div>
                    <div class="editable-step-desc-area">
                        <textarea class="editable-step-desc" data-index="${index}" placeholder="ステップの説明（任意）">${step.description || ""}</textarea>
                    </div>
                </div>
            </div>
        `;
    }).join("");

    // Inline title editing
    container.querySelectorAll(".editable-step-title").forEach((el) => {
        el.addEventListener("input", (e) => {
            const index = Number(e.target.dataset.index);
            if (appState.decompositionResult[index]) {
                appState.decompositionResult[index].title = e.target.textContent.trim();
            }
        });
        // prevent newline on Enter
        el.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                e.target.blur();
            }
        });
    });

    // Description editing
    container.querySelectorAll(".editable-step-desc").forEach((ta) => {
        ta.addEventListener("input", (e) => {
            const index = Number(e.target.dataset.index);
            if (appState.decompositionResult[index]) {
                appState.decompositionResult[index].description = e.target.value;
            }
        });
    });

    // Estimated minutes editing
    container.querySelectorAll(".editable-step-minutes").forEach((input) => {
        input.addEventListener("change", (event) => {
            const index = Number(event.target.dataset.index);
            const val = event.target.value;
            if (appState.decompositionResult[index]) {
                const minutes = val !== "" ? parseInt(val, 10) : null;
                appState.decompositionResult[index].estimated_minutes = minutes;
                appState.decompositionResult[index].duration = minutes ? `${minutes}分` : "-";
            }
        });
    });

    // Drag & drop reorder
    let dragSrcIndex = null;

    container.querySelectorAll('.result-breakdown-step-card').forEach((card) => {
        card.addEventListener('dragstart', (e) => {
            dragSrcIndex = Number(card.dataset.index);
            card.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
            try { e.dataTransfer.setData('text/plain', String(dragSrcIndex)); } catch (err) {}
        });

        card.addEventListener('dragend', () => {
            card.classList.remove('dragging');
            dragSrcIndex = null;
        });

        card.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            card.classList.add('drag-over');
        });

        card.addEventListener('dragleave', () => {
            card.classList.remove('drag-over');
        });

        card.addEventListener('drop', (e) => {
            e.preventDefault();
            card.classList.remove('drag-over');
            const targetIndex = Number(card.dataset.index);
            const sourceIndex = dragSrcIndex !== null ? dragSrcIndex : Number(e.dataTransfer.getData('text/plain'));
            if (isNaN(sourceIndex) || isNaN(targetIndex) || sourceIndex === targetIndex) return;

            const item = appState.decompositionResult.splice(sourceIndex, 1)[0];
            appState.decompositionResult.splice(targetIndex, 0, item);
            renderSteps();
        });
    });
}

export function render() {
    renderSteps();

    const retryButton = document.getElementById("retry-breakdown-btn");
    const confirmButton = document.getElementById("to-proposal-btn");

    if (retryButton) {
        // 古いリスナーを削除するため、新しいボタンに置き換え
        const newRetryBtn = retryButton.cloneNode(true);
        retryButton.parentNode.replaceChild(newRetryBtn, retryButton);
        newRetryBtn.addEventListener("click", () => {
            window.navigate?.("mainmenu");
        });
    }

    if (confirmButton) {
        // 古いリスナーを削除するため、新しいボタンに置き換え
        const newConfirmBtn = confirmButton.cloneNode(true);
        confirmButton.parentNode.replaceChild(newConfirmBtn, confirmButton);
        newConfirmBtn.addEventListener("click", async () => {
            // 保存前バリデーション: 空のサブタスクタイトルがないかチェック
            const emptyTitles = appState.decompositionResult.filter(
                (s) => !s.title || s.title.trim() === ""
            );
            if (emptyTitles.length > 0) {
                alert("全てのサブタスクにタイトルを入力してください。");
                return;
            }

            newConfirmBtn.disabled = true;
            newConfirmBtn.textContent = "保存中...";

            try {
                const payloadSubtasks = appState.decompositionResult.map((s, i) => ({
                    title: s.title || "",
                    description: s.description || null,
                    order_no: i + 1,
                    estimated_minutes: s.estimated_minutes || null,
                    status: s.status || "todo"
                }));

                const result = await createTask(
                    appState.currentTaskTitle,
                    appState.currentTaskDetail,
                    payloadSubtasks
                );

                alert(result.message || "タスクを保存しました");
                appState.reset();
                window.navigate?.("task_list");
            } catch (error) {
                console.error("保存に失敗しました", error);
                alert(error.message || "保存に失敗しました");
            } finally {
                newConfirmBtn.disabled = false;
                newConfirmBtn.textContent = "この内容で確定して進む";
            }
        });
    }
}