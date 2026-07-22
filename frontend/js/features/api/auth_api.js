import { ApiClient } from "./api_client.js";

// バックエンドの認証APIへアクセスするためのクライアント。
export class AuthApi {
    // Google IDトークンを送信して、JWT付きの認証結果を受け取る。
    // 認証APIはトークン不要のため、skipAuth でリクエストする。
    static async loginWithGoogle(idToken) {
        return ApiClient.postPublic("/api/auth/google", {
            id_token: idToken,
        });
    }
}