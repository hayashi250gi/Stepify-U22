// タスクの状態を管理するモジュール

export const appState = {

    currentTaskId: null,

    currentPage: null,

    currentTimerTaskId: null,

    isTimerRunning: false,

    loginUser: null
};


/*
将来的に追加予定:

- AI分解結果
- task cache
- sync status
- settings cache

backend 実装後に連携。
*/