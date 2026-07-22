// アプリ全体で共有する設定値を管理するモジュール。
export class Config {

    // Googleログインに必要なクライアントIDを保持する。
    static googleClientId = null;

    /**
     * サーバーから公開設定を取得する。
     * 取得した値は sessionStorage にキャッシュし、2回目以降はAPI呼び出しをスキップする。
     */
    static async initialize() {
        // sessionStorage にキャッシュがあればそれを利用する
        const cached = sessionStorage.getItem("stepify-config");
        if (cached) {
            try {
                const config = JSON.parse(cached);
                Config.googleClientId = config.GOOGLE_CLIENT_ID;
                console.info("Config: キャッシュから設定を復元しました。");
                return;
            } catch (_) {
                // キャッシュが壊れていた場合は再取得
                sessionStorage.removeItem("stepify-config");
            }
        }

        const response = await fetch("/api/config");

        if (!response.ok) {
            throw new Error("Failed to load config.");
        }

        console.log(`config status: ${response.status}`);

        const config = await response.json();

        Config.googleClientId = config.GOOGLE_CLIENT_ID;

        // sessionStorage にキャッシュ
        try {
            sessionStorage.setItem("stepify-config", JSON.stringify(config));
        } catch (_) {
            // キャッシュできなくてもエラーにはしない
        }
    }

}