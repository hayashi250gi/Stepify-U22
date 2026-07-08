// タイマーモジュール タイマーの開始・停止・表示機能を提供

let intervalId = null;

let elapsedSeconds = 0;


export function startTimer(displayElement) {

    if (intervalId) {
        return;
    }

    intervalId = setInterval(() => {

        elapsedSeconds++;

        displayElement.textContent =
            formatTime(elapsedSeconds);

    }, 1000);
}


export function stopTimer() {

    clearInterval(intervalId);

    intervalId = null;
}


function formatTime(totalSeconds) {

    const minutes =
        Math.floor(totalSeconds / 60);

    const seconds =
        totalSeconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}


/*
========================================
今後 backend と連携予定
========================================

POST /api/timer/start
POST /api/timer/stop

実行時間永続化
resume対応
同期対応

backend 側 timer table 実装後に対応。
*/