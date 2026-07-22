// タスク提案ページ。実行開始・スキップ・キャンセルの操作を受け付ける。

export function render() {
    const startButton = document.getElementById("start-execution-btn");
    const skipButton = document.getElementById("skip-task-btn");
    const cancelButton = document.getElementById("cancel-task-btn");

    if (startButton) {
        startButton.addEventListener("click", () => {
            window.location.href = "/task_execution.html";
        });
    }

    if (skipButton) {
        skipButton.addEventListener("click", () => {
            alert("タスクをスキップし、次の候補を再選定します。");
        });
    }

    if (cancelButton) {
        cancelButton.addEventListener("click", () => {
            window.location.href = "/task_input.html";
        });
    }
}