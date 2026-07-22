## テスト用のルート

import json

from services.hello_service import HelloService
from utils.response import Response


class HelloRoute:

    @staticmethod
    def get(handler):

        # テスト用レスポンスを作成
        response = HelloService.get()

        Response.json(
                handler,
                200,
                response
            )