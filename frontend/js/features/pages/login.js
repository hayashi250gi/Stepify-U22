// ログインページ
// このページでは Google ログインボタンの描画と、ログアウト・キャンセル操作を管理する。

import { GoogleAuth } from "../auth/google_auth.js";
import { Sidebar } from "../components/sidebar.js";

// ログインページを描画し、各ボタンの動作を設定する。
export function render() {
    const cancelButton = document.getElementById("login-cancel-btn");
    const logoutButton = document.getElementById("login-logout-btn");

    // キャンセルボタン押下時はタスク入力画面へ戻る。
    if (cancelButton) {
        cancelButton.addEventListener("click", () => {
            window.location.href = "/task_input.html";
        });
    }

    // ログアウトボタン押下時は共通モーダルを表示する。
    if (logoutButton) {
        logoutButton.addEventListener("click", () => {
            Sidebar.openLogoutModal();
        });
    }

    // Googleログインボタンを描画する。
    GoogleAuth.renderButton("google-login-button");
}