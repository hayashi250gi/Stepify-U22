"""schema.sqlを実行してデータベースのスキーマを作成するモジュール。"""


from pathlib import Path

from database.database import Database


class SchemaInitializer:

    @staticmethod
    def create_schema():

        connection = Database.get_connection()

        try:

            sql_file = (
                Path(__file__)
                .parent
                .joinpath("schema.sql")
            )

            with open(sql_file, "r", encoding="utf-8") as file:
                sql = file.read()

            with connection.cursor() as cursor:
                cursor.execute(sql)

            connection.commit()

        finally:
            connection.close()