export function render() {
    const saveButton = document.getElementById("save-settings-btn");

    if (saveButton) {
        saveButton.addEventListener("click", () => {
            alert("設定を保存しました（フロントエンド擬似処理）");
            window.navigate?.("mainmenu");
        });
    }
}