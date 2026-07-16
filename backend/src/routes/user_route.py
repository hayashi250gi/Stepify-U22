import json

from services.user_service import UserService


class UserRoute:

    @staticmethod
    def get_user(handler, user_id: int):
        """
        GET /api/users/{user_id}
        """

        user = UserService.get_user(user_id)

        if user is None:
            handler.send_response(404)
            handler.end_headers()
            return

        handler.send_response(200)
        handler.send_header(
            "Content-Type",
            "application/json",
        )
        handler.end_headers()

        handler.wfile.write(
            json.dumps(user, default=str).encode()
        )

    @staticmethod
    def update_display_name(handler, user_id: int):
        """
        PUT /api/users/{user_id}
        """

        try:
            content_length = int(
                handler.headers.get("Content-Length", 0)
            )

            body = handler.rfile.read(content_length)

            data = json.loads(body)

        except json.JSONDecodeError:
            ## JSONのデコードに失敗した場合は400 Bad Requestを返す

            handler.send_response(400)
            handler.send_header("Content-Type", "application/json")
            handler.end_headers()

            handler.wfile.write(json.dumps({
                "message": "Invalid JSON."
            }).encode())

            return

        display_name = data.get("display_name")

        if display_name is None:
            ### display_nameがリクエストに含まれていない場合は400 Bad Requestを返す

            handler.send_response(400)
            handler.send_header("Content-Type", "application/json")
            handler.end_headers()

            handler.wfile.write(json.dumps({
                "message": "display_name is required."
            }).encode())

            return

        try:

            UserService.update_display_name(
                user_id=user_id,
                display_name=display_name,
            )

        except ValueError as e:
            ### display_nameのバリデーションに失敗した場合は400 Bad Requestを返す

            handler.send_response(400)
            handler.send_header("Content-Type", "application/json")
            handler.end_headers()

            handler.wfile.write(json.dumps({
                "message": str(e)
            }).encode())

            return

        handler.send_response(204)
        handler.end_headers()

    @staticmethod
    def delete_user(handler, user_id: int):
        """
        DELETE /api/users/{user_id}
        """

        UserService.delete_user(user_id)

        handler.send_response(204)
        handler.end_headers()