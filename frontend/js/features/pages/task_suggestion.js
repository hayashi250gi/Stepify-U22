// ===================================================
// ファイル名: task_suggestion.js
// 最終更新日: 2026/08/27
// 作成者: 林健太
// 概要: タスク提案ページの表示と操作を制御するモジュール
// ===================================================

// タスク提案ページ。実行開始・スキップ・キャンセルの操作を受け付ける。
import { suggestTask } from "/js/features/api.js";
import { AppStorage } from "/js/features/storage/app_storage.js?v=20260822-17";
import { AuthState } from "/js/features/auth/auth_state.js";
import { navigate } from "/js/features/router/router.js";

export async function render() {
        const contentView = document.getElementById("content-viewport");

    if (!document.getElementById("suggestion-card")) {
        contentView.innerHTML = `
            <div class="view-container task-suggestion-view">
                <div class="card task-suggestion-card" id="suggestion-card">
                    <span class="task-suggestion-badge">次に行う推奨アクション</span>
                    <h2 class="task-suggestion-title">読み込み中...</h2>
                    <p class="task-suggestion-description"></p>
                    <div class="task-suggestion-actions">
                        <button id="start-execution-btn" class="btn btn-primary task-suggestion-start-btn" style="display:none;">実行を開始する</button>
                    </div>
                </div>
            </div>
        `;
    }

    const titleEl = document.querySelector(".task-suggestion-title");
    const descEl = document.querySelector(".task-suggestion-description");
    const startButton = document.getElementById("start-execution-btn");
    try {
        const params = new URLSearchParams(window.location.search);
        const filterTaskId = params.get("task_id");

        let suggestion = null;
        if (AuthState.isLoggedIn()) {
             // ログイン時の提案ロジックに task_id フィルタを考慮させる必要がある
            suggestion = await suggestTask(filterTaskId);
        } else {
            const allData = await AppStorage.getAllData();
            let tasks = allData.map(item => ({ ...item.data, task_id: item.id }));

            // task_id 指定があればフィルタリング
            if (filterTaskId) {
                tasks = tasks.filter(t => t.task_id === filterTaskId);
            }

            // 「未完了のサブタスクが存在する」タスクのみに絞り込む
            const activeTasks = tasks.filter(t =>
                Array.isArray(t.subtasks) && t.subtasks.some(s => s.status !== 'done')
            );

            if (activeTasks.length > 0) {
                // 締切と優先度でソートして最初のタスクを選択（簡易版）
                const task = activeTasks[0];
                // 「未完了のサブタスク」のみを抽出
                const activeSubs = task.subtasks
                    .map((subtask, index) => ({
                        ...subtask,
                        subtask_id: subtask.subtask_id || `${task.task_id}_subtask_${index}`
                    }))
                    .filter(s => s.status !== 'done');
                // order_no順に並べる
                activeSubs.sort((a, b) => (a.order_no || 0) - (b.order_no || 0));

                suggestion = {
                    task_id: task.task_id,
                    task_title: task.title,
                    progress: (task.subtasks.filter(s => s.status === 'done').length / task.subtasks.length) * 100,
                    completed_subtasks: task.subtasks.filter(s => s.status === 'done').length,
                    total_subtasks: task.subtasks.length,
                    subtask: activeSubs[0]
                };
            }
        }

        if (suggestion && suggestion.subtask) {
            titleEl.textContent = suggestion.subtask.title;
            // 進捗の計算 (簡易版: サーバー側からサブタスク数を受け取るのが理想だが、ここでは提案オブジェクトから読み取る)
            // もし提案APIが親タスクの進捗情報を含んでいない場合は、別途取得が必要です。
            // 今回は既存の提案データに親タスクのステータス情報がないため、まずは表示可能な情報を追加
            descEl.innerHTML = `
                <div class="task-suggestion-meta">
                    <div style="margin-bottom: 12px;">親タスク: <strong>${suggestion.task_title}</strong></div>
                    <div class="suggestion-progress-wrapper">
                        <div class="progress-container" style="width: 120px;">
                            <div class="progress-bar" style="width: ${suggestion.progress || 0}%;"></div>
                        </div>
                        <span style="font-weight: 600;">${suggestion.completed_subtasks} / ${suggestion.total_subtasks}</span>
                    </div>
                    <div style="margin-top: 12px;">推定所要時間: <strong>${suggestion.subtask.estimated_minutes || 0}分</strong></div>
                </div>
            `;
    if (startButton) {
                startButton.style.display = "inline-flex";
                startButton.textContent = "実行を開始する";
                startButton.onclick = () => {
                    // クエリパラメータを修正: task_id, subtask_id, title, minutes
                    navigate(`/execute?task_id=${suggestion.task_id}&subtask_id=${suggestion.subtask.subtask_id}&title=${encodeURIComponent(suggestion.subtask.title)}&minutes=${suggestion.subtask.estimated_minutes || 15}`);
                };
    }
        } else {
            titleEl.textContent = "現在実行可能なタスクはありません";
            descEl.textContent = "新しいタスクを作成して、効率的に進めましょう。";
    if (startButton) {
                startButton.textContent = "タスクを作成する";
                startButton.style.display = "inline-flex";
                startButton.onclick = () => navigate("/new");
}
    }
    } catch (error) {
        console.error(error);
        titleEl.textContent = "提案取得エラー";
    }

}

