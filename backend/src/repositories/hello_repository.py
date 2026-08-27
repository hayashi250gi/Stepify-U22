# ===================================================
# ファイル名: hello_repository.py
# 最終更新日: 2026/08/27
# 作成者: 林健太
# 概要: Helloデータのデータベース操作を提供するリポジトリ
# ===================================================

"""テスト用のリポジトリモジュール。"""

from database.database import Database


class HelloRepository:

    @staticmethod
    def get_database_status():

        with Database.get_connection() as connection:

            with connection.cursor() as cursor:

                cursor.execute("SELECT 1;")

                result = cursor.fetchone()

                return result[0]