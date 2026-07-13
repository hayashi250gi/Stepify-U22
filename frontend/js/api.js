// API呼び出しモジュール

export async function loginWithBackend(token, user, clientSecret) {
    const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, user, clientSecret })
    });

    return await response.json();
}

export async function fetchTasks() {
    const response = await fetch("/api/tasks");
    return await response.json();
}

export async function decomposeTask(title) {
    const response = await fetch("/api/tasks/decompose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title })
    });

    return await response.json();
}

export async function createTask(title, steps = []) {
    const response = await fetch("/api/tasks/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, steps })
    });

    return await response.json();
}


/*
========================================
今後 backend 実装後に追加予定
========================================

POST /api/decompose
→ タスク分解 AI 呼び出し

GET /api/tasks
→ タスク一覧取得

GET /api/tasks/:id
→ task詳細取得

POST /api/tasks
→ task作成

PUT /api/tasks/:id
→ task更新

DELETE /api/tasks/:id
→ task削除

POST /api/task-suggestion
→ 実行候補生成

POST /api/timer/start
→ 実行開始保存

POST /api/timer/stop
→ 実行停止保存

POST /api/login
→ ログイン認証

POST /api/sync
→ アカウント同期

GET /api/settings
→ 設定取得

PUT /api/settings
→ 設定更新
*/