## テスト用のルート

import json

from services.hello_service import HelloService


class HelloRoute:

    @staticmethod
    def get(handler):

        # テスト用レスポンスを作成
        response = HelloService.get()

        # HTTPレスポンスを返す
        handler.send_response(200)

        # HTTPヘッダーを設定
        handler.send_header(
            "Content-Type",
            "application/json"
        )

        # HTTPヘッダーの送信を終了
        handler.end_headers()

        # HTTPレスポンスボディを送信
        handler.wfile.write(
            json.dumps(response).encode()
        )