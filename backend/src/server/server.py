"""HTTPサーバを起動するためのコード"""


from http.server import ThreadingHTTPServer

from config.config import Config
from server.handler import RequestHandler


def run():

    # ThreadingHTTPServer を使用し、リクエストごとにスレッドを割り当てて並行処理できるようにする
    # (HTTPServerのままだと1リクエストずつ直列処理され、重い処理中は他のリクエストがブロックされる)
    server = ThreadingHTTPServer(

        (Config.HOST, Config.PORT),

        RequestHandler

    )

    server.daemon_threads = True

    print(
        f"Server started : {Config.HOST}:{Config.PORT}"
    )

    server.serve_forever()