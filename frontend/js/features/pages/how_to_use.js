// 使い方ページの表示と、導線ボタンの遷移処理を管理する。

export function render() {
    const startButton = document.getElementById("start-using-btn");

    // クリックイベントリスナーを設定
    if (startButton) {
        startButton.addEventListener("click", () => {
            window.location.href = "/task_input.html";
        });
    }
}