import json


class Response:

    @staticmethod
    def json(handler, status_code: int, data):

        """
        JSONレスポンスを返す
        strに直してから
        """

        handler.send_response(status_code)
        handler.send_header(
            "Content-Type",
            "application/json; charset=utf-8"
        )
        handler.end_headers()

        handler.wfile.write(
            json.dumps(
                data,
                default=str
            ).encode("utf-8")
        )