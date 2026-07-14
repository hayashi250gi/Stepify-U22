"""タスクを管理するリポジトリモジュール。"""

from database.database import Database


class TaskRepository:
    @staticmethod
    def get_task(task_id: int):
        """指定されたtask_idに対応するタスクを取得する。"""

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
                    WHERE task_id = %s;
                """, (task_id,))

                row = cursor.fetchone()

        if row is None:
            return None

        return {
            "task_id": row[0],
            "user_id": row[1],
            "title": row[2],
            "status": row[3],
            "created_at": row[4].isoformat(),
            "updated_at": row[5].isoformat()
        }
    
    @staticmethod
    def create_task(user_id: int, title: str):
        """新しいタスクを作成する。"""

        with Database.get_connection() as connection:

            with connection.cursor() as cursor:

                cursor.execute("""
                    INSERT INTO tasks (user_id, title)
                    VALUES (%s, %s)
                    RETURNING task_id;
                """, (user_id, title))

                task_id = cursor.fetchone()[0]

            connection.commit()

        return task_id
    
    @staticmethod
    def update_task(task_id: int, title: str):
        """指定されたtask_idのタスクを更新する。"""

        with Database.get_connection() as connection:

            with connection.cursor() as cursor:

                cursor.execute("""
                    UPDATE tasks
                    SET
                        title = %s,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE
                        task_id = %s
                    RETURNING task_id;
                """, (title, task_id))

                row = cursor.fetchone()

            connection.commit()

        if row is None:
            return None

        return row[0]

    @staticmethod
    def delete_task(task_id: int):
        """指定されたtask_idのタスクを削除する。"""

        with Database.get_connection() as connection:

            with connection.cursor() as cursor:

                cursor.execute("""
                    DELETE FROM tasks
                    WHERE task_id = %s
                    RETURNING task_id;
                """, (task_id,))

                row = cursor.fetchone()

            connection.commit()

        if row is None:
            return None

        return row[0]
    
    @staticmethod
    def list_tasks():
        """すべてのタスクを取得する。"""

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