// ===================================================
// ファイル名: auth_api.js
// 最終更新日: 2026/08/27
// 作成者: 林健太
// 概要: 認証関連APIへのリクエストを提供するモジュール
// ===================================================

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