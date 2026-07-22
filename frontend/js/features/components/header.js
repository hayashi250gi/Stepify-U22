// ヘッダーを表示するモジュール

// ヘッダーのメニュートグルボタンとサイドバーの開閉状態を管理するモジュール。
export class Header {
    static toggleButton = null;
    static sidebar = null;

    static async initialize() {

        const headerResponse = await fetch(
            "/assets/header.html"
        );

        const headerHtml = await headerResponse.text();

        document.getElementById("header-viewport").innerHTML = headerHtml;

        Header.toggleButton = document.querySelector(
            ".menu-toggle"
        );
        Header.sidebar = document.getElementById("sidebar-viewport");

        if (!Header.toggleButton || !Header.sidebar) {
            return;
        }

        Header.updateToggleButtonState(false);

        Header.toggleButton.addEventListener("click", () => {
            const isOpen = Header.sidebar.classList.toggle("open");
            Header.updateToggleButtonState(isOpen);
        });
    }

    static updateToggleButtonState(isOpen) {
        if (!Header.toggleButton) {
            return;
        }

        Header.toggleButton.setAttribute(
            "aria-expanded",
            String(isOpen)
        );
        Header.toggleButton.setAttribute(
            "aria-label",
            isOpen ? "メニューを閉じる" : "メニューを開く"
        );
    }

    static closeMenu() {
        if (!Header.sidebar || !Header.toggleButton) {
            return;
        }

        if (!Header.sidebar.classList.contains("open")) {
            return;
        }

        Header.sidebar.classList.remove("open");
        Header.updateToggleButtonState(false);
    }
}