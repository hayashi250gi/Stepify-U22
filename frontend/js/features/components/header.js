// ヘッダーを表示するモジュール

import { AuthState } from "../auth/auth_state.js";
import { AppStorage } from "../storage/app_storage.js";

// ヘッダーのメニュートグルボタンとサイドバーの開閉状態を管理するモジュール。
export class Header {
    static toggleButton = null;
    static sidebar = null;

    static async initialize() {

        const headerResponse = await fetch(
            "/assets/header.html"
        );

        const headerHtml = await headerResponse.text();

        document.getElementById("header-viewport").innerHTML = headerHtml;

        // 同期状態の表示を追加
        this.renderAuthStatus();

        await this.renderRunningTask(); // 実行中タスクの表示を追加

        Header.toggleButton = document.querySelector(
            ".menu-toggle"
        );
        Header.sidebar = document.getElementById("sidebar-viewport");

        if (!Header.toggleButton || !Header.sidebar) {
            return;
        }

        Header.updateToggleButtonState(false);

        Header.toggleButton.addEventListener("click", () => {
            const isOpen = Header.sidebar.classList.toggle("open");
            Header.updateToggleButtonState(isOpen);
        });
    }

    static renderAuthStatus() {
        const authStatusEl = document.getElementById("auth-status");
        if (!authStatusEl) return;

        const isLoggedIn = AuthState.isLoggedIn();
        authStatusEl.innerHTML = isLoggedIn
            ? '<div class="status-indicator"><span class="status-dot status-online"></span>オンライン</div>'
            : '<div class="status-indicator"><span class="status-dot status-offline"></span>オフライン</div>';
    }

    static async renderRunningTask() {
        const runningTask = await AppStorage.loadGuestData("running_task");
        if (!runningTask) return;

        const headerBar = document.querySelector(".header-bar");
        const existingEl = document.getElementById("header-running-task");
        if (existingEl) existingEl.remove();

        const runningEl = document.createElement("div");
        runningEl.id = "header-running-task";
        runningEl.className = "header-running-task";
        runningEl.innerHTML = `
            <a href="/tasks/execute?task_id=${runningTask.taskId}&subtask_id=${runningTask.subtaskId}&title=${encodeURIComponent(runningTask.title)}&minutes=${runningTask.minutes}&start_time=${runningTask.startTime}"
               style="color: white; text-decoration: none; display: flex; align-items: center; gap: 10px; padding: 5px 15px; background: #333; border-radius: 20px;">
                <span>実行中: ${runningTask.title}</span>
                <span id="header-timer">--:--</span>
            </a>
        `;
        headerBar.insertBefore(runningEl, headerBar.querySelector(".header-auth"));

        setInterval(() => {
            const elapsed = Math.floor((Date.now() - new Date(runningTask.startTime).getTime()) / 1000);
            const remaining = Math.max(0, runningTask.minutes * 60 - elapsed);
            const m = Math.floor(remaining / 60);
            const s = remaining % 60;
            const timerEl = document.getElementById("header-timer");
            if (timerEl) timerEl.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        }, 1000);
    }

    static updateToggleButtonState(isOpen) {
        if (!Header.toggleButton) {
            return;
        }
        Header.toggleButton.setAttribute(
            "aria-expanded",
            String(isOpen)
        );
        Header.toggleButton.setAttribute(
            "aria-label",
            isOpen ? "メニューを閉じる" : "メニューを開く"
        );
    }

    static closeMenu() {
        if (!Header.sidebar || !Header.toggleButton) {
            return;
        }

        if (!Header.sidebar.classList.contains("open")) {
            return;
        }

        Header.sidebar.classList.remove("open");
        Header.updateToggleButtonState(false);
    }
}