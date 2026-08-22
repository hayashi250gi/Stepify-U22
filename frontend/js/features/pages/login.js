// frontend/js/features/pages/login.js
import { navigate } from "/js/features/router/router.js";
import { GoogleAuth } from "/js/features/auth/google_auth.js";
import { Sidebar } from "/js/features/components/sidebar.js";

export async function render() {
    const contentView = document.getElementById("content-viewport");
    if (!document.getElementById("login-card")) {
        contentView.innerHTML = `
            <div class="view-container mainmenu-view">
                <div class="card login-card" id="login-card">
                    <h2 class="card-title">ログイン</h2>
                    <p class="login-description">データを同期するためにログインしてください。</p>
                    <div id="google-login-btn" class="google-login-button"></div>
                    <button id="login-cancel-btn" class="btn btn-secondary login-cancel-btn">キャンセル</button>
                    <button id="login-logout-btn" class="btn btn-secondary login-cancel-btn" style="margin-top:10px;">ログアウト</button>
                </div>
            </div>
        `;
    }

    const cancelButton = document.getElementById("login-cancel-btn");
    const logoutButton = document.getElementById("login-logout-btn");
    if (cancelButton) {
        cancelButton.addEventListener("click", () => {
            navigate("/tasks/new");
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