// タスク実行結果ページ

export function render() {
    const summary = document.getElementById("task-complete-summary");
    const nextButton = document.getElementById("next-step-btn");
    const finishButton = document.getElementById("finish-step-btn");

    if (summary) {
        summary.textContent = "タスクを完了しました。次の一歩として、次のタスクを確認できます。";
    }

    if (nextButton) {
        nextButton.addEventListener("click", () => {
            window.navigate?.("task_suggestion");
        });
    }

    if (finishButton) {
        finishButton.addEventListener("click", () => {
            window.navigate?.("mainmenu");
        });
    }
}