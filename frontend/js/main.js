// メインモジュール 画面要素のロード機能を呼び出し

import { loadLayout } from "./layout.js";
import { initializeRouter } from "./router.js";

// アプリケーションの初期化処理
async function bootstrap() {

    await loadLayout();

    initializeRouter();
}

bootstrap();