// URL 操作ユーティリティ。
// SPA用のページ遷移は廃止し、window.location.href による画面遷移に統一する。

import { render as renderTaskList } from "../pages/task_list.js?v=20260822-12";
import { render as renderTaskDetail } from "../pages/task_list_detail.js";
import { render as renderTaskInput } from "../pages/task_input.js";
import { render as renderTaskSuggestion } from "../pages/task_suggestion.js?v=20260822-4";
import { render as renderTaskExecution } from "../pages/task_execution.js";
import { render as renderTaskExecutionResult } from "../pages/task_execution_result.js?v=20260822";
import { render as renderHowToUse } from "../pages/how_to_use.js";
import { render as renderLogin } from "../pages/login.js";
import { render as renderSettings } from "../pages/setting.js";

// frontend/js/features/router/router.js
const routes = [
    { path: /^\/tasks$/, render: renderTaskList },
    { path: /^\/pages\/task_list\.html$/, render: renderTaskList },
    { path: /^\/tasks\/([a-zA-Z0-9_]+)$/, render: (match) => renderTaskDetail(match) },
    { path: /^\/new$/, render: renderTaskInput },
    { path: /^\/suggest$/, render: renderTaskSuggestion },
    { path: /^\/execute$/, render: renderTaskExecution },
    { path: /^\/result$/, render: renderTaskExecutionResult },
    { path: /^\/how-to-use$/, render: renderHowToUse },
    { path: /^\/login$/, render: renderLogin },
    { path: /^\/settings$/, render: renderSettings }
];

export class Router {

    /**
     * 現在のURLのクエリパラメータを URLSearchParams として返す。
     * @returns {URLSearchParams}
     */
    static getQueryParams() {
        return new URLSearchParams(window.location.search);
    }

    /**
     * 指定したページへ遷移する。
     * @param {string} path - 遷移先パス
     */
    static navigate(path) {
        window.location.href = path;
    }
}

let currentPath = null;

export function handleRoute() {
    const path = window.location.pathname;

    // 同じパスなら何もしない（二重レンダリング防止）
    if (currentPath === path) return;
    currentPath = path;

    const contentView = document.getElementById("content-viewport");

    // ルートアクセス時のリダイレクト先を /tasks/new に変更
    if (path === '/') {
        window.history.replaceState(null, '', '/tasks/new');
        contentView.innerHTML = ''; // クリアしてからrender
        renderTaskInput();
        return;
    }

    for (const route of routes) {
        const match = path.match(route.path);
        if (match) {
            contentView.innerHTML = ''; // クリアしてからrender
            // パラメータがある場合はそれ以降を渡す
            route.render(match[1]);
            return;
        }
    }

    // デフォルト遷移をコメントアウトし、明示的な遷移のみにする
    // window.history.replaceState(null, '', '/tasks');
    // handleRoute();
}

export function navigate(path) {
    window.location.href = path;
}

