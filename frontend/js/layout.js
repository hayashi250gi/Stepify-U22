// ヘッダ、サイドバーのHTMLを読み込む機能モジュール

export async function loadLayout() {

    const headerResponse = await fetch(
        "/assets/header.html"
    );

    const headerHtml = await headerResponse.text();

    document.getElementById("header-viewport").innerHTML = headerHtml;


    const sidebarResponse = await fetch(
        "assets/sidebar.html"
    );

    const sidebarHtml = await sidebarResponse.text();

    document.getElementById("sidebar-viewport").innerHTML = sidebarHtml;
}