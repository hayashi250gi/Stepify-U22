export function render() {
    const startButton = document.getElementById("start-execution-btn");
    const skipButton = document.getElementById("skip-task-btn");
    const cancelButton = document.getElementById("cancel-task-btn");

    if (startButton) {
        startButton.addEventListener("click", () => {
            window.navigate?.("task_action");
        });
    }

    if (skipButton) {
        skipButton.addEventListener("click", () => {
            alert("タスクをスキップし、次の候補を再選定します。");
        });
    }

    if (cancelButton) {
        cancelButton.addEventListener("click", () => {
            window.navigate?.("mainmenu");
        });
    }
}