// ヘッダーを表示するモジュール

export class Header {
    static async initialize() {

        const headerResponse = await fetch(
            "/assets/header.html"
        );

        const headerHtml = await headerResponse.text();

        document.getElementById("header-viewport").innerHTML = headerHtml;
    }
}