// 画面表示モジュール

export class Router {

    // ルーター初期化
    static initialize() {
        Router.setupSidebarNavigation();

        Router.navigate("task_input");
    }

    // ページ遷移処理
    static async navigate(pageName) {
        const response = await fetch(
            `contents/${pageName}.html`
        );

        const html = await response.text();

        document.getElementById("content-viewport")
            .innerHTML = html;

        try {
            const page = await import(`../pages/${pageName}.js`);

            if (page.render) {
                page.render();
            }
        } catch (err) {
            console.error(`${pageName}.js がありません`, err);
        }
    }

    // サイドバーのナビゲーションボタンのクリックイベントを設定
    static setupSidebarNavigation() {

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

            Router.navigate(pageName);
        });
    }
}