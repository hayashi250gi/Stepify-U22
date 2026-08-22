"""タスク履歴を管理するリポジトリモジュール。"""

from database.database import Database

class TaskHistoryRepository:
    @staticmethod
    def save_history(task_id: int, subtask_id: int, action: str):
        """タスクまたはサブタスクの実行履歴を保存する。"""
        with Database.get_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute("""
                    INSERT INTO task_histories (task_id, subtask_id, action, created_at)
                    VALUES (%s, %s, %s, CURRENT_TIMESTAMP);
                """, (task_id, subtask_id, action))
            connection.commit()
