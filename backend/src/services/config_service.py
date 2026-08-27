# ===================================================
# ファイル名: config_service.py
# 最終更新日: 2026/08/27
# 作成者: 林健太
# 概要: アプリケーション設定情報を提供するサービス
# ===================================================

# フロントに公開可能な設定を返すサービス

from config.config import Config

class ConfigService:
    @staticmethod
    def get_public_config() -> dict:
        return {
            "GOOGLE_CLIENT_ID": Config.GOOGLE_CLIENT_ID,
        }