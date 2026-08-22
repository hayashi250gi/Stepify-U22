// 共通APIクライアント。
// 全APIリクエストに自動で Authorization ヘッダーを付与し、
// 401レスポンス時にグローバルな認証エラーハンドリングを行う。
import { AuthState } from "../auth/auth_state.js";

export class ApiClient {

    /**
     * GET リクエストを送信する。
     */
    static async get(url) {
        return this.request(url, { method: "GET" });
    }

    /**
     * POST リクエストを送信する。
     */
    static async post(url, body = null) {
        return this.request(url, {
            method: "POST",
            body: body !== null ? JSON.stringify(body) : null,
        });
    }

    /**
     * PUT リクエストを送信する。
     */
    static async put(url, body = null) {
        return this.request(url, {
            method: "PUT",
            body: body !== null ? JSON.stringify(body) : null,
        });
    }

    /**
     * DELETE リクエストを送信する。
     */
    static async delete(url) {
        return this.request(url, { method: "DELETE" });
    }

    /**
     * 認証不要のリクエストを送信する（Authorizationヘッダーを付与しない）。
     */
    static async postPublic(url, body = null) {
        return this.request(url, {
            method: "POST",
            body: body !== null ? JSON.stringify(body) : null,
            skipAuth: true,
        });
    }

    /**
     * コアのリクエスト処理。
     * @param {string} url - リクエストURL
     * @param {object} options - { method, body, skipAuth }
     * @returns {Promise<object>} パース済みレスポンスボディ
     */
    static async request(url, options = {}) {
        const { method = "GET", body = null, skipAuth = false } = options;

        const headers = {
            "Content-Type": "application/json",
        };

        // 認証トークンを付与（skipAuth が true の場合は付与しない）
        if (!skipAuth) {
            const token = this._getToken();
            if (token) {
                headers["Authorization"] = `Bearer ${token}`;
            }
        }

        const fetchOptions = { method, headers };
        if (body !== null) {
            fetchOptions.body = body;
        }

        const response = await fetch(url, {
            ...fetchOptions,
            signal: AbortSignal.timeout(8000),
        });

        // レスポンスボディをテキストとして取得（空レスポンス対策）
        const text = await response.text();

        // 401 の場合はグローバル認証エラーハンドリング
        if (response.status === 401) {
            this._handleUnauthorized();
            let message = "認証エラーが発生しました。";
            try {
                const errorBody = JSON.parse(text);
                message = errorBody.message || message;
            } catch (_) {
                // パースできない場合は既定メッセージを使う
            }
            throw new Error(message);
        }

        if (!response.ok) {
            let message = `リクエストに失敗しました (${response.status})`;
            try {
                const errorBody = JSON.parse(text);
                message = errorBody.message || message;
            } catch (_) {
                // パースできない場合は既定メッセージを使う
            }
            throw new Error(message);
        }

        // 空レスポンスの場合は null を返す
        if (!text) {
            return null;
        }

        try {
            return JSON.parse(text);
        } catch (_) {
            throw new Error("サーバーの応答形式が正しくありません。");
        }
    }

    /**
     * 認証トークンを取得する。
     */
    static _getToken() {
        const state = AuthState.loadAuthState();
        return state?.token || null;
    }

    /**
     * 401 認証エラー時のグローバルハンドリング。
     * Cookie をクリアし、ログインページへ遷移する。
     */
    static _handleUnauthorized() {
        console.warn("[ApiClient] 401 Unauthorized - 認証状態をクリアしてログインページへ遷移します。");
        AuthState.clearAuthState();

        window.location.href = "/pages/login.html";

        // ユーザー通知用のメッセージを表示
        this._showAuthErrorMessage();
    }

    /**
     * 認証エラーメッセージを画面上部に表示する。
     */
    static _showAuthErrorMessage() {
        const existing = document.getElementById("api-auth-error-message");
        if (existing) {
            existing.remove();
        }

        const container = document.querySelector(".view-container") || document.body;
        const element = document.createElement("div");
        element.id = "api-auth-error-message";
        element.textContent = "セッションの有効期限が切れました。再ログインしてください。";
        element.style.padding = "12px 16px";
        element.style.margin = "8px 0";
        element.style.background = "#ffebee";
        element.style.color = "#c62828";
        element.style.borderRadius = "6px";
        element.style.fontWeight = "600";
        element.style.fontSize = "14px";
        container.prepend(element);

        // 5秒後に自動で消去
        setTimeout(() => {
            if (element.parentNode) {
                element.remove();
            }
        }, 5000);
    }
}