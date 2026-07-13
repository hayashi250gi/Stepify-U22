"""schema.sqlを実行してデータベースのスキーマを作成するモジュール。"""


from pathlib import Path

from database.database import Database


class SchemaInitializer:

    @staticmethod
    def create_schema():
        """schema.sqlを実行してデータベースのスキーマを作成する。"""

        schema_path = (
            Path(__file__)
            .parent.parent
            / "sql"
            / "schema.sql"
        )

        sql = schema_path.read_text(
            encoding="utf-8"
        )

        with Database.get_connection() as connection:

            with connection.cursor() as cursor:

                cursor.execute(sql)

            connection.commit()

        print("Database initialized.")