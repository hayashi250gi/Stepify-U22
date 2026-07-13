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