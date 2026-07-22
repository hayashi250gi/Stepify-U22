// アプリ起動時に必要な初期化処理を実行するエントリーポイント。

import { Config } from "./config.js";
import { Header } from "./features/components/header.js";
import { Sidebar } from "./features/components/sidebar.js";
import { GoogleAuth } from "./features/auth/google_auth.js";
import { AppStorage } from "./features/storage/app_storage.js";
import { AuthState } from "./features/auth/auth_state.js";

window.addEventListener("DOMContentLoaded", async () => {
    try {
        // 設定読み込み（sessionStorageにキャッシュするので2回目以降はAPI呼び出しなし）
        await Config.initialize();

        // Google認証の初期化（スクリプトロードは GoogleAuth.initialize() に一元化）
        await GoogleAuth.initialize();

        // 未ログイン時のみ IndexedDB を初期化（ゲストユーザー向け）
        if (!AuthState.isLoggedIn()) {
            await AppStorage.initialize();
            console.info("ゲストモード: ローカル保存環境を初期化しました。");
        } else {
            console.info("ログイン済み: IndexedDB の初期化をスキップします。");
        }

        // ヘッダーとサイドバーを動的に生成
        await Header.initialize();
        await Sidebar.initialize();

        // 現在のページのJSが render を export していれば実行する
        // 各ページHTMLの <script> から呼ばれる想定
        console.log("main: initialized");
    } catch (error) {
        console.error("アプリケーション初期化エラー:", error);
        const message = error.message || "初期化中にエラーが発生しました。";
        window.alert(message);
    }
});