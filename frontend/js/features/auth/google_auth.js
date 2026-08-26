import { AuthApi } from "../api/auth_api.js";
import { Config } from "../../config.js";
import { AuthState } from "./auth_state.js";
import { AppStorage } from "../storage/app_storage.js?v=20260822-17";
import { Sidebar } from "../components/sidebar.js";
import { importTasks } from "../api.js";

// Googleログインと認証状態管理の流れを担当するモジュール。
export class GoogleAuth {
    static initialized = false;
    static initializePromise = null;

    /**
     * Google Identity Services を初期化する。
     * 既に読み込み済みなら再利用し、未ロード時のみスクリプトを追加する。
     */
    static async initialize() {
        if (this.initialized) return;
        if (this.initializePromise) return this.initializePromise;

        this.initializePromise = this.initializeInternal();
        try {
            await this.initializePromise;
            this.initialized = true;
        } finally {
            this.initializePromise = null;
        }
    }

    static async initializeInternal() {
        await new Promise((resolve, reject) => {
            if (window.google?.accounts) {
                resolve();
                return;
            }

            const script = document.createElement("script");
            script.src = "https://accounts.google.com/gsi/client";
            

            script.onload = () => resolve();
            script.onerror = () => reject(new Error("Google認証スクリプトの読み込みに失敗しました。"));

            document.head.appendChild(script);
        });

        if (!Config.googleClientId) {
            console.log("DEBUG Google Client ID が未設定です。設定取得を確認してください。")
            throw new Error("Google Client ID が未設定です。設定取得を確認してください。");
        }

        google.accounts.id.initialize({
            client_id: Config.googleClientId,
            ux_mode: "redirect",
            login_uri: `${window.location.origin}/api/auth/google`,
        });
    }

    /**
     * Googleログインボタンを描画する。
     * ボタンを配置する要素が存在しない場合はエラーとして通知する。
     */
    static renderButton(elementId) {
        const element = document.getElementById(elementId);

        if (!element) {
            throw new Error(`ログインボタン要素が見つかりません: ${elementId}`);
        }

        google.accounts.id.renderButton(
            element,
            {
                theme: "outline",
                size: "large",
                width: 240,
            }
        );
    }

    /**
     * 既存の認証状態があれば復元する。
     * Cookie に保存されたトークンがあり、かつ有効期限内の場合のみログイン済みとみなす。
     */
    static restoreSession() {
        return AuthState.isLoggedIn();
    }

    /**
     * Googleログイン成功時に呼ばれる。
     * 受け取った ID Token をバックエンドに送信し、返却された JWT を Cookie に保存する。
     */
    static async handleCredentialResponse(response) {
        try {
            if (!response?.credential) {
                throw new Error("Google認証トークンが取得できませんでした。");
            }

            const result = await AuthApi.loginWithGoogle(response.credential);

            if (!result?.token) {
                throw new Error("サーバーから認証トークンを取得できませんでした。");
            }

            AuthState.saveAuthState(result.user, result.token);
            await AppStorage.initialize();

            const localTasks = (await AppStorage.getAllData())
                .filter(item => item.id !== "user_settings" && item.id !== "action_history" && item.data?.title)
                .map(item => item.data);
            if (localTasks.length > 0) {
                await importTasks(localTasks);
                await Promise.all((await AppStorage.getAllData())
                    .filter(item => item.id !== "user_settings" && item.id !== "action_history" && item.data?.title)
                    .map(item => AppStorage.clearGuestData(item.id)));
            }

            // サイドバーのアカウント表示を即時反映する。
            if (typeof Sidebar?.renderAccountCard === "function") {
                Sidebar.renderAccountCard();
            }

            this.showMessage("ログインに成功しました。", "success");

            // ログイン成功後はタスク入力ページへ遷移する。
            window.location.href = "/pages/task_input.html";
        } catch (error) {
            console.error("[GoogleAuth] Login failed", error);
            this.showMessage(error.message || "ログインに失敗しました。", "error");
        }
    }
    /**
     * ログアウト処理。
     * Cookie とローカル状態を削除し、必要ならページ再読み込みを行う。
     */
    static async logout() {
        try {
            this.showMessage("ログアウト中です。", "info");
            AuthState.clearAuthState();

            // サイドバーのアカウント表示をログアウト状態に更新する。
            if (typeof Sidebar?.renderAccountCard === "function") {
                Sidebar.renderAccountCard();
            }

            // ログアウト後はタスク入力ページへ戻す。
            window.location.href = "/pages/task_input.html";
        } catch (error) {
            console.error("[GoogleAuth] Logout failed", error);
            this.showMessage(error.message || "ログアウトに失敗しました。", "error");
        }
    }

    /**
     * 認証状態の表示メッセージを出す。
     * 既存メッセージがあれば置き換えて表示する。
     */
    static showMessage(message, type = "info") {
        const existing = document.getElementById("auth-status-message");
        if (existing) {
            existing.remove();
        }

        const container = document.querySelector(".view-container") || document.body;
        const element = document.createElement("div");
        element.id = "auth-status-message";
        element.style.marginTop = "12px";
        element.style.padding = "8px 12px";
        element.style.borderRadius = "6px";
        element.style.fontSize = "14px";
        element.style.fontWeight = "600";

        if (type === "success") {
            element.style.background = "#e8f5e9";
            element.style.color = "#2e7d32";
        } else if (type === "error") {
            element.style.background = "#ffebee";
            element.style.color = "#c62828";
        } else {
            element.style.background = "#f5f5f5";
            element.style.color = "#424242";
        }

        element.textContent = message;
        container.appendChild(element);
    }
}

