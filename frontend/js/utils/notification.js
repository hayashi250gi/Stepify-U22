// ===================================================
// ファイル名: notification.js
// 最終更新日: 2026/08/27
// 作成者: 林健太
// 概要: 通知メッセージの表示を補助するユーティリティ
// ===================================================

// 通知とサウンド再生のユーティリティ

export class NotificationManager {
    static async requestPermission() {
        if ("Notification" in window) {
            await Notification.requestPermission();
        }
    }

    static show(title, message) {
        if ("Notification" in window && Notification.permission === "granted") {
            new Notification(title, { body: message });
        }
    }

    static playCompleteSound() {
        const audio = new Audio("/assets/sounds/task_complete.mp3");
        audio.play().catch(e => console.error("音声再生に失敗しました:", e));
    }
}
