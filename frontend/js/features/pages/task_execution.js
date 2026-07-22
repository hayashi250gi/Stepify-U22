// タスク実行ページ。タイマー操作と完了・キャンセルの遷移を管理する。

export function render() {

    console.log(
        "task action loaded"
    );

    /*
    今後:
    backend timer連携予定
    */

    const timerDisplay =
        document.getElementById(
            "timer-display"
        );

    const startButton =
        document.getElementById(
            "start-timer"
        );

    const stopButton =
        document.getElementById(
            "stop-timer"
        );

    if (startButton) {

        startButton.addEventListener(
            "click",
            () => {

                startTimer(
                    timerDisplay
                );
            }
        );
    }

    if (stopButton) {

        stopButton.addEventListener(
            "click",
            () => {

                stopTimer();
            }
        );
    }

    const completeButton = document.getElementById("complete-task-btn");
    const cancelButton = document.getElementById("cancel-action-btn");

    if (completeButton) {
        completeButton.addEventListener("click", () => {
            window.location.href = "/task_execution_result.html";
        });
    }

    if (cancelButton) {
        cancelButton.addEventListener("click", () => {
            window.location.href = "/task_input.html";
        });
    }
}