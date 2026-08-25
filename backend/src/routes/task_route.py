"""タスクルート"""

import json

from services.task_service import TaskService
from utils.response import Response
from repositories.task_history_repository import TaskHistoryRepository


class TaskRoute:
    @staticmethod
    def get_task(handler, task_id):
        """タスクを取得する"""
        
        task = TaskService.get_task(task_id, handler.user_id)

        ## taskが存在しない場合の処理
        if task is None:
            Response.json(
                handler,
                404,
                {
                    "message": "Task not found."
                }
            )

            return

        ## taskが存在する場合の処理
        Response.json(
            handler,
            200,
            task
        )

    @staticmethod
    def create_task(handler):
        """タスクを作成する"""

        try:

            content_length = int(
                handler.headers.get("Content-Length", 0)
            )

            body = handler.rfile.read(content_length)

            data = json.loads(body.decode("utf-8"))

            user_id = handler.user_id

            description = data.get("description")
            subtasks = data.get("subtasks", [])
            deadline = data.get("deadline")
            priority = data.get("priority", "medium")

            task_id = TaskService.create_task(
                user_id=user_id,
                title=data["title"],
                description=description,
                subtasks=subtasks,
                deadline=deadline,
                priority=priority
            )

            Response.json(
                handler,
                200,
                {
                    "task_id": task_id,
                    "message": "Task created."
                }
            )

        except ValueError as e:

            Response.json(
                handler,
                400,
                {
                    "message": str(e)
                }
            )

    @staticmethod
    def import_tasks(handler):
        try:
            content_length = int(handler.headers.get("Content-Length", 0))
            data = json.loads(handler.rfile.read(content_length).decode("utf-8"))
            tasks = data.get("tasks", [])
            if not isinstance(tasks, list):
                raise ValueError("tasks must be a list.")
            imported = []
            for task in tasks:
                imported.append(TaskService.create_task(
                    user_id=handler.user_id,
                    title=task["title"],
                    description=task.get("description"),
                    subtasks=task.get("subtasks", []),
                    deadline=task.get("deadline"),
                    priority=task.get("priority", "medium")
                ))
            Response.json(handler, 200, {"task_ids": imported, "message": "Tasks imported."})
        except (ValueError, KeyError, TypeError, json.JSONDecodeError) as error:
            Response.json(handler, 400, {"message": str(error)})

    @staticmethod
    def update_task(handler, task_id):

        try:

            content_length = int(
                handler.headers.get("Content-Length", 0)
            )

            body = handler.rfile.read(content_length)

            data = json.loads(body.decode("utf-8"))

            user_id = handler.user_id

            updated_task_id = TaskService.update_task(
                task_id=task_id,
                user_id=user_id,
                title=data["title"],
                description=data.get("description"),
                subtasks=data.get("subtasks"),
                deadline=data.get("deadline"),
                priority=data.get("priority")
            )

            if updated_task_id is None:

                Response.json(
                    handler,
                    404,
                    {
                        "message": "Task not found."
                    }
                )

                return

            Response.json(
                handler,
                200,
                {
                    "task_id": updated_task_id,
                    "message": "Task updated."
                }
            )

        except ValueError as e:

            Response.json(
                handler,
                400,
                {
                    "message": str(e)
                }
            )

        except PermissionError as e:

            Response.json(
                handler,
                400,
                {
                    "message": str(e)
                }
            )

    @staticmethod
    def delete_task(handler, task_id):
        """タスクを削除する"""

        try:

            user_id = handler.user_id

            deleted_task_id = TaskService.delete_task(
                task_id,
                user_id
            )

            if deleted_task_id is None:

                Response.json(
                    handler,
                    404,
                    {
                        "message": "Task not found."
                    }
                )

                return

            Response.json(
                handler,
                200,
                {
                    "task_id": deleted_task_id,
                    "message": "Task deleted."
                }
            )
                    
        except PermissionError as e:

            Response.json(
                handler,
                400,
                {
                    "message": str(e)
                }
            )


    @staticmethod
    def list_tasks(handler):

        tasks = TaskService.list_tasks(handler.user_id)

        Response.json(
                handler,
                200,
                {
                    "tasks": tasks
                }
            )

    @staticmethod
    def get_recent_history(handler):
        """ログインユーザーの直近一週間の実行履歴を取得する。"""
        history = TaskHistoryRepository.get_recent_history(handler.user_id)
        Response.json(handler, 200, {"history": history})

    @staticmethod
    def get_suggestion(handler, task_id=None):
        """次にやるべきタスクを提案する"""
        suggestion = TaskService.suggest_next_subtask(task_id, handler.user_id)

        if suggestion is None:
            Response.json(handler, 200, {"message": "No tasks to do."})
            return

        Response.json(handler, 200, suggestion)

    @staticmethod
    def update_subtask_status(handler, task_id, subtask_id):
        try:
            content_length = int(handler.headers.get("Content-Length", 0))
            body = handler.rfile.read(content_length)
            data = json.loads(body.decode("utf-8"))

            # サービス層でステータス更新
            TaskService.update_subtask_status(task_id, subtask_id, data['status'], handler.user_id)

            Response.json(handler, 200, {"message": "Subtask updated."})
        except Exception as e:
            Response.json(handler, 500, {"message": str(e)})

    @staticmethod
    def save_history(handler, task_id):
        try:
            content_length = int(handler.headers.get("Content-Length", 0))
            data = json.loads(handler.rfile.read(content_length).decode("utf-8"))
            task = TaskService.get_task(task_id, handler.user_id)
            if task is None:
                Response.json(handler, 404, {"message": "Task not found."})
                return
            action = data.get("action", "complete")
            if action not in ("complete", "interrupt", "skip", "execution"):
                raise ValueError("Invalid history action.")
            subtask_id = data.get("subtaskId")
            if subtask_id is not None and not any(
                str(subtask["subtask_id"]) == str(subtask_id) for subtask in task["subtasks"]
            ):
                raise ValueError("Subtask does not belong to task.")
            TaskHistoryRepository.save_history(task_id, subtask_id, action)
            Response.json(handler, 200, {"message": "History saved."})
        except (ValueError, KeyError, TypeError) as error:
            Response.json(handler, 400, {"message": str(error)})

