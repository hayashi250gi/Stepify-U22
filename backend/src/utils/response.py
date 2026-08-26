import json
from urllib.parse import quote


class Response:

    @staticmethod
    def redirect_with_cookie(handler, location: str, auth_result: dict):
        payload = quote(json.dumps({
            "isLoggedIn": True,
            "user": auth_result["user"],
            "token": auth_result["token"],
        }, default=str))

        handler.send_response(303)
        handler.send_header("Location", location)
        handler.send_header(
            "Set-Cookie",
            f"stepify-auth={payload}; Path=/; Max-Age=86400; SameSite=Lax; Secure",
        )
        handler.end_headers()

    @staticmethod
    def json(handler, status_code: int, data, headers=None):

        """
        JSONレスポンスを返す
        strに直してから
        """

        handler.send_response(status_code)
        handler.send_header(
            "Content-Type",
            "application/json; charset=utf-8"
        )
        for name, value in (headers or {}).items():
            handler.send_header(name, value)
        handler.end_headers()

        handler.wfile.write(
            json.dumps(
                data,
                default=str
            ).encode("utf-8")
        )