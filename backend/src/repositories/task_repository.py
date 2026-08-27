# ===================================================
# ファイル名: task_repository.py
# 最終更新日: 2026/08/27
# 作成者: 林健太
# 概要: タスクデータのデータベース操作を提供するリポジトリ
# ===================================================

"""タスクを管理するリポジトリモジュール。"""

import uuid

from database.database import Database


class TaskRepository:
    @staticmethod
    def get_task(task_id: int, user_id: int | None = None):
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
                        deadline,
                        priority,
                        (SELECT COUNT(*) FILTER (WHERE s.status = 'done')::float / NULLIF(COUNT(*), 0) * 100
                         FROM subtasks s WHERE s.task_id = t.task_id) AS progress,
                        created_at,
                        updated_at
                    FROM tasks t
                    WHERE t.task_id = %s AND (%s IS NULL OR t.user_id = %s);
                """, (task_id, user_id, user_id))

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
                    "deadline": row[5].isoformat() if row[5] else None,
                    "priority": row[6],
                    "progress": row[7] or 0,
                    "created_at": row[8].isoformat(),
                    "updated_at": row[9].isoformat(),
                    "subtasks": subtasks
                }
    
    @staticmethod
    def create_task(user_id: int, title: str, description: str | None = None, subtasks: list | None = None, deadline: str | None = None, priority: str = 'medium'):
        """新しいタスクを作成する。"""

        with Database.get_connection() as connection:

            with connection.cursor() as cursor:

                cursor.execute("""
                    INSERT INTO tasks (client_uuid, user_id, title, description, deadline, priority)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    RETURNING task_id;
                """, (str(uuid.uuid4()), user_id, title, description, deadline, priority))

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
    def update_task(task_id: int, user_id: int, title: str, description: str | None = None, subtasks: list | None = None, deadline: str | None = None, priority: str = 'medium'):
        """指定されたtask_idのタスクを更新する。"""

        with Database.get_connection() as connection:
            with connection.cursor() as cursor:
                # タスク本体の更新
                cursor.execute("""
                    UPDATE tasks
                    SET
                        title = %s,
                        description = %s,
                        deadline = %s,
                        priority = %s,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE
                        task_id = %s AND user_id = %s
                    RETURNING task_id;
                """, (title, description, deadline, priority, task_id, user_id))

                row = cursor.fetchone()
                if row is None:
                    return None

                cursor.execute("SELECT subtask_id FROM subtasks WHERE task_id = %s;", (task_id,))
                existing_subtask_ids = {row[0] for row in cursor.fetchall()}
                retained_subtask_ids = set()

                for order_no, subtask in enumerate(subtasks or []):
                    subtask_id = subtask.get("subtask_id")
                    if isinstance(subtask_id, str) and subtask_id.isdigit():
                        subtask_id = int(subtask_id)
                    if isinstance(subtask_id, int) and subtask_id in existing_subtask_ids:
                        cursor.execute("""
                            UPDATE subtasks
                            SET title = %s, description = %s, order_no = %s,
                                estimated_minutes = %s, status = %s,
                                updated_at = CURRENT_TIMESTAMP
                            WHERE subtask_id = %s AND task_id = %s;
                        """, (
                            subtask.get("title", ""), subtask.get("description"), order_no,
                            subtask.get("estimated_minutes"), subtask.get("status", "todo"),
                            subtask_id, task_id
                        ))
                        retained_subtask_ids.add(subtask_id)
                    else:
                        cursor.execute("""
                            INSERT INTO subtasks (client_uuid, task_id, title, description, order_no, estimated_minutes, status)
                            VALUES (%s, %s, %s, %s, %s, %s, %s);
                        """, (
                            str(uuid.uuid4()), task_id, subtask.get("title", ""),
                            subtask.get("description"), order_no,
                            subtask.get("estimated_minutes"), subtask.get("status", "todo")
                        ))

                deleted_subtask_ids = existing_subtask_ids - retained_subtask_ids
                if deleted_subtask_ids:
                    cursor.execute(
                        "DELETE FROM subtasks WHERE task_id = %s AND subtask_id = ANY(%s);",
                        (task_id, list(deleted_subtask_ids))
                    )

                connection.commit()

        return row[0]

    @staticmethod
    def update_subtask_status(task_id: int, subtask_id: int, status: str, user_id: int):
        with Database.get_connection() as connection:
            with connection.cursor() as cursor:
                # ログを追加して更新が走っているか確認
                print(f"Updating subtask {subtask_id} status to {status} for task {task_id}")
                # 確実にサブタスクのステータスとtask_idの一致をチェックして更新
                cursor.execute("""
                    UPDATE subtasks
                    SET status = %s
                    WHERE subtask_id = %s AND task_id = %s
                      AND EXISTS (SELECT 1 FROM tasks WHERE task_id = %s AND user_id = %s);
                """, (status, subtask_id, task_id, task_id, user_id))

                if cursor.rowcount != 1:
                    raise ValueError("Subtask not found.")

                cursor.execute("""
                    UPDATE tasks
                    SET status = 'done', updated_at = CURRENT_TIMESTAMP
                    WHERE task_id = %s AND user_id = %s
                      AND NOT EXISTS (
                          SELECT 1 FROM subtasks
                          WHERE task_id = %s AND status != 'done'
                      );
                """, (task_id, user_id, task_id))

                # 履歴保存
                cursor.execute("""
                    INSERT INTO task_histories (task_id, subtask_id, action, created_at)
                    VALUES (%s, %s, %s, CURRENT_TIMESTAMP);
                """, (task_id, subtask_id, 'complete'))

            connection.commit()

    @staticmethod
    def delete_task(task_id: int, user_id: int):
        """指定されたtask_idのタスクを削除する。"""

        with Database.get_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute("""
                    DELETE FROM tasks
                    WHERE task_id = %s AND user_id = %s
                    RETURNING task_id;
                """, (task_id, user_id))
                row = cursor.fetchone()

            connection.commit()

        if row is None:
            return None

        return row[0]
    @staticmethod
    def list_tasks(user_id: int | None = None):
        """すべてのタスクを取得する。"""

        with Database.get_connection() as connection:

            with connection.cursor() as cursor:

                cursor.execute("""
                    SELECT
                        task_id,
                        user_id,
                        title,
                        status,
                        deadline,
                        priority,
                        (SELECT COUNT(*) FILTER (WHERE s.status = 'done')::float / NULLIF(COUNT(*), 0) * 100
                         FROM subtasks s WHERE s.task_id = tasks.task_id) AS progress,
                        created_at,
                        updated_at
                    FROM tasks
                    WHERE (%s IS NULL OR user_id = %s)
                    ORDER BY task_id;
                """, (user_id, user_id))

                rows = cursor.fetchall()

        tasks = []

        for row in rows:
            tasks.append({
                "task_id": row[0],
                "user_id": row[1],
                "title": row[2],
                "status": row[3],
                "deadline": row[4].isoformat() if row[4] else None,
                "priority": row[5],
                "progress": row[6] or 0,
                "created_at": row[7].isoformat(),
                "updated_at": row[8].isoformat()
            })

        return tasks

    @staticmethod
    def list_tasks_with_subtasks(user_id: int | None = None):
        """サブタスクを含めたすべてのタスクを取得する。"""
        with Database.get_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT
                        t.task_id, t.title, t.deadline, t.priority,
                        s.subtask_id, s.title, s.order_no, s.status, s.estimated_minutes
                    FROM tasks t
                    LEFT JOIN subtasks s ON t.task_id = s.task_id
                    WHERE (%s IS NULL OR t.user_id = %s)
                    ORDER BY t.deadline ASC NULLS LAST, t.priority DESC, s.order_no ASC;
                """, (user_id, user_id))
                rows = cursor.fetchall()

        tasks = {}
        for row in rows:
            task_id = row[0]
            if task_id not in tasks:
                tasks[task_id] = {
                    "task_id": task_id,
                    "title": row[1],
                    "deadline": row[2],
                    "priority": row[3],
                    "subtasks": []
                }
            if row[4] is not None:
                tasks[task_id]["subtasks"].append({
                    "subtask_id": row[4],
                    "title": row[5],
                    "order_no": row[6],
                    "status": row[7],
                    "estimated_minutes": row[8]
                })
        return list(tasks.values())

