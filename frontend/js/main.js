// 最初に読み込まれるJSファイル

import { Config } from "./config.js";
import { Header } from "./features/components/header.js";
import { Sidebar } from "./features/components/sidebar.js";
import { Router } from "./features/router/router.js";
import { GoogleAuth } from "./features/auth/google_auth.js";

window.addEventListener("DOMContentLoaded", async () => {

    // 設定を初期化
    await Config.initialize();
    // 認証状態を初期化
    await GoogleAuth.initialize();

    // ヘッダーとサイドバーを表示
    await Header.initialize();
    await Sidebar.initialize();

    // ルーターを初期化
    Router.initialize();

});