import { setLoginUser } from "../state.js";
import { renderAuthStatus } from "../layout.js";
import { loginWithBackend } from "../api.js";

export function render() {
    const clientId = '532692673300-p828sccd84dkpcdkbijme799ujit1so0.apps.googleusercontent.com';
    const buttonContainer = document.getElementById('google-login-button');
    const cancelButton = document.getElementById('login-cancel-btn');

    if (cancelButton) {
        cancelButton.addEventListener('click', () => {
            window.navigate?.('mainmenu');
        });
    }


    // Google Sign-Inのコールバック関数
async function handleCredentialResponse(response) {
        console.log('Google Sign-In response:', response);

        // JWTをデコードしてユーザー情報を取得  
        const responsePayload = decodeJWT(response.credential);
        console.log("Decoded JWT ID token fields:");
        console.log("  Full Name: " + responsePayload.name);
        console.log("  Given Name: " + responsePayload.given_name);
        console.log("  Family Name: " + responsePayload.family_name);
        console.log("  Unique ID: " + responsePayload.sub);
        console.log("  Profile image URL: " + responsePayload.picture);
        console.log("  Email: " + responsePayload.email);

        const user = {
            name: responsePayload.name,
            email: responsePayload.email,
            picture: responsePayload.picture,
            sub: responsePayload.sub
        };

        try {
            const backendResult = await loginWithBackend(response.credential, user, 'dev-client-secret');
            console.log("Backend login result:", backendResult);

            if (backendResult.success) {
                setLoginUser(backendResult.user);
                renderAuthStatus();
            }
        } catch (error) {
            console.error("Backend login failed:", error);
        }
    }

    // Google Sign-Inの初期化
    function initializeGoogleSignIn() {
        if (!buttonContainer) {
            return;
        }

        if (!window.google?.accounts?.id) {
            console.warn('Google Identity Services が読み込まれていません。');
            return;
        }

        window.google.accounts.id.initialize({
            client_id: clientId,
            callback: handleCredentialResponse
        });

        window.google.accounts.id.renderButton(buttonContainer, {
            theme: 'outline',
            size: 'large',
            text: 'signin_with',
            shape: 'rectangular',
            logo_alignment: 'left'
        });
    }

    if (window.google?.accounts?.id) {
        initializeGoogleSignIn();
    } else {
        const googleScript = document.querySelector('script[src*="accounts.google.com/gsi/client"]');

        if (googleScript) {
            googleScript.addEventListener('load', initializeGoogleSignIn, { once: true });
        }
    }
}