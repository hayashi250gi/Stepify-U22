// ===================================================
// ファイル名: task_input.js
// 最終更新日: 2026/08/27
// 作成者: 林健太
// 概要: タスク入力ページの表示と入力操作を制御するモジュール
// ===================================================

// 分解タスク入力ページ。ユーザー入力を受けてAIへ分解依頼を送る。

import { fetchRecentHistory } from "../api.js";
import { AiApi } from "../api/ai_api.js";
import { AuthState } from "../auth/auth_state.js";
import { appState } from "../state.js";
import { navigate } from "../router/router.js";
import { AppStorage } from "../storage/app_storage.js";

const actionLabels = {
    complete: "完了",
    interrupt: "中断",
    skip: "スキップ",
    execution: "実行"
};

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function formatHistoryTime(timestamp) {
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return "日時不明";
    return new Intl.DateTimeFormat("ja-JP", {
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit"
    }).format(date);
}

function renderHistory(historyContainer, history) {
    if (!history.length) {
        historyContainer.innerHTML = '<p class="mainmenu-history-empty">直近一週間の実行履歴はありません。</p>';
        return;
    }

    historyContainer.innerHTML = history.map((item) => `
        <p class="mainmenu-history-text">
            <span class="mainmenu-history-action">${escapeHtml(actionLabels[item.action] || item.action || "実行")}</span>
            <strong>${escapeHtml(item.subtask_title || item.subtaskTitle || "名称未設定のサブタスク")}</strong>
            <span class="mainmenu-history-parent">（${escapeHtml(item.title || "名称未設定のタスク")}）</span>
            <time datetime="${escapeHtml(item.timestamp)}">(${formatHistoryTime(item.timestamp)})</time>
        </p>
    `).join("");
}

async function loadRecentHistory(historyContainer) {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    try {
        let history;
        if (AuthState.isLoggedIn()) {
            const result = await fetchRecentHistory();
            history = Array.isArray(result) ? result : (result?.history || []);
        } else {
            const data = await AppStorage.getAllData();
            history = (await AppStorage.getHistory())
                .filter((item) => new Date(item.timestamp).getTime() >= weekAgo)
                .map((item) => {
                    const task = data.find((candidate) => candidate.id === item.taskId);
                    const subtask = task?.data?.subtasks?.find(
                        (candidate) => String(candidate.subtask_id || candidate.id) === String(item.subtaskId)
                    );
                    return {
                        ...item,
                        title: task?.data?.title,
                        subtask_title: subtask?.title
                    };
                })
                .sort((left, right) => new Date(right.timestamp) - new Date(left.timestamp));
        }
        renderHistory(historyContainer, history);
    } catch (error) {
        console.error("実行履歴の取得に失敗しました", error);
        historyContainer.innerHTML = '<p class="mainmenu-history-empty">実行履歴を読み込めませんでした。</p>';
    }
}

export async function render() {
    const contentView = document.getElementById("content-viewport");

    if (!document.getElementById("task-input-form")) {
        contentView.innerHTML = `
            <div class="view-container view-container-center">
                <div class="card task-input-container" id="task-input-form">
                    <h2 class="card-title">タスク分解</h2>
                    <div class="input-group">
                        <label>タスクタイトル</label>
                        <input type="text" id="task-title" class="input-control" placeholder="例: 部屋の掃除をする">
                    </div>
                    <div class="input-group">
                        <label>詳細</label>
                        <textarea id="task-detail" class="input-control" rows="4" placeholder="詳細があれば入力"></textarea>
                    </div>
                    <button id="decompose-btn" class="btn btn-primary" style="width:100%;">分解する</button>
                    <div id="decomp-loading" style="display: none;">AIがタスクを分析中です...</div>
                </div>
                <section class="mainmenu-history" aria-labelledby="recent-history-title">
                    <h3 id="recent-history-title" class="mainmenu-history-title">直近の実行履歴</h3>
                    <div id="recent-history" class="card mainmenu-history-card">
                        <p class="mainmenu-history-empty">読み込み中...</p>
                    </div>
                </section>
            </div>
        `;
    }
    const form = document.getElementById("task-input-form");
    const taskInput = document.getElementById("task-title");
    const taskDetail = document.getElementById("task-detail");
    const submitBtn = document.getElementById("decompose-btn");
    const loadingDiv = document.getElementById("decomp-loading");
    const cancelButton = document.getElementById("cancel-btn");
    const historyContainer = document.getElementById("recent-history");

    if (historyContainer) {
        loadRecentHistory(historyContainer);
    }

    if (!form || !taskInput || !taskDetail) {
        return;
    }

    if (cancelButton) {
        cancelButton.addEventListener("click", () => {
            navigate("/new");
        });
    }

    submitBtn.addEventListener("click", async (event) => {
        event.preventDefault();

        const title = taskInput.value.trim();
        const detail = taskDetail.value.trim();

        if (!title) {
            return;
        }

        appState.currentTaskTitle = title;
        appState.currentTaskDetail = detail;

        // 送信ボタンを無効化＋ローディング表示
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = "AIがタスクを分析中です...";
        }
        if (loadingDiv) {
            loadingDiv.style.display = "flex";
        }

        console.log("task_input: submit fired", { title, detail });

        try {
            const result = await AiApi.decomposeTask(title, detail);

            console.log("DEBUG task_input: ai result", result);

            appState.decompositionResult = (result.subtasks || []).map((step, index) => ({
                title: step.title || "",
                description: step.description || "",
                order_no: step.order_no || index + 1,
                estimated_minutes: step.estimated_minutes || null,
                duration: step.estimated_minutes ? `${step.estimated_minutes}分` : "-",
                status: step.status || "todo"
            }));

            console.log(appState.decompositionResult);

            console.log("DEBUG task_input: calling navigate");
            navigate("/pages/task_decompose_result.html");
        } catch (error) {
            console.error("AI分解に失敗しました", error);
            alert(error.message || "分解に失敗しました。");
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = "分解する";
            }
            if (loadingDiv) {
                loadingDiv.style.display = "none";
            }
        }
    });
}