// 同期状態ページ
// ログイン済みユーザー向けの状態確認ページを表示し、ログアウト操作を受け付ける。

import { GoogleAuth } from "../auth/google_auth.js";
import { AuthState } from "../auth/auth_state.js";
import { Sidebar } from "../components/sidebar.js";

// 同期状態ページを描画し、ログアウト操作を設定する。
export function render() {
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
