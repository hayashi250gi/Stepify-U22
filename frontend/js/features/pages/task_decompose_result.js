// タスク分解結果ページ

import { createTask } from "../api.js";
import { appState } from "../state.js";

function renderSteps() {
    const container = document.getElementById("steps-list-container");
    const titlePlaceholder = document.getElementById("parent-task-title-placeholder");

    if (!container) {
        return;
    }

    if (titlePlaceholder) {
        titlePlaceholder.textContent = appState.currentTaskTitle || "未設定";
    }

    if (!appState.decompositionResult.length) {
        container.innerHTML = '<div class="card result-breakdown-step-card"><div>分解結果がありません。もう一度お試しください。</div></div>';
        return;
    }

    container.innerHTML = appState.decompositionResult.map((step, index) => {
        const safeTitle = step.title || "";
        const safeDuration = step.duration || "-";
        const safePriority = step.priority || "中";

        return `
            <div class="card result-breakdown-step-card">
                <div class="result-breakdown-step-content">
                    <div class="result-breakdown-step-head">
                        <strong>${index + 1}. <span class="editable-step-title">${safeTitle}</span></strong>
                        <span class="result-breakdown-step-time">(目安: ${safeDuration})</span>
                    </div>
                    <div class="result-breakdown-step-meta">
                        <label>
                            優先度
                            <select class="editable-step-priority" data-index="${index}">
                                <option value="高" ${safePriority === "高" ? "selected" : ""}>高</option>
                                <option value="中" ${safePriority === "中" ? "selected" : ""}>中</option>
                                <option value="低" ${safePriority === "低" ? "selected" : ""}>低</option>
                            </select>
                        </label>
                        <label>
                            所要時間
                            <input type="text" class="editable-step-duration" data-index="${index}" value="${safeDuration}">
                        </label>
                    </div>
                </div>
                <button class="btn btn-secondary result-breakdown-step-btn" type="button" data-edit-index="${index}">編集</button>
            </div>
        `;
    }).join("");

    container.querySelectorAll(".result-breakdown-step-btn").forEach((button) => {
        button.addEventListener("click", () => {
            const index = Number(button.dataset.editIndex);
            const currentStep = appState.decompositionResult[index];
            const nextTitle = window.prompt("ステップ名を編集してください", currentStep?.title || "");
            if (nextTitle === null) {
                return;
            }

            if (currentStep) {
                currentStep.title = nextTitle.trim() || currentStep.title;
                renderSteps();
            }
        });
    });

    container.querySelectorAll(".editable-step-duration").forEach((input) => {
        input.addEventListener("change", (event) => {
            const index = Number(event.target.dataset.index);
            if (appState.decompositionResult[index]) {
                appState.decompositionResult[index].duration = event.target.value;
            }
        });
    });

    container.querySelectorAll(".editable-step-priority").forEach((select) => {
        select.addEventListener("change", (event) => {
            const index = Number(event.target.dataset.index);
            if (appState.decompositionResult[index]) {
                appState.decompositionResult[index].priority = event.target.value;
            }
        });
    });
}

export function render() {
    renderSteps();

    const retryButton = document.getElementById("retry-breakdown-btn");
    const confirmButton = document.getElementById("to-proposal-btn");

    if (retryButton) {
        retryButton.addEventListener("click", () => {
            window.navigate?.("mainmenu");
        });
    }

    if (confirmButton) {
        confirmButton.addEventListener("click", async () => {
            const confirmButtonElement = document.getElementById("to-proposal-btn");
            if (confirmButtonElement) {
                confirmButtonElement.disabled = true;
                confirmButtonElement.textContent = "保存中...";
            }

            try {
                const result = await createTask(appState.currentTaskTitle, appState.decompositionResult);
                if (result.success) {
                    alert("タスクを保存しました");
                    window.navigate?.("task_list");
                } else {
                    alert(result.message || "保存に失敗しました");
                }
            } catch (error) {
                console.error("保存に失敗しました", error);
                alert("保存に失敗しました");
            } finally {
                if (confirmButtonElement) {
                    confirmButtonElement.disabled = false;
                    confirmButtonElement.textContent = "この内容で確定して進む";
                }
            }
        });
    }
}