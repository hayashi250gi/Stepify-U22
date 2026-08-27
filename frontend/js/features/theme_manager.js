// ===================================================
// ファイル名: theme_manager.js
// 最終更新日: 2026/08/27
// 作成者: 林健太
// 概要: アプリケーションテーマの切り替えと保存を管理するモジュール
// ===================================================

export const ThemeManager = {
    apply(theme) {
        if (theme === "system") {
            document.documentElement.removeAttribute("data-theme");
        } else {
            document.documentElement.setAttribute("data-theme", theme);
        }
    }
};
