"""タスクを管理するリポジトリモジュール。"""

from database.database import Database


class TaskRepository:

    @staticmethod
    def get_task_list():

        with Database.get_connection() as connection:

            with connection.cursor() as cursor:

                cursor.execute("""
                    SELECT
                        task_id,
                        user_id,
                        title,
                        status,
                        created_at,
                        updated_at
                    FROM tasks
                    ORDER BY task_id;
                """)

                rows = cursor.fetchall()

        tasks = []

        for row in rows:

            tasks.append({
                "task_id": row[0],
                "user_id": row[1],
                "title": row[2],
                "status": row[3],
                "created_at": row[4].isoformat(),
                "updated_at": row[5].isoformat()
            })

        return tasks