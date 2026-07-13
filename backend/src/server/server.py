"""HTTPサーバを起動するためのコード"""


from http.server import HTTPServer

from config.config import Config
from server.handler import RequestHandler


def run():

    server = HTTPServer(

        (Config.HOST, Config.PORT),

        RequestHandler

    )

    print(
        f"Server started : {Config.HOST}:{Config.PORT}"
    )

    server.serve_forever()