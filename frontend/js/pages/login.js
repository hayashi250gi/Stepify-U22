export function render() {
    const clientId = '532692673300-p828sccd84dkpcdkbijme799ujit1so0.apps.googleusercontent.com';
    const buttonContainer = document.getElementById('google-login-button');


    // Google Sign-Inのコールバック関数
    function handleCredentialResponse(response) {
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

        // ここでサーバーにトークンを送信して認証処理を行う
        // 例: fetch('/api/auth/google', { method: 'POST', body: JSON.stringify({ token: response.credential }) })
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