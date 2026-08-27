// ===================================================
// ファイル名: login.js
// 最終更新日: 2026/08/27
// 作成者: 林健太
// 概要: ログインページの表示とログイン操作を制御するモジュール
// ===================================================

// frontend/js/features/pages/login.js
import { navigate } from "/js/features/router/router.js";
import { GoogleAuth } from "/js/features/auth/google_auth.js";
import { Sidebar } from "/js/features/components/sidebar.js";
import { AuthState } from "/js/features/auth/auth_state.js";

export async function render() {
    const contentView = document.getElementById("content-viewport");
    const isLoggedIn = AuthState.isLoggedIn();
    if (!document.getElementById("login-card")) {
        contentView.innerHTML = `
            <div class="view-container mainmenu-view">
                <div class="card login-card" id="login-card">
                    <h2 class="card-title">ログイン</h2>
                    <p class="login-description">データを同期するためにログインしてください。</p>
                    <div id="google-login-btn" class="google-login-button"></div>
                    <button id="login-cancel-btn" class="btn btn-secondary login-cancel-btn">キャンセル</button>
                    ${isLoggedIn ? '<button id="login-logout-btn" class="btn btn-secondary login-cancel-btn" style="margin-top:10px;">ログアウト</button>' : ''}
                </div>
            </div>
        `;
    }

    const cancelButton = document.getElementById("login-cancel-btn");
    const logoutButton = document.getElementById("login-logout-btn");
    if (!isLoggedIn && logoutButton) {
        logoutButton.remove();
    }
    if (cancelButton) {
        cancelButton.addEventListener("click", () => {
            navigate("/new");
        });
    }

    if (logoutButton) {
        logoutButton.addEventListener("click", () => {
            Sidebar.openLogoutModal();
        });
    }

    try {
        await GoogleAuth.initialize();
        GoogleAuth.renderButton("google-login-btn");
    } catch (err) {
        console.error(err);
    }
}