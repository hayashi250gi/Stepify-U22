import json

from services.auth_service import AuthService
from utils.response import Response


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

            Response.json(
                handler,
                400,
                {
                    "message": "Invaled JSON"
                }
            )

            return

        id_token = data.get("id_token")

        if not id_token:

            Response.json(
                handler,
                400,
                {
                    "message": "id_token is required."
                }
            )

            return

        try:

            result = AuthService.login_with_google(
                id_token
            )

        except ValueError as e:

            Response.json(
                handler,
                401,
                {
                    "message": str(e)
                }
            )

            return

        Response.json(
                handler,
                200,
                result
            )