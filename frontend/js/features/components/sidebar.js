// サイドバーを表示するモジュール

import { AuthState } from "../auth/auth_state.js";
import { GoogleAuth } from "../auth/google_auth.js";
import { Router } from "../router/router.js";

export class Sidebar {
    // サイドバーHTMLを読み込み、アカウントカードとイベントを初期化する。
    static async initialize() {
        const sidebarResponse = await fetch(
            "/assets/sidebar.html"
        );

        const sidebarHtml = await sidebarResponse.text();
        document.getElementById("sidebar-viewport").innerHTML = sidebarHtml;

        // ログアウト確認モーダルは初期状態では非表示にしておく。
        const modal = document.getElementById("sidebar-logout-modal");
        if (modal) {
            modal.hidden = true;
            modal.setAttribute("aria-hidden", "true");
            modal.style.display = "none";
        }

        // 認証状態に応じてアカウントカードとポップアップ内容を描画する。
        this.renderAccountCard();
        this.bindEvents();
    }

    // 認証状態に応じてサイドバーのアカウント表示を切り替える。
    static renderAccountCard() {
        const card = document.getElementById("sidebar-account-card");
        const popup = document.getElementById("sidebar-user-popup");
        const state = AuthState.loadAuthState();

        if (!card) {
            return;
        }

        // ログイン済みかどうかを判定し、ユーザー情報を取得する。
        const isLoggedIn = Boolean(state?.isLoggedIn && state?.user);
        const user = state?.user || {};
        const avatarUrl = user.picture || user.avatar_url || "";
        const displayName = user.display_name || user.name || "ゲストユーザー";
        const email = user.email || "";

        // アカウントカードは常に表示し、状態に応じて内容を切り替える。
        card.hidden = false;
        card.innerHTML = `
            <button class="sidebar-account-button" type="button" aria-label="ユーザー情報を表示">
                ${avatarUrl ? `<img src="${avatarUrl}" alt="${displayName}" class="sidebar-user-avatar">` : `<div class="sidebar-user-avatar-placeholder">${displayName.charAt(0)}</div>`}
                <span class="sidebar-user-name">${displayName}</span>
            </button>
        `;

        // ログイン済みユーザーのみメールアドレスを表示する。
        if (email && isLoggedIn) {
            const emailLabel = document.createElement("div");
            emailLabel.className = "sidebar-user-email";
            emailLabel.textContent = email;
            card.appendChild(emailLabel);
        }

        // ポップアップの操作一覧を認証状態に合わせて切り替える。
        if (popup) {
            popup.innerHTML = isLoggedIn
                ? `
                    <button class="sidebar-popup-action" data-action="settings">設定画面へ</button>
                    <button class="sidebar-popup-action" data-action="logout">ログアウト</button>
                `
                : `
                    <button class="sidebar-popup-action" data-action="settings">設定画面へ</button>
                    <button class="sidebar-popup-action" data-action="login">ログイン</button>
                `;
            popup.hidden = true;
        }
    }

    // アカウントカードとポップアップのクリックイベントを登録する。
    static bindEvents() {
        const card = document.getElementById("sidebar-account-card");
        const popup = document.getElementById("sidebar-user-popup");
        const modal = document.getElementById("sidebar-logout-modal");
        const logoutConfirm = document.getElementById("sidebar-logout-confirm");
        const logoutCancel = document.getElementById("sidebar-logout-cancel");

        if (!card || !popup) {
            return;
        }

        // カードを押すとポップアップの表示状態を切り替える。
        card.addEventListener("click", (event) => {
            event.stopPropagation();
            popup.hidden = !popup.hidden;
            popup.style.top = `${card.getBoundingClientRect().top - 70}px`;
            popup.style.left = `${card.getBoundingClientRect().left}px`;
        });

        // 画面のどこかを押すとポップアップを閉じる。
        document.addEventListener("click", () => {
            popup.hidden = true;
        });

        // ポップアップ内のボタン操作を処理する。
        popup.addEventListener("click", async (event) => {
            const button = event.target.closest("[data-action]");
            if (!button) {
                return;
            }

            const action = button.dataset.action;
            popup.hidden = true;

            if (action === "settings") {
                await Router.navigate("setting");
                return;
            }

            if (action === "login") {
                await Router.navigate("login");
                return;
            }

            if (action === "logout") {
                this.openLogoutModal();
            }
        });

        // ログアウト確認ボタン押下時に実際のログアウト処理を実行する。
        if (logoutConfirm) {
            logoutConfirm.addEventListener("click", async () => {
                await GoogleAuth.logout();
                this.closeLogoutModal();
            });
        }

        // キャンセル時はモーダルを閉じるだけにする。
        if (logoutCancel) {
            logoutCancel.addEventListener("click", (event) => {
                event.preventDefault();
                event.stopPropagation();
                console.log("cancel clicked");
                this.closeLogoutModal();
            });
        }

        // モーダルの外側を押した場合も閉じる。
        if (modal) {
            modal.addEventListener("click", (event) => {
                if (event.target === modal) {
                    event.preventDefault();
                    event.stopPropagation();
                    console.log("modal backdrop clicked");
                    this.closeLogoutModal();
                }
            });
        }
    }

    // ログアウト確認モーダルを表示し、対象ユーザー情報を反映する。
    static openLogoutModal() {
        const modal = document.getElementById("sidebar-logout-modal");
        const userBox = document.getElementById("sidebar-logout-user");
        const state = AuthState.loadAuthState();

        if (!modal || !userBox) {
            return;
        }

        const user = state?.user || {};
        const displayName = user.display_name || user.name || "ゲストユーザー";
        const email = user.email || "";
        const avatarUrl = user.picture || user.avatar_url || "";

        // モーダル内に表示するユーザー情報を組み立てる。
        userBox.innerHTML = `
            <div class="sidebar-logout-user-card">
                ${avatarUrl ? `<img src="${avatarUrl}" alt="${displayName}" class="sidebar-logout-avatar">` : `<div class="sidebar-logout-avatar-placeholder">${displayName.charAt(0)}</div>`}
                <div>
                    <div class="sidebar-logout-user-name">${displayName}</div>
                    <div class="sidebar-logout-user-email">${email || "メールアドレス未設定"}</div>
                </div>
            </div>
        `;

        // モーダルを表示状態にしてユーザーに確認を求める。
        modal.hidden = false;
        modal.setAttribute("aria-hidden", "false");
        modal.style.display = "flex";
        modal.style.opacity = "1";
    }

    // ログアウト確認モーダルを閉じる。
    static closeLogoutModal() {
        const modal = document.getElementById("sidebar-logout-modal");
        if (modal) {
            modal.hidden = true;
            modal.setAttribute("aria-hidden", "true");
            modal.style.display = "none";
        }
    }
}