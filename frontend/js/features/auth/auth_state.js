// 認証状態をブラウザのCookieに保存・復元するためのユーティリティ。
export class AuthState {
    static cookieName = "stepify-auth";
    static cookieMaxAgeSeconds = 60 * 60 * 24;

    /**
     * ログイン状態を Cookie に保存する。
     * ここではトークンをそのまま保存するのではなく、必要最小限の状態だけを保持する。
     */
    static saveAuthState(user, token) {
        try {
            const payload = {
                isLoggedIn: true,
                user,
                token,
                updatedAt: new Date().toISOString(),
            };

            this.setCookie(this.cookieName, JSON.stringify(payload), this.cookieMaxAgeSeconds);
        } catch (error) {
            console.error("AuthState save failed:", error);
            throw new Error("ログイン状態の保存に失敗しました。");
        }
    }

    /**
     * Cookie からログイン状態を取得する。
     */
    static loadAuthState() {
        try {
            const raw = this.getCookie(this.cookieName);
            if (!raw) {
                return null;
            }

            return JSON.parse(raw);
        } catch (error) {
            console.error("AuthState load failed:", error);
            return null;
        }
    }

    /**
     * Cookie を削除してログアウト状態にする。
     */
    static clearAuthState() {
        try {
            this.setCookie(this.cookieName, "", 0);
        } catch (error) {
            console.error("AuthState clear failed:", error);
            throw new Error("ログイン状態の削除に失敗しました。");
        }
    }

    /**
     * JWT トークンのペイロード部分をデコードする（検証は行わない）。
     * @param {string} token - JWT トークン
     * @returns {object|null} デコードされたペイロード、または null
     */
    static decodeToken(token) {
        try {
            const parts = token.split(".");
            if (parts.length !== 3) {
                return null;
            }
            const payload = parts[1];
            // Base64URL → Base64 に変換
            const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
            const decoded = atob(base64);
            return JSON.parse(decoded);
        } catch (error) {
            console.error("AuthState decodeToken failed:", error);
            return null;
        }
    }

    /**
     * トークンが期限切れかどうかを判定する。
     * @param {string} token - JWT トークン
     * @returns {boolean} 期限切れなら true
     */
    static isTokenExpired(token) {
        const payload = this.decodeToken(token);
        if (!payload || !payload.exp) {
            return true; // デコードできない場合は期限切れとみなす
        }
        const now = Math.floor(Date.now() / 1000);
        return payload.exp < now;
    }

    /**
     * 現在ログイン中かどうかを返す。
     * トークンの有効期限も検証する。
     */
    static isLoggedIn() {
        const state = this.loadAuthState();
        if (!state?.isLoggedIn || !state?.token) {
            return false;
        }
        if (this.isTokenExpired(state.token)) {
            this.clearAuthState();
            return false;
        }
        return true;
    }

    /**
     * Cookie を設定する。
     */
    static setCookie(name, value, maxAgeSeconds) {
        const expires = new Date(Date.now() + maxAgeSeconds * 1000).toUTCString();
        document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; expires=${expires}; SameSite=Lax`;
    }

    /**
     * Cookie を取得する。
     */
    static getCookie(name) {
        const cookies = document.cookie.split(";").map((item) => item.trim());
        const target = cookies.find((item) => item.startsWith(`${name}=`));

        if (!target) {
            return null;
        }

        return decodeURIComponent(target.substring(name.length + 1));
    }
}
