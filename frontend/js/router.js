// ルーター モジュール 画面要素を読み込む機能モジュール

// ページごとのレンダリング関数をインポート
import { renderMainMenu } from "./pages/mainmenu.js";
import { renderBreakdownResult } from "./pages/result_breakdown.js";
import { renderTaskList } from "./pages/task_list.js";
import { renderTaskDetail } from "./pages/task_detail.js";
import { renderTaskSuggestion } from "./pages/task_suggestion.js";
import { renderTaskAction } from "./pages/task_action.js";
import { renderTaskComplete } from "./pages/task_complete.js";
import { renderHow2Use } from "./pages/how2use.js";
import { renderSetting } from "./pages/setting.js";
import { renderLogin } from "./pages/login.js";
import { renderSync } from "./pages/sync.js";

// ページ名とレンダリング関数のマッピング
const routes = {
    mainmenu: renderMainMenu,
    result_breakdown: renderBreakdownResult,
    task_list: renderTaskList,
    task_detail: renderTaskDetail,
    task_suggestion: renderTaskSuggestion,
    task_action: renderTaskAction,
    task_complete: renderTaskComplete,
    how2use: renderHow2Use,
    setting: renderSetting,
    login: renderLogin,
    sync: renderSync
};

// ルーター初期化
export function initializeRouter() {

    setupSidebarNavigation();

    navigate("mainmenu");
}

// ページ遷移処理
async function navigate(pageName) {

    const response = await fetch(
        `contents/${pageName}.html`
    );

    const html = await response.text();

    document.getElementById("content-viewport")
        .innerHTML = html;

    const renderer = routes[pageName];

    if (renderer) {

        renderer();
    }
}

// サイドバーのナビゲーションボタンのクリックイベントを設定
function setupSidebarNavigation() {

    const sidebar =
        document.getElementById("sidebar-viewport");

    sidebar.addEventListener("click", (event) => {

        const button =
            event.target.closest("[data-view]");

        if (!button) {
            return;
        }

        const pageName =
            button.dataset.view;

        navigate(pageName);
    });
}