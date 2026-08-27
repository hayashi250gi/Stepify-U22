# ===================================================
# ファイル名: settings_route.py
# 最終更新日: 2026/08/27
# 作成者: 林健太
# 概要: ユーザー設定APIのHTTPルートを処理するモジュール
# ===================================================

import json

from services.settings_service import SettingsService
from utils.response import Response


class SettingsRoute:

    @staticmethod
    def get_settings(handler, user_id: int):
        """
        GET /api/users/{user_id}/settings
        """

        if handler.user_id != user_id:
            Response.json(handler, 403, {"message": "Forbidden."})
            return
        settings = SettingsService.get_settings(user_id)

        if settings is None:
            Response.json(
                handler,
                404,
                {"message": "Settings not found."}
            )
            return

        Response.json(
                handler,
                200,
                settings
            )

    @staticmethod
    def update_settings(handler, user_id: int):
        """
        PUT /api/users/{user_id}/settings
        """

        if handler.user_id != user_id:
            Response.json(handler, 403, {"message": "Forbidden."})
            return

        try:
            content_length = int(
                handler.headers.get("Content-Length", 0)
            )

            body = handler.rfile.read(content_length)

            settings = json.loads(body)

        except json.JSONDecodeError:

            Response.json(
                handler,
                400,
                {
                    "message": "Invalid JSON."
                }
            )

            return

        try:

            SettingsService.update_settings(
                user_id=user_id,
                settings=settings,
            )

        except ValueError as e:

            Response.json(
                handler,
                400,
                {
                    "message": str(e)
                }
            )

            return

        handler.send_response(204)
        handler.end_headers()