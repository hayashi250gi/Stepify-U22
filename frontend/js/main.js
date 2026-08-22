import { Config } from "./config.js";
import { Header } from "/js/features/components/header.js";
import { Sidebar } from "/js/features/components/sidebar.js";
import { GoogleAuth } from "/js/features/auth/google_auth.js";
import { AppStorage } from "/js/features/storage/app_storage.js?v=20260822-10";
import { AuthState } from "/js/features/auth/auth_state.js";
import { ThemeManager } from "./features/theme_manager.js";
import { handleRoute, navigate } from "/js/features/router/router.js?v=20260822-9";

window.addEventListener("DOMContentLoaded", async () => {
    try {
        // 設定読み込み
        await Config.initialize();

        // Google認証の初期化
        await GoogleAuth.initialize();

        // --- テーマの適用処理 ---
        const SETTINGS_KEY = "user_settings";
        let settings = null;

        if (AuthState.isLoggedIn()) {
            const userState = AuthState.loadAuthState();
            const userId = userState?.user?.user_id;
            if (userId) {
                try {
                    const response = await fetch(`/api/users/${userId}/settings`);
                    if (response.ok) settings = await response.json();
                } catch (e) { console.error("API設定取得失敗", e); }
            }
        } else {
            await AppStorage.initialize();
            settings = await AppStorage.loadGuestData(SETTINGS_KEY);
        }

        if (settings?.appearance?.theme) {
            ThemeManager.apply(settings.appearance.theme);
        }
        // -----------------------

        // 未ログイン時のみ IndexedDB を初期化
        if (!AuthState.isLoggedIn()) {
            console.info("ゲストモード: ローカル保存環境を初期化しました。");
        } else {
            console.info("ログイン済み: IndexedDB の初期化をスキップします。");
        }

        // ヘッダーとサイドバーを動的に生成
        await Header.initialize();
        await Sidebar.initialize();

        // ルーター起動
        handleRoute();

        console.log("main: initialized");
    } catch (error) {
        console.error("アプリケーション初期化エラー:", error);
        const message = error.message || "初期化中にエラーが発生しました。";
        window.alert(message);
    }
});