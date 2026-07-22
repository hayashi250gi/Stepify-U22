// URL 操作ユーティリティ。
// SPA用のページ遷移は廃止し、window.location.href による画面遷移に統一する。

export class Router {

    /**
     * 現在のURLのクエリパラメータを URLSearchParams として返す。
     * @returns {URLSearchParams}
     */
    static getQueryParams() {
        return new URLSearchParams(window.location.search);
    }

    /**
     * 指定したページへ遷移する。
     * @param {string} pageName - "task_list" など（.html は自動補完）
     */
    static navigate(pageName) {
        window.location.href = `/${pageName}.html`;
    }
}