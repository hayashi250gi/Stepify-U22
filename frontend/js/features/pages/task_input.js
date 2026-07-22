// 分解タスク入力ページ。ユーザー入力を受けてAIへ分解依頼を送る。

import { AiApi } from "../api/ai_api.js";
import { appState } from "../state.js";

export function render() {
    const form = document.getElementById("decomp-form");
    const taskInput = document.getElementById("task-input");
    const taskDetail = document.getElementById("task-detail-input");
    const submitBtn = document.getElementById("decomp-submit-btn");
    const loadingDiv = document.getElementById("decomp-loading");

    if (!form || !taskInput || !taskDetail) {
        return;
    }

    // 以前のリスナーを削除するために、フォームをクローンして置き換える（イベントリスナーを全解除）
    const newForm = form.cloneNode(false);
    form.parentNode.replaceChild(newForm, form);

    // submitボタンもクローン後に取得し直す
    const newSubmitBtn = document.getElementById("decomp-submit-btn");
    const newTaskInput = document.getElementById("task-input");
    const newTaskDetail = document.getElementById("task-detail-input");
    const newLoadingDiv = document.getElementById("decomp-loading");

    if (!newTaskInput || !newTaskDetail) {
        return;
    }

    newForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const title = newTaskInput.value.trim();
        const detail = newTaskDetail.value.trim();

        if (!title) {
            return;
        }

        appState.currentTaskTitle = title;
        appState.currentTaskDetail = detail;

        // 送信ボタンを無効化＋ローディング表示
        if (newSubmitBtn) {
            newSubmitBtn.disabled = true;
            newSubmitBtn.style.display = "none";
        }
        if (newLoadingDiv) {
            newLoadingDiv.style.display = "flex";
        }

        console.log("task_input: submit fired", { title, detail });

        try {
            const result = await AiApi.decomposeTask(title, detail);

            console.log("task_input: ai result", result);

            appState.decompositionResult = (result.subtasks || []).map((step, index) => ({
                title: step.title || "",
                description: step.description || "",
                order_no: step.order_no || index + 1,
                estimated_minutes: step.estimated_minutes || null,
                duration: step.estimated_minutes ? `${step.estimated_minutes}分` : "-",
                status: step.status || "todo"
            }));

            console.log("task_input: calling navigate");
            window.location.href = "/task_decompose_result.html";
        } catch (error) {
            console.error("AI分解に失敗しました", error);
            alert(error.message || "分解に失敗しました。");
        } finally {
            if (newSubmitBtn) {
                newSubmitBtn.disabled = false;
                newSubmitBtn.style.display = "";
            }
            if (newLoadingDiv) {
                newLoadingDiv.style.display = "none";
            }
        }
    });
}