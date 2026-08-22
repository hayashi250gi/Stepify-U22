"""タスクルート"""

import json

from services.task_service import TaskService
from utils.response import Response


class TaskRoute:
    @staticmethod
    def get_task(handler, task_id):
        """タスクを取得する"""
        
        task = TaskService.get_task(task_id)

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

            # TODO
            # 認証実装後はJWTから取得する
            user_id = 1

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
    def update_task(handler, task_id):

        try:

            content_length = int(
                handler.headers.get("Content-Length", 0)
            )

            body = handler.rfile.read(content_length)

            data = json.loads(body.decode("utf-8"))

            # TODO
            # JWT認証実装後はトークンから取得する
            user_id = 1

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
                    400,
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

            # TODO
            # JWTから取得
            user_id = 1

            deleted_task_id = TaskService.delete_task(
                task_id,
                user_id
            )

            if deleted_task_id is None:

                Response.json(
                    handler,
                    400,
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

        tasks = TaskService.list_tasks()

        Response.json(
                handler,
                200,
                {
                    "tasks": tasks
                }
            )

    @staticmethod
    def get_suggestion(handler, task_id=None):
        """次にやるべきタスクを提案する"""
        suggestion = TaskService.suggest_next_subtask(task_id)

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
            TaskService.update_subtask_status(task_id, subtask_id, data['status'])

            Response.json(handler, 200, {"message": "Subtask updated."})
        except Exception as e:
            Response.json(handler, 500, {"message": str(e)})

