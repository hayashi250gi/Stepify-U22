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
