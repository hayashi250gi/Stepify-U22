"""履歴を管理するリポジトリモジュール。"""
from database.database import Database

class HistoryRepository:
    @staticmethod
    def create_history(user_id, task_id, subtask_id, action, comment=None):
        with Database.get_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute("""
                    INSERT INTO task_histories (user_id, task_id, subtask_id, action, comment)
                    VALUES (%s, %s, %s, %s, %s);
                """, (user_id, task_id, subtask_id, action, comment))
            connection.commit()
