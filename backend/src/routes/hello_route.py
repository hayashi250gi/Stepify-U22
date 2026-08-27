# ===================================================
# ファイル名: hello_route.py
# 最終更新日: 2026/08/27
# 作成者: 林健太
# 概要: Hello APIのHTTPルートを処理するモジュール
# ===================================================

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