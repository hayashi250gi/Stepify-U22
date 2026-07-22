// タスク実行完了後の結果表示ページ。次の行動へ遷移する。

export function render() {
    const summary = document.getElementById("task-complete-summary");
    const nextButton = document.getElementById("next-step-btn");
    const finishButton = document.getElementById("finish-step-btn");

    // 完了メッセージを画面に反映する。
    if (summary) {
        summary.textContent = "タスクを完了しました。次の一歩として、次のタスクを確認できます。";
    }

    if (nextButton) {
        nextButton.addEventListener("click", () => {
            window.location.href = "/task_suggestion.html";
        });
    }

    if (finishButton) {
        finishButton.addEventListener("click", () => {
            window.location.href = "/task_input.html";
        });
    }
}