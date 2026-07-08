// API呼び出しモジュール

export async function requestHello() {

    const response = await fetch(
        "/api/hello"
    );

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