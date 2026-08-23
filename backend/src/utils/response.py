import json


class Response:

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