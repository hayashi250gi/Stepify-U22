export function render() {
    const startButton = document.getElementById("start-using-btn");

    // クリックイベントリスナーを設定
    if (startButton) {
        startButton.addEventListener("click", () => {
            window.navigate?.("mainmenu");
        });
    }
}