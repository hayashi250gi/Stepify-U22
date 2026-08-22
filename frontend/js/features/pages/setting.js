import { navigate } from "/js/features/router/router.js";
import { AuthState } from "/js/features/auth/auth_state.js";
import { AppStorage } from "/js/features/storage/app_storage.js";
import { ThemeManager } from "/js/features/theme_manager.js";
import { fetchSettings, updateSettings } from "/js/features/api.js";

const SETTINGS_KEY = "user_settings";
const DEFAULT_SETTINGS = {
    appearance: { theme: "system" },
    notification: { enabled: true, sound: true }
};

export async function render() {
    const contentView = document.getElementById("content-viewport");
    if (!document.getElementById("settings-form")) {
        contentView.innerHTML = `
            <div class="view-container">
                <div class="card setting-card" id="settings-form">
                    <h2 class="card-title">アプリ設定</h2>
                    <div class="input-group">
                        <label>テーマ</label>
                        <select id="theme-setting" class="input-control">
                            <option value="system">システム設定</option>
                            <option value="light">ライトモード</option>
                            <option value="dark">ダークモード</option>
                        </select>
                    </div>
                    <div class="input-group">
                        <label><input type="checkbox" id="notification-enabled"> 通知を有効にする</label>
                    </div>
                    <div class="input-group">
                        <label><input type="checkbox" id="notification-sound"> サウンドを有効にする</label>
                    </div>
                    <button id="save-settings-btn" class="btn btn-primary">設定を保存</button>
                    <button id="back-settings-btn" class="btn btn-secondary">戻る</button>
                    <div id="status-message" class="status-message" style="display:none; margin-top:10px;"></div>
                </div>
            </div>
        `;
    }
    const themeSelect = document.getElementById("theme-setting");
    const enabledCheckbox = document.getElementById("notification-enabled");
    const soundCheckbox = document.getElementById("notification-sound");
    const saveButton = document.getElementById("save-settings-btn");
    const statusMessage = document.getElementById("status-message");
    const backButton = document.getElementById("back-settings-btn");

    if (!themeSelect || !enabledCheckbox || !soundCheckbox || !saveButton || !statusMessage) {
        console.error("設定画面の要素が見つかりません。");
        return;
    }

    if (backButton) {
        backButton.addEventListener("click", () => navigate("/tasks"));
    }

    const isLoggedIn = AuthState.isLoggedIn();
    const userId = isLoggedIn ? AuthState.loadAuthState().user.user_id : null;

    function showMessage(text, isError = false) {
        statusMessage.textContent = text;
        statusMessage.className = `status-message ${isError ? 'error' : 'success'}`;
        statusMessage.style.display = "block";
        
        setTimeout(() => {
            statusMessage.style.display = "none";
        }, 3000);
    }

    // 1. 設定の読み込み
    async function loadSettings() {
        let settings = null;

        if (isLoggedIn) {
            try {
                settings = await fetchSettings(userId);
            } catch (e) {
                console.error("APIからの取得失敗", e);
                // エラー時はデフォルトを使用
                settings = DEFAULT_SETTINGS;
            }
        } else {
            settings = await AppStorage.loadGuestData(SETTINGS_KEY) || DEFAULT_SETTINGS;
        }

        themeSelect.value = settings.appearance.theme;
        enabledCheckbox.checked = settings.notification.enabled;
        soundCheckbox.checked = settings.notification.sound;

        // テーマも適用
        ThemeManager.apply(settings.appearance.theme);
}

    // 2. 設定の保存
    saveButton.addEventListener("click", async () => {
        const payload = {
            appearance: { theme: themeSelect.value },
            notification: {
                enabled: enabledCheckbox.checked,
                sound: soundCheckbox.checked
            }
        };

        ThemeManager.apply(payload.appearance.theme);

        if (isLoggedIn) {
            try {
                await updateSettings(userId, payload);
                showMessage("設定を保存しました");
            } catch (e) {
                showMessage("保存に失敗しました: " + e.message, true);
            }
        } else {
            await AppStorage.saveGuestData(SETTINGS_KEY, payload);
            showMessage("設定を保存しました");
        }
    });

    loadSettings();
}

