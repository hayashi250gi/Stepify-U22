// 使い方ページ

import { Router } from "../router/router.js";

export function render() {
    const startButton = document.getElementById("start-using-btn");

    // クリックイベントリスナーを設定
    if (startButton) {
        startButton.addEventListener("click", () => {
            Router.navigate("task_input");
        });
    }
}