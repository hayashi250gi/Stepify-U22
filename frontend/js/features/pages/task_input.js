// 分解タスク入力ページ（メインページ）

import { decomposeTask } from "../api.js";
import { decompositionResult } from "../state.js";

export function render() {
    const form = document.getElementById("decomp-form");
    const taskInput = document.getElementById("task-input");

    if (!form || !taskInput) {
        return;
    }

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const title = taskInput.value.trim();
        if (!title) {
            return;
        }

        const submitButton = form.querySelector("button[type='submit']");
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = "分解中...";
        }

        try {
            const result = await decomposeTask(title);

            if (!result.success) {
                alert(result.message || "分解に失敗しました");
                return;
            }

            decompositionResult.steps = result.steps || [];
            decompositionResult.aiResult = result.aiResult || null;
            decompositionResult.taskCache = result.taskCache || {};
            decompositionResult.syncStatus = result.syncStatus || null;
            decompositionResult.settingsCache = result.settingsCache || {};
            window.navigate?.("result_breakdown");
        } catch (error) {
            console.error("タスク分解に失敗しました", error);
            alert("分解に失敗しました");
        } finally {
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = "タスクを分解する";
            }
        }
    });
}