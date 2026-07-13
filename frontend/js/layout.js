// ヘッダ、サイドバーのHTMLを読み込む機能モジュール

import { appState, setLoginUser } from "./state.js";
import { navigate } from "./router.js";

function restoreLoginState() {
    try {
        const savedUser = localStorage.getItem("stepify-login-user");

        if (savedUser) {
            appState.loginUser = JSON.parse(savedUser);
        }
    } catch (error) {
        console.warn("ログイン状態の復元に失敗しました", error);
    }
}

function bindAuthStateEvents() {
    if (typeof window === "undefined") {
        return;
    }

    window.removeEventListener("stepify:auth-state-changed", renderAuthStatus);
    window.addEventListener("stepify:auth-state-changed", renderAuthStatus);
}

export function renderAuthStatus() {
    const authStatus = document.getElementById("auth-status");

    if (!authStatus) {
        return;
    }

    if (appState.loginUser) {
        const user = appState.loginUser;
        const displayName = user.name || user.email || "ログイン済み";
        const displayEmail = user.email ? `<div class="auth-user-email">${user.email}</div>` : "";
        const avatar = user.picture
            ? `<img class="auth-user-avatar" src="${user.picture}" alt="${displayName}">`
            : `<div class="auth-user-avatar auth-user-avatar-placeholder">👤</div>`;

        authStatus.innerHTML = `
            <div class="auth-user">
                ${avatar}
                <div class="auth-user-meta">
                    <div class="auth-user-name">${displayName}</div>
                    ${displayEmail}
                </div>
            </div>
            <button class="btn auth-logout-button" type="button">ログアウト</button>
        `;

        const logoutButton = authStatus.querySelector(".auth-logout-button");
        logoutButton?.addEventListener("click", () => {
            setLoginUser(null);
            renderAuthStatus();
        });

        return;
    }

    authStatus.innerHTML = `
        <button class="btn auth-login-button" type="button">ログイン</button>
    `;

    const loginButton = authStatus.querySelector("button");
    loginButton?.addEventListener("click", () => {
        navigate("login");
    });
}

export async function loadLayout() {
    restoreLoginState();
    bindAuthStateEvents();

    const headerResponse = await fetch(
        "/assets/header.html"
    );

    const headerHtml = await headerResponse.text();

    document.getElementById("header-viewport").innerHTML = headerHtml;
    renderAuthStatus();

    const sidebarResponse = await fetch(
        "assets/sidebar.html"
    );

    const sidebarHtml = await sidebarResponse.text();

    document.getElementById("sidebar-viewport").innerHTML = sidebarHtml;
}