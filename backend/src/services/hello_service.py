# ===================================================
# ファイル名: hello_service.py
# 最終更新日: 2026/08/27
# 作成者: 林健太
# 概要: Hello機能のビジネスロジックを提供するサービス
# ===================================================

"""テスト用のサービスモジュール。"""

from repositories.hello_repository import HelloRepository


class HelloService:

    @staticmethod
    def get():

        db = HelloRepository.get_database_status()

        return {
            "message": "backend ok",
            "db": db
        }