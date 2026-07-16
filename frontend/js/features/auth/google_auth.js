import { AuthApi } from "../api/auth_api.js";
import { Config } from "../../config.js";

export class GoogleAuth {

    /**
     * Google Identity Services を初期化する
     * GoogleClientId は Config.initialize() で取得する必要があるため、Config.initialize() の後に呼び出すこと
     */
    static async initialize() {

        await new Promise((resolve) => {
            if (window.google && window.google.accounts) {
                resolve();
            } else {
                const script = document.createElement('script');
                script.src = 'https://accounts.google.com/gsi/client';
                script.onload = resolve;
                document.head.appendChild(script);
            }
        });

        google.accounts.id.initialize({
            client_id: Config.googleClientId,
            callback: GoogleAuth.handleCredentialResponse,
        });

    }

    /**
     * Googleログインボタンを描画する
     */
    static renderButton(elementId) {

        google.accounts.id.renderButton(
            document.getElementById(elementId),
            {
                theme: "outline",
                size: "large",
                width: "240",
            }
        );

    }

    /**
     * Googleログイン成功時
     */
    static async handleCredentialResponse(response) {

        try {

            const result = await AuthApi.loginWithGoogle(
                response.credential
            );

            console.log(result);

        } catch (error) {

            console.error(error);

        }

    }

}