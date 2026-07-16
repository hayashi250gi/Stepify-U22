import json

from database.database import Database


class SettingsRepository:

    @staticmethod
    def get_settings(user_id: int) -> dict | None:
        """
        ユーザー設定を取得する
        """

        with Database.create_pool().connection() as conn:
            with conn.cursor() as cur:

                cur.execute(
                    """
                    SELECT settings
                    FROM settings
                    WHERE user_id = %s
                    """,
                    (user_id,)
                )

                row = cur.fetchone()

                if row is None:
                    return None

                settings = row[0]

                if isinstance(settings, str):
                    settings = json.loads(settings)

                return settings

    @staticmethod
    def update_settings(
        user_id: int,
        settings: dict,
    ) -> None:
        """
        ユーザー設定を更新する
        """

        with Database.create_pool().connection() as conn:
            with conn.cursor() as cur:

                cur.execute(
                    """
                    UPDATE settings
                    SET
                        settings = %s,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE user_id = %s
                    """,
                    (
                        json.dumps(settings),
                        user_id,
                    )
                )

            conn.commit()