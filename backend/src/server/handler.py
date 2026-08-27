# ===================================================
# ファイル名: handler.py
# 最終更新日: 2026/08/27
# 作成者: 林健太
# 概要: HTTPリクエストとレスポンスを処理するハンドラー
# ===================================================

"""リクエストハンドラを定義するモジュール。"""

from http.server import BaseHTTPRequestHandler

from routes.router import Router


class RequestHandler(BaseHTTPRequestHandler):

    def do_GET(self):
        Router.route(self)
    
    def do_POST(self):
        Router.route(self)

    def do_PUT(self):
        Router.route(self)

    def do_DELETE(self):
        Router.route(self)

