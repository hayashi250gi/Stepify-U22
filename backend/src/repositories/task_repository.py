"""タスクを管理するリポジトリモジュール。"""

import uuid

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
                        description,
                        status,
                        created_at,
                        updated_at
                    FROM tasks
                    WHERE task_id = %s;
                """, (task_id,))

                row = cursor.fetchone()

                if row is None:
                    return None

                cursor.execute("""
                    SELECT
                        subtask_id,
                        title,
                        description,
                        order_no,
                        estimated_minutes,
                        status,
                        created_at,
                        updated_at
                    FROM subtasks
                    WHERE task_id = %s
                    ORDER BY order_no, subtask_id;
                """, (task_id,))

                subtask_rows = cursor.fetchall()

        subtasks = []
        for subtask in subtask_rows:
            subtasks.append({
                "subtask_id": subtask[0],
                "title": subtask[1],
                "description": subtask[2],
                "order_no": subtask[3],
                "estimated_minutes": subtask[4],
                "status": subtask[5],
                "created_at": subtask[6].isoformat() if subtask[6] else None,
                "updated_at": subtask[7].isoformat() if subtask[7] else None
            })

        return {
            "task_id": row[0],
            "user_id": row[1],
            "title": row[2],
            "description": row[3],
            "status": row[4],
            "created_at": row[5].isoformat(),
            "updated_at": row[6].isoformat(),
            "subtasks": subtasks
        }
    
    @staticmethod
    def create_task(user_id: int, title: str, description: str | None = None, subtasks: list | None = None):
        """新しいタスクを作成する。"""

        with Database.get_connection() as connection:

            with connection.cursor() as cursor:

                cursor.execute("""
                    INSERT INTO tasks (client_uuid, user_id, title, description)
                    VALUES (%s, %s, %s, %s)
                    RETURNING task_id;
                """, (str(uuid.uuid4()), user_id, title, description))

                task_id = cursor.fetchone()[0]

                if subtasks:
                    for subtask in subtasks:
                        cursor.execute("""
                            INSERT INTO subtasks (
                                client_uuid,
                                task_id,
                                title,
                                description,
                                order_no,
                                estimated_minutes,
                                status
                            ) VALUES (%s, %s, %s, %s, %s, %s, %s);
                        """, (
                            str(uuid.uuid4()),
                            task_id,
                            subtask.get("title", ""),
                            subtask.get("description"),
                            subtask.get("order_no", 0),
                            subtask.get("estimated_minutes"),
                            subtask.get("status", "todo")
                        ))

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