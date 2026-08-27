# ===================================================
# ファイル名: settings_repository.py
# 最終更新日: 2026/08/27
# 作成者: 林健太
# 概要: ユーザー設定のデータベース操作を提供するリポジトリ
# ===================================================

import json

from database.database import Database


class SettingsRepository:

    @staticmethod
    def get_settings(user_id: int) -> dict | None:
        """
        ユーザー設定を取得する
        データベースから取り出し、JSONに変換して返す
        存在しない場合はデフォルト値を挿入して返す
        """
        default_settings = {
            "appearance": {"theme": "system"},
            "notification": {"enabled": True, "sound": True}
        }

        with Database.get_connection() as conn:
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
                    # レコードがない場合はデフォルト値を挿入
                    cur.execute(
                        """
                        INSERT INTO settings (user_id, settings)
                        VALUES (%s, %s)
                        """,
                        (user_id, json.dumps(default_settings))
                    )
                    conn.commit()
                    return default_settings

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

        with Database.get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO settings (user_id, settings)
                    VALUES (%s, %s)
                    ON CONFLICT (user_id) DO UPDATE SET
                        settings = EXCLUDED.settings,
                        updated_at = CURRENT_TIMESTAMP
                    """,
                    (
                        user_id,
                        json.dumps(settings),
                    )
                )

            conn.commit()