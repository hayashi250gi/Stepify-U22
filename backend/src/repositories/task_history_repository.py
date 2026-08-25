"""タスク履歴を管理するリポジトリモジュール。"""

from database.database import Database

class TaskHistoryRepository:
    @staticmethod
    def get_recent_history(user_id: int):
        """ユーザーの直近一週間のタスク実行履歴を取得する。"""
        with Database.get_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute("""
                          SELECT h.history_id, h.task_id, t.title, s.title, h.subtask_id,
                           h.action, h.created_at
                    FROM task_histories h
                    JOIN tasks t ON t.task_id = h.task_id
                          LEFT JOIN subtasks s ON s.subtask_id = h.subtask_id
                    WHERE t.user_id = %s
                      AND h.created_at >= CURRENT_TIMESTAMP - INTERVAL '7 days'
                    ORDER BY h.created_at DESC
                    LIMIT 50;
                """, (user_id,))
                return [{
                    "history_id": row[0],
                    "task_id": row[1],
                    "title": row[2],
                    "subtask_title": row[3],
                    "subtask_id": row[4],
                    "action": row[5],
                    "timestamp": row[6].isoformat() if row[6] else None
                } for row in cursor.fetchall()]

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
