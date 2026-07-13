import {
    startTimer,
    stopTimer
} from "../timer.js";

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
            window.navigate?.("task_complete");
        });
    }

    if (cancelButton) {
        cancelButton.addEventListener("click", () => {
            window.navigate?.("mainmenu");
        });
    }
}