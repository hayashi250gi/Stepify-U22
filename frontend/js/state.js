// タスクの状態を管理するモジュール

export const appState = {
    currentTaskId: null,
    currentPage: null,
    currentTimerTaskId: null,
    isTimerRunning: false,
    loginUser: null,
    currentTaskTitle: "",
    decompositionResult: []
};

export function setLoginUser(user) {
    appState.loginUser = user;

    if (user) {
        localStorage.setItem("stepify-login-user", JSON.stringify(user));
    } else {
        localStorage.removeItem("stepify-login-user");
    }

    if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("stepify:auth-state-changed", { detail: { user } }));
    }
}

export const decompositionResult = {
    steps: [],
    aiResult: null,
    taskCache: {},
    syncStatus: null,
    settingsCache: {}
};

export const taskCache = {
    tasks: []
};

export const syncStatus = {
    lastSyncTime: null,
    isSyncing: false,
    error: null
};

export const settingsCache = {
    theme: "light"
};
