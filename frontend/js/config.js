export class Config {

    static googleClientId = null;

    /**
     * サーバーから公開設定を取得する
     */
    static async initialize() {

        const response = await fetch("/api/config");

        if (!response.ok) {
            throw new Error("Failed to load config.");
        }

        const config = await response.json();

        Config.googleClientId = config.GOOGLE_CLIENT_ID;

    }

}