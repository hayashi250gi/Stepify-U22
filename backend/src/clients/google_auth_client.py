# ===================================================
# ファイル名: google_auth_client.py
# 最終更新日: 2026/08/27
# 作成者: 林健太
# 概要: Google認証トークンを検証するクライアント
# ===================================================

from google.auth.transport import requests
from google.oauth2 import id_token

from config.config import Config


class GoogleAuthClient:

    @staticmethod
    def verify_id_token(token: str) -> dict:
        """
        Google ID Token を検証し、
        ユーザー情報を返す。

        Returns:
            {
                "sub": "...",
                "name": "...",
                "email": "...",
                ...
            }

        Raises:
            ValueError
        """

        try:

            return id_token.verify_oauth2_token(
                token,
                requests.Request(),
                Config.GOOGLE_CLIENT_ID
            )

        except Exception as e:

            raise ValueError(
                f"Invalid Google ID Token: {e}"
            )