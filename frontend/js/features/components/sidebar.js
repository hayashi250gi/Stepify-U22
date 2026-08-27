// ===================================================
// ファイル名: sidebar.js
// 最終更新日: 2026/08/27
// 作成者: 林健太
// 概要: サイドバーコンポーネントを生成・制御するモジュール
// ===================================================

// サイドバーを表示するモジュール

import { AuthState } from "../auth/auth_state.js";
import { GoogleAuth } from "../auth/google_auth.js";
import { navigate } from "../router/router.js";

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
        await this.renderAccountCard();
        this.cardEvents();

        this.bindEvents()
    }

    static bindEvents() {
        const menuItems = document.querySelectorAll(".menu-item");

        menuItems.forEach((item) => {
            item.addEventListener("click", () => {
                const view = item.dataset.view;

                if (!view) {
                    return;
                }

                // 設定、ログインなど他のメニュー項目にも対応
                // frontend/js/features/components/sidebar.js
                const routes = {
                    "task_list": "/tasks",
                    "task_input": "/new",
                    "task_suggestion": "/suggest",
                    "how_to_use": "/how-to-use",
                    "setting": "/settings",
                    "login": "/login"
                };

                navigate(routes[view] || `/${view}`);
            });
        });
    }

    // 認証状態に応じてサイドバーのアカウント表示を切り替える。
    static async renderAccountCard() {
        const card = document.getElementById("sidebar-account-card");
        const popup = document.getElementById("sidebar-user-popup");
        const state = AuthState.loadAuthState();
        const isLoggedIn = AuthState.isLoggedIn();

        if (!card) return;

        // hidden 属性を解除して表示可能にする
        card.hidden = false;

        // アカウントカードのテンプレートを読み込む
        const response = await fetch("/assets/sidebar_account_card.html");
        card.innerHTML = await response.text();

        const avatarArea = document.getElementById("sidebar-avatar-area");
        const nameEl = document.getElementById("sidebar-user-name");
        const emailEl = document.getElementById("sidebar-user-email");

        const userInfo = isLoggedIn ? {
            name: state.user.display_name || state.user.name || "ユーザー",
            email: state.user.email || "",
            avatar: state.user.picture || state.user.avatar_url || null,
            isGuest: false
        } : {
            name: "ゲストユーザー",
            email: "ローカルで保存中",
            avatar: null,
            isGuest: true
        };

        nameEl.textContent = userInfo.name;
        emailEl.textContent = userInfo.email;
        avatarArea.innerHTML = userInfo.avatar
            ? `<img src="${userInfo.avatar}" class="sidebar-user-avatar">`
            : `<div class="sidebar-user-avatar-placeholder">${userInfo.name.charAt(0)}</div>`;
        // ポップアップの操作一覧を認証状態に合わせて切り替える。
        if (popup) {
            popup.innerHTML = isLoggedIn
                ? `
                    <button class="sidebar-popup-action" data-action="settings">設定画面へ</button>
                    <button class="sidebar-popup-action" data-action="logout">ログアウト</button>
                `
                : `
                    <button class="sidebar-popup-action" data-action="login">ログインして同期</button>
                `;
            popup.hidden = true;
        }
    }

    // アカウントカードとポップアップのクリックイベントを登録する。
    static cardEvents() {
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
                navigate("/settings");
                return;
            }

            if (action === "login") {
                navigate("/login");
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