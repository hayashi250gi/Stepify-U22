"""ユーザーに関するデータベース操作を提供する"""

from database.database import Database


class UserRepository:

    @staticmethod
    def create_user(user_id: int, email: str, display_name: str) -> None:
        """
        ユーザーとデフォルト設定を新規作成する
        """

        with Database.get_connection() as connection:
            with connection.cursor() as cursor:
                # ユーザー作成
                cursor.execute(
                    """
                    INSERT INTO users (user_id, email, display_name)
                    VALUES (%s, %s, %s);
                    """,
                    (user_id, email, display_name),
                )

                # デフォルト設定作成
                cursor.execute(
                    """
                    INSERT INTO user_settings (user_id, appearance, notification)
                    VALUES (%s, %s, %s);
                    """,
                    (user_id, '{"theme": "system"}', '{"enabled": true, "sound": true}'),
                )
            connection.commit()

    @staticmethod
    def get_user(user_id: int) -> dict | None:
        """
        user_idからユーザー取得
        """

        with Database.get_connection() as connection:
            with connection.cursor() as cursor:

                cursor.execute(
                    """
                    SELECT
                        user_id,
                        google_sub,
                        display_name,
                        created_at,
                        updated_at,
                        last_login_at
                    FROM users
                    WHERE user_id = %s;
                    """,
                    (user_id,),
                )

                row = cursor.fetchone()

                if row is None:
                    return None

                return {
                    "user_id": row[0],
                    "google_sub": row[1],
                    "display_name": row[2],
                    "created_at": row[3],
                    "updated_at": row[4],
                    "last_login_at": row[5],
                }

    @staticmethod
    def get_user_by_google_sub(google_sub: str) -> dict | None:
        """
        Googleログイン用
        """

        with Database.get_connection() as connection:
            with connection.cursor() as cursor:

                cursor.execute(
                    """
                    SELECT
                        user_id,
                        google_sub,
                        display_name,
                        created_at,
                        updated_at,
                        last_login_at
                    FROM users
                    WHERE google_sub = %s;
                    """,
                    (google_sub,),
                )

                row = cursor.fetchone()

                if row is None:
                    return None

                return {
                    "user_id": row[0],
                    "google_sub": row[1],
                    "display_name": row[2],
                    "created_at": row[3],
                    "updated_at": row[4],
                    "last_login_at": row[5],
                }

    @staticmethod
    def update_last_login(user_id: int) -> None:
        """
        最終ログイン日時更新
        """

        with Database.get_connection() as connection:
            with connection.cursor() as cursor:

                cursor.execute(
                    """
                    UPDATE users
                    SET
                        last_login_at = CURRENT_TIMESTAMP,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE user_id = %s;
                    """,
                    (user_id,),
                )

            connection.commit()

    @staticmethod
    def update_display_name(user_id: int, display_name: str) -> None:
        """
        表示名を更新する
        """

        with Database.get_connection() as connection:
            with connection.cursor() as cursor:

                cursor.execute(
                    """
                    UPDATE users
                    SET
                        display_name = %s,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE user_id = %s;
                    """,
                    (
                        display_name,
                        user_id,
                    ),
                )

            connection.commit()

    @staticmethod
    def delete_user(user_id: int) -> None:
        """
        ユーザーを削除する
        """

        with Database.get_connection() as connection:
            with connection.cursor() as cursor:

                cursor.execute(
                    """
                    DELETE FROM users
                    WHERE user_id = %s;
                    """,
                    (user_id,),
                )

            connection.commit()
