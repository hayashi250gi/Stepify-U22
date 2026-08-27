// ===================================================
// ファイル名: header.js
// 最終更新日: 2026/08/27
// 作成者: 林健太
// 概要: ヘッダーコンポーネントを生成・制御するモジュール
// ===================================================

// ヘッダーを表示するモジュール

import { AuthState } from "../auth/auth_state.js";
import { AppStorage } from "../storage/app_storage.js?v=20260822-17";

// ヘッダーのメニュートグルボタンとサイドバーの開閉状態を管理するモジュール。
export class Header {
    static toggleButton = null;
    static sidebar = null;
    static runningTaskInterval = null;

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

        Header.toggleButton.addEventListener("click", (event) => {
            event.stopPropagation();
            const isOpen = Header.sidebar.classList.toggle("open");
            Header.updateToggleButtonState(isOpen);
        });

        document.addEventListener("click", (event) => {
            if (!Header.sidebar.classList.contains("open")) return;
            if (Header.sidebar.contains(event.target) || Header.toggleButton.contains(event.target)) return;
            Header.closeMenu();
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
        if (this.runningTaskInterval) {
            clearInterval(this.runningTaskInterval);
            this.runningTaskInterval = null;
        }
        const existingEl = document.getElementById("header-running-task");
        if (existingEl) existingEl.remove();

        const runningTask = await AppStorage.loadGuestData("running_task");
        if (!runningTask) return;

        const headerBar = document.querySelector(".header-bar");
        if (!headerBar) return;

        const runningEl = document.createElement("div");
        runningEl.id = "header-running-task";
        runningEl.className = "header-running-task";
        runningEl.innerHTML = `
            <a href="/execute?task_id=${runningTask.taskId}&subtask_id=${runningTask.subtaskId}&title=${encodeURIComponent(runningTask.title)}&minutes=${runningTask.minutes}&start_time=${runningTask.startTime}"
               class="header-running-task-link">
                <span class="header-running-task-title">実行中: ${runningTask.title}</span>
                <span id="header-timer" class="header-running-task-timer">--:--</span>
            </a>
        `;
        headerBar.insertBefore(runningEl, headerBar.querySelector(".header-auth"));

        const updateHeaderTimer = () => {
            const elapsed = Math.floor((Date.now() - new Date(runningTask.startTime).getTime()) / 1000);
            const remaining = Math.max(0, runningTask.minutes * 60 - elapsed);
            const m = Math.floor(remaining / 60);
            const s = remaining % 60;
            const timerEl = document.getElementById("header-timer");
            if (timerEl) timerEl.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        };
        updateHeaderTimer();
        this.runningTaskInterval = setInterval(updateHeaderTimer, 1000);
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