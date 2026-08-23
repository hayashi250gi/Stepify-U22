"""タスク履歴を管理するリポジトリモジュール。"""

from database.database import Database

class TaskHistoryRepository:
    @staticmethod
    def save_history(task_id: int, subtask_id: int, action: str, started_at=None, finished_at=None, duration_seconds=None):
        """タスクまたはサブタスクの実行履歴を保存する。"""
        with Database.get_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute("""
                    INSERT INTO task_histories (
                        task_id, subtask_id, action, started_at, finished_at,
                        duration_seconds, created_at
                    )
                    VALUES (%s, %s, %s, %s, %s, %s, CURRENT_TIMESTAMP);
                """, (task_id, subtask_id, action, started_at, finished_at, duration_seconds))
            connection.commit()
