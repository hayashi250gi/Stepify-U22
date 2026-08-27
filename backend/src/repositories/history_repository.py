# ===================================================
# ファイル名: history_repository.py
# 最終更新日: 2026/08/27
# 作成者: 林健太
# 概要: 履歴データのデータベース操作を提供するリポジトリ
# ===================================================

"""履歴を管理するリポジトリモジュール。"""

from database.database import Database

class HistoryRepository:
    @staticmethod
    def create_history(task_id, subtask_id, action):
        with Database.get_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute("""
                    INSERT INTO task_histories (task_id, subtask_id, action)
                    VALUES (%s, %s, %s)
                """, (task_id, subtask_id, action))
            connection.commit()
