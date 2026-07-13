// ルーター モジュール 画面要素を読み込む機能モジュール

// ルーター初期化
export function initializeRouter() {
    setupSidebarNavigation();

    navigate("mainmenu");
}

// ページ遷移処理
export async function navigate(pageName) {
    const response = await fetch(
        `contents/${pageName}.html`
    );

    const html = await response.text();

    document.getElementById("content-viewport")
        .innerHTML = html;

    try {
        const page = await import(`/js/pages/${pageName}.js`);

        if (page.render) {
            page.render();
        }
    } catch (err) {
        console.error(`${pageName}.js がありません`, err);
    }
}

// サイドバーのナビゲーションボタンのクリックイベントを設定
function setupSidebarNavigation() {

    const sidebar =
        document.getElementById("sidebar-viewport");

    sidebar.addEventListener("click", (event) => {

        const button =
            event.target.closest("[data-view]");

        if (!button) {
            return;
        }

        const pageName =
            button.dataset.view;

        navigate(pageName);
    });
}