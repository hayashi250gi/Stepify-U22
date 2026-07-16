// サイドバーを表示するモジュール

export class Sidebar {
    static async initialize() {

        const sidebarResponse = await fetch(
            "/assets/sidebar.html"
        );

        const sidebarHtml = await sidebarResponse.text();

        document.getElementById("sidebar-viewport").innerHTML = sidebarHtml;
    }
}