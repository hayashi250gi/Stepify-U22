"""認証"""

import json

from services.auth_service import AuthService


class AuthRoute:

    @staticmethod
    def login_with_google(handler):

        try:

            content_length = int(
                handler.headers.get("Content-Length", 0)
            )

            body = handler.rfile.read(content_length)

            data = json.loads(body)

        except json.JSONDecodeError:

            handler.send_response(400)
            handler.end_headers()
            return

        id_token = data.get("id_token")

        if id_token is None:

            handler.send_response(400)
            handler.end_headers()
            return

        try:

            user = AuthService.login_with_google(id_token)

        except ValueError as e:

            handler.send_response(401)
            handler.end_headers()

            handler.wfile.write(
                json.dumps({
                    "message": str(e)
                }).encode()
            )

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