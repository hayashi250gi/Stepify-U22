// ログインページ

import { Router } from "../router/router.js";
import { GoogleAuth } from "../auth/google_auth.js";

export function render() {
    const clientId = '532692673300-p828sccd84dkpcdkbijme799ujit1so0.apps.googleusercontent.com';
    const buttonContainer = document.getElementById('google-login-button');
    const cancelButton = document.getElementById('login-cancel-btn');

    if (cancelButton) {
        cancelButton.addEventListener('click', () => {
            Router.navigate("task_input");
        });
    }

    // Googleログインボタンを描画
    buttonContainer.innerHTML = GoogleAuth.renderButton('google-login-button');
}