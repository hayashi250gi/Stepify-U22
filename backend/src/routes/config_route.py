# ===================================================
# ファイル名: config_route.py
# 最終更新日: 2026/08/27
# 作成者: 林健太
# 概要: 設定情報APIのHTTPルートを処理するモジュール
# ===================================================

import json

from services.config_service import ConfigService
from utils.response import Response

class ConfigRoute:

    @staticmethod
    def get_config(handler):

        config = ConfigService.get_public_config()

        Response.json(
                handler,
                200,
                config
            )