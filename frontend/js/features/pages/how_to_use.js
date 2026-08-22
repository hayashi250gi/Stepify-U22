// frontend/js/features/pages/how_to_use.js
import { navigate } from "/js/features/router/router.js";

export function render() {
    const contentView = document.getElementById("content-viewport");
    if (!document.getElementById("howto-card")) {
        contentView.innerHTML = `
            <div class="view-container">
                <div class="card howto-card" id="howto-card">
                    <h2 class="card-title">使い方</h2>
                    <div class="howto-content">
                        <p>1. ＋ 分解ボタンからタスクを入力します。</p>
                        <p>2. AIがタスクをサブタスクに分解します。</p>
                        <p>3. 実行を開始してタスクをこなしましょう。</p>
                    </div>
                    <div class="howto-actions">
                        <button id="start-using-btn" class="btn btn-primary">はじめる</button>
                    </div>
                </div>
            </div>
        `;
    }
    // ...以降の既存ロジック
    const startButton = document.getElementById("start-using-btn");

    if (startButton) {
        startButton.addEventListener("click", () => {
            navigate("/new");
        });
    }
}

