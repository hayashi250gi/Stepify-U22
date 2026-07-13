"""リクエストハンドラを定義するモジュール。"""

from http.server import BaseHTTPRequestHandler

from routes.router import Router


class RequestHandler(BaseHTTPRequestHandler):

    def do_GET(self):

        Router.route(self)