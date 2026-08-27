# ===================================================
# ファイル名: server.py
# 最終更新日: 2026/08/27
# 作成者: 林健太
# 概要: HTTPサーバーを起動するモジュール
# ===================================================

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