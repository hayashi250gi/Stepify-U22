// 分解タスク入力ページ。ユーザー入力を受けてAIへ分解依頼を送る。

import { AiApi } from "../api/ai_api.js";
import { appState } from "../state.js";
import { navigate } from "../router/router.js";

export async function render() {
    const contentView = document.getElementById("content-viewport");

    if (!document.getElementById("task-input-form")) {
        contentView.innerHTML = `
            <div class="view-container view-container-center">
                <div class="card task-input-container" id="task-input-form">
                    <h2 class="card-title">タスク分解</h2>
                    <div class="input-group">
                        <label>タスクタイトル</label>
                        <input type="text" id="task-title" class="input-control" placeholder="例: 部屋の掃除をする">
                    </div>
                    <div class="input-group">
                        <label>詳細</label>
                        <textarea id="task-detail" class="input-control" rows="4" placeholder="詳細があれば入力"></textarea>
                    </div>
                    <button id="decompose-btn" class="btn btn-primary" style="width:100%;">分解する</button>
                    <div id="decomp-loading" style="display: none;">AIがタスクを分析中です...</div>
                </div>
            </div>
        `;
    }
    const form = document.getElementById("task-input-form");
    const taskInput = document.getElementById("task-title");
    const taskDetail = document.getElementById("task-detail");
    const submitBtn = document.getElementById("decompose-btn");
    const loadingDiv = document.getElementById("decomp-loading");
    const cancelButton = document.getElementById("cancel-btn");

    if (!form || !taskInput || !taskDetail) {
        return;
    }

    if (cancelButton) {
        cancelButton.addEventListener("click", () => {
            navigate("/new");
        });
    }

    submitBtn.addEventListener("click", async (event) => {
        event.preventDefault();

        const title = taskInput.value.trim();
        const detail = taskDetail.value.trim();

        if (!title) {
            return;
        }

        appState.currentTaskTitle = title;
        appState.currentTaskDetail = detail;

        // 送信ボタンを無効化＋ローディング表示
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = "AIがタスクを分析中です...";
        }
        if (loadingDiv) {
            loadingDiv.style.display = "flex";
        }

        console.log("task_input: submit fired", { title, detail });

        try {
            const result = await AiApi.decomposeTask(title, detail);

            console.log("DEBUG task_input: ai result", result);

            appState.decompositionResult = (result.subtasks || []).map((step, index) => ({
                title: step.title || "",
                description: step.description || "",
                order_no: step.order_no || index + 1,
                estimated_minutes: step.estimated_minutes || null,
                duration: step.estimated_minutes ? `${step.estimated_minutes}分` : "-",
                status: step.status || "todo"
            }));

            console.log(appState.decompositionResult);

            console.log("DEBUG task_input: calling navigate");
            navigate("/pages/task_decompose_result.html");
        } catch (error) {
            console.error("AI分解に失敗しました", error);
            alert(error.message || "分解に失敗しました。");
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = "分解する";
            }
            if (loadingDiv) {
                loadingDiv.style.display = "none";
            }
        }
    });
}