// ===================================================
// ファイル名: state.js
// 最終更新日: 2026/08/27
// 作成者: 林健太
// 概要: アプリケーションの共有状態を管理するモジュール
// ===================================================

// frontend/js/features/state.js
export const appState = {
    get currentTaskTitle() { return localStorage.getItem('currentTaskTitle') || ""; },
    set currentTaskTitle(val) { localStorage.setItem('currentTaskTitle', val); },

    get currentTaskDetail() { return localStorage.getItem('currentTaskDetail') || ""; },
    set currentTaskDetail(val) { localStorage.setItem('currentTaskDetail', val); },

    get decompositionResult() {
        const data = localStorage.getItem('decompositionResult');
        return data ? JSON.parse(data) : [];
    },
    set decompositionResult(val) {
        localStorage.setItem('decompositionResult', JSON.stringify(val));
    },

    reset() {
        localStorage.clear(); // または各キーを個別に削除
    }
};