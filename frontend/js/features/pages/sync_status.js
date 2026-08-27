// ===================================================
// ファイル名: sync_status.js
// 最終更新日: 2026/08/27
// 作成者: 林健太
// 概要: 同期状態ページの表示を制御するモジュール
// ===================================================

// 同期状態ページ
// ログイン済みユーザー向けの状態確認ページを表示し、ログアウト操作を受け付ける。

import { GoogleAuth } from "../auth/google_auth.js";
import { AuthState } from "../auth/auth_state.js";
import { Sidebar } from "../components/sidebar.js";

// 同期状態ページを描画し、ログアウト操作を設定する。
export function render() {
    const contentView = document.getElementById("content-viewport");
    if (!document.getElementById("sync-status-card")) {
        contentView.innerHTML = `
            <div class="view-container">
                <div class="card" id="sync-status-card">
                    <h2 class="card-title">同期ステータス</h2>
                    <div id="sync-status-content">
                        <p>同期状態を取得中...</p>
                    </div>
                    <button id="sync-now-btn" class="btn btn-primary">今すぐ同期</button>
                    <button id="back-sync-btn" class="btn btn-secondary">戻る</button>
                </div>
            </div>
        `;
    }

    const messageBox = document.getElementById("sync-status-message");
    const logoutButton = document.getElementById("sync-logout-btn");

    if (!messageBox) {
        return;
    }

    // 認証済みユーザー名を取得して状態メッセージを表示する。
    const state = AuthState.loadAuthState();
    const userName = state?.user?.display_name || "ログイン済みユーザー";

    messageBox.textContent = `ログイン中です。${userName} と同期準備が整っています。`;
    messageBox.style.marginTop = "12px";
    messageBox.style.padding = "8px 12px";
    messageBox.style.background = "#e8f5e9";
    messageBox.style.color = "#2e7d32";
    messageBox.style.borderRadius = "6px";
    messageBox.style.fontWeight = "600";

    // ログアウトボタン押下時は共通モーダルを表示する。
    if (logoutButton) {
        logoutButton.addEventListener("click", () => {
            Sidebar.openLogoutModal();
        });
    }
}

