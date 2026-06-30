/**
 * Stepify フロントエンド・プロトタイプ コアロジック
 */

// アプリケーション内状態管理（擬似的な状態保持）
const AppState = {
    currentTaskName: "ダミーの親タスク",
    timerInterval: null,
    timerSeconds: 15 * 60 // 15分
};

document.addEventListener("DOMContentLoaded", () => {
    // 1. 共通パーツの読み込み
    initCommonParts();
    
    // 2. 初期画面（メインメニュー）のロード
    loadView("main-menu");
});

/**
 * ヘッダー、サイドバーの動的インクルード
 */
function initCommonParts() {
    // ヘッダーの読み込み
    fetch("assets/header.html")
        .then(res => res.text())
        .then(html => {
            document.getElementById("header-viewport").innerHTML = html;
            setupHeaderEvents();
        });

    // サイドバーの読み込み
    fetch("assets/sidebar.html")
        .then(res => res.text())
        .then(html => {
            document.getElementById("sidebar-viewport").innerHTML = html;
            setupSidebarEvents();
        });
}

/**
 * 指定されたビュー（画面）をメインエリアに非同期ロードする
 * @param {string} viewName - contents/配下のファイル名（拡張子なし）
 * @param {function} callback - ロード完了後に実行する初期化処理
 */
function loadView(viewName, callback = null) {
    // タイマーが動いている場合はクリアする
    if (AppState.timerInterval) {
        clearInterval(AppState.timerInterval);
        AppState.timerInterval = null;
    }

    fetch(`contents/${viewName}.html`)
        .then(res => {
            if (!res.ok) throw new Error(`ビューが見つかりません: ${viewName}`);
            return res.text();
        })
        .then(html => {
            const viewport = document.getElementById("content-viewport");
            viewport.innerHTML = html;
            
            // サイドバーのactive状態を更新
            updateActiveMenu(viewName);
            
            // ビュー個別の動的イベント登録・プロトタイプインタラクション
            setupViewInteractions(viewName);

            if (callback) callback();
            
            // モバイル時は画面遷移時にサイドバーを自動で閉じる
            const sidebar = document.getElementById("sidebar-viewport");
            if(sidebar) sidebar.classList.remove("open");
        })
        .catch(err => console.error(err));
}

/**
 * サイドバーの選択ハイライト管理
 */
function updateActiveMenu(viewName) {
    const items = document.querySelectorAll(".menu-item");
    items.forEach(item => {
        if (item.getAttribute("data-view") === viewName) {
            item.classList.add("active");
        } else {
            item.classList.remove("active");
        }
    });
}

/**
 * ヘッダーパーツのイベント設定
 */
function setupHeaderEvents() {
    document.body.addEventListener("click", (e) => {
        if (e.target.classList.contains("menu-toggle") || e.target.closest(".menu-toggle")) {
            const sidebar = document.getElementById("sidebar-viewport");
            sidebar.classList.toggle("open");
        }
    });
}

/**
 * サイドバーパーツのナビゲーションイベント設定
 */
function setupSidebarEvents() {
    const sidebar = document.getElementById("sidebar-viewport");
    sidebar.addEventListener("click", (e) => {
        const menuItem = e.target.closest(".menu-item");
        if (menuItem) {
            const view = menuItem.getAttribute("data-view");
            if (view) loadView(view);
        }
    });
}

/**
 * 各ビューにおけるプロトタイプ用の擬似インタラクション・遷移定義
 */
function setupViewInteractions(viewName) {
    switch (viewName) {
        case "main-menu":
            const decompForm = document.getElementById("decomp-form");
            if (decompForm) {
                decompForm.addEventListener("submit", (e) => {
                    e.preventDefault();
                    const taskInput = document.getElementById("task-input").value;
                    if (taskInput.trim() !== "") {
                        AppState.currentTaskName = taskInput;
                        loadView("decomp-result");
                    }
                });
            }
            break;

        case "decomp-result":
            // 反映されたタスク名を表示
            const placeholder = document.getElementById("parent-task-title-placeholder");
            if (placeholder) placeholder.textContent = AppState.currentTaskName;
            
            // 提案画面への遷移ボタン
            const toProposalBtn = document.getElementById("to-proposal-btn");
            if (toProposalBtn) {
                toProposalBtn.addEventListener("click", () => loadView("proposal"));
            }
            break;

        case "proposal":
            // 提案画面の開始インタラクション
            const startExecutionBtn = document.getElementById("start-execution-btn");
            if (startExecutionBtn) {
                startExecutionBtn.addEventListener("click", () => loadView("running"));
            }
            break;

        case "running":
            // 15分簡易タイマーの作動
            startPrototypeTimer();
            const completeTaskBtn = document.getElementById("complete-task-btn");
            if (completeTaskBtn) {
                completeTaskBtn.addEventListener("click", () => loadView("complete"));
            }
            break;

        case "task-list":
            // テーブル行クリックで詳細へ
            const rows = document.querySelectorAll(".clickable-row");
            rows.forEach(row => {
                row.addEventListener("click", () => {
                    const taskName = row.getAttribute("data-task-name");
                    if (taskName) AppState.currentTaskName = taskName;
                    loadView("task-detail");
                });
            });
            break;
            
        case "task-detail":
            const detailPlaceholder = document.getElementById("detail-task-title-placeholder");
            if (detailPlaceholder) detailPlaceholder.textContent = AppState.currentTaskName;
            break;
    }
}

/**
 * 実行中画面のカウントダウンタイマー処理
 */
function startPrototypeTimer() {
    AppState.timerSeconds = 15 * 60;
    const timerDisplay = document.getElementById("timer-display");
    
    if (!timerDisplay) return;

    AppState.timerInterval = setInterval(() => {
        AppState.timerSeconds--;
        if (AppState.timerSeconds <= 0) {
            clearInterval(AppState.timerInterval);
            loadView("complete");
            return;
        }
        
        const mins = Math.floor(AppState.timerSeconds / 60).toString().padStart(2, '0');
        const secs = (AppState.timerSeconds % 60).toString().padStart(2, '0');
        timerDisplay.textContent = `${mins}:${secs}`;
    }, 1000);
}