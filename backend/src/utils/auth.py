# ===================================================
# ファイル名: auth.py
# 最終更新日: 2026/08/27
# 作成者: 林健太
# 概要: 認証情報の検証を補助するユーティリティ
# ===================================================

from services.jwt_service import JwtService
from utils.response import Response


class Auth:

    @staticmethod
    def authenticate(handler) -> bool:

        authorization = handler.headers.get(
            "Authorization"
        )

        if authorization is None:

            Response.json(
                handler,
                401,
                {
                    "message": "Authorization header is required."
                }
            )

            return False

        if not authorization.startswith("Bearer "):

            Response.json(
                handler,
                401,
                {
                    "message": "Invalid Authorization header."
                }
            )

            return False

        token = authorization.removeprefix(
            "Bearer "
        )

        try:

            payload = JwtService.verify_token(
                token
            )

        except ValueError as e:

            Response.json(
                handler,
                401,
                {
                    "message": str(e)
                }
            )

            return False

        handler.user_id = payload["user_id"]

        return True