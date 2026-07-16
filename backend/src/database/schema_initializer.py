"""schema.sqlを実行してデータベースのスキーマを作成するモジュール。"""


from pathlib import Path

from database.database import Database


class SchemaInitializer:

    @staticmethod
    def create_schema():

        with Database.get_connection() as connection:

            sql_file = "/app/src/database/sql/schema.sql"

            with open(sql_file, "r", encoding="utf-8") as file:
                sql = file.read()

            with connection.cursor() as cursor:
                cursor.execute(sql)
            
            # withブロックを抜ける際、またはブロック内で明示的にコミットする
            connection.commit()
            
        # with ブロックを抜けた時点で、接続は自動的にプールへ返却（リリース）される