# ===================================================
# ファイル名: user_route.py
# 最終更新日: 2026/08/27
# 作成者: 林健太
# 概要: ユーザー関連APIのHTTPルートを処理するモジュール
# ===================================================

import json

from services.user_service import UserService
from utils.response import Response


class UserRoute:

    @staticmethod
    def get_user(handler, user_id: int):
        """
        GET /api/users/{user_id}
        """

        if handler.user_id != user_id:
            Response.json(handler, 403, {"message": "Forbidden."})
            return
        user = UserService.get_user(user_id)

        if user is None:
            Response.json(handler, 404, {"message": "User not found."})
            return

        Response.json(
            handler,
            200,
            user
        ) 

    @staticmethod
    def update_display_name(handler, user_id: int):
        """
        PUT /api/users/{user_id}
        """

        if handler.user_id != user_id:
            Response.json(handler, 403, {"message": "Forbidden."})
            return

        try:
            content_length = int(
                handler.headers.get("Content-Length", 0)
            )

            body = handler.rfile.read(content_length)

            data = json.loads(body)

        except json.JSONDecodeError:
            ## JSONのデコードに失敗した場合は400 Bad Requestを返す

            Response.json(
                handler,
                400,
                {
                    "message": "Invalid JSON."
                }
            ) 

            return

        display_name = data.get("display_name")

        if display_name is None:
            ### display_nameがリクエストに含まれていない場合は400 Bad Requestを返す

            Response.json(
                handler,
                400,
                {
                    "message": "display_name is required."
                }
            ) 
               
            return

        try:

            UserService.update_display_name(
                user_id=user_id,
                display_name=display_name,
            )

        except ValueError as e:
            ### display_nameのバリデーションに失敗した場合は400 Bad Requestを返す

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

    @staticmethod
    def delete_user(handler, user_id: int):
        """
        DELETE /api/users/{user_id}
        """

        if handler.user_id != user_id:
            Response.json(handler, 403, {"message": "Forbidden."})
            return
        UserService.delete_user(user_id)

        handler.send_response(204)
        handler.end_headers()