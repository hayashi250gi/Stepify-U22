"""タスクルート"""

import json

from services.task_service import TaskService


class TaskRoute:
    @staticmethod
    def get_task(handler, task_id):
        """タスクを取得する"""
        
        task = TaskService.get_task(task_id)

        ## taskが存在しない場合の処理
        if task is None:
            handler.send_response(404)
            handler.send_header("Content-Type", "application/json")
            handler.end_headers()

            handler.wfile.write(
                json.dumps({
                    "message": "Task not found"
                }).encode("utf-8")
            )

            return

        ## taskが存在する場合の処理
        handler.send_response(200)
        handler.send_header(
            "Content-Type",
            "application/json"
        )
        handler.end_headers()

        handler.wfile.write(
            json.dumps(task).encode("utf-8")
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

            task_id = TaskService.create_task(
                user_id=user_id,
                title=data["title"]
            )

            handler.send_response(201)
            handler.send_header(
                "Content-Type",
                "application/json"
            )
            handler.end_headers()

            handler.wfile.write(
                json.dumps({
                    "task_id": task_id
                }).encode("utf-8")
            )

        except ValueError as e:

            handler.send_response(400)
            handler.send_header(
                "Content-Type",
                "application/json"
            )
            handler.end_headers()

            handler.wfile.write(
                json.dumps({
                    "message": str(e)
                }).encode("utf-8")
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
                title=data["title"]
            )

            if updated_task_id is None:

                handler.send_response(404)
                handler.send_header(
                    "Content-Type",
                    "application/json"
                )
                handler.end_headers()

                handler.wfile.write(
                    json.dumps({
                        "message": "Task not found"
                    }).encode("utf-8")
                )

                return

            handler.send_response(200)
            handler.send_header(
                "Content-Type",
                "application/json"
            )
            handler.end_headers()

            handler.wfile.write(
                json.dumps({
                    "task_id": updated_task_id,
                    "message": "Task updated."
                }).encode("utf-8")
            )

        except ValueError as e:

            handler.send_response(400)
            handler.send_header(
                "Content-Type",
                "application/json"
            )
            handler.end_headers()

            handler.wfile.write(
                json.dumps({
                    "message": str(e)
                }).encode("utf-8")
            )

        except PermissionError as e:

            handler.send_response(403)
            handler.send_header(
                "Content-Type",
                "application/json"
            )
            handler.end_headers()

            handler.wfile.write(
                json.dumps({
                    "message": str(e)
                }).encode("utf-8")
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

                handler.send_response(404)
                handler.send_header(
                    "Content-Type",
                    "application/json"
                )
                handler.end_headers()

                handler.wfile.write(
                    json.dumps({
                        "message": "Task not found"
                    }).encode()
                )

                return

            handler.send_response(200)
            handler.send_header(
                "Content-Type",
                "application/json"
            )
            handler.end_headers()

            handler.wfile.write(
                json.dumps({
                    "task_id": deleted_task_id,
                    "message": "Task deleted."
                }).encode()
            )

        except PermissionError as e:

            handler.send_response(403)
            handler.send_header(
                "Content-Type",
                "application/json"
            )
            handler.end_headers()

            handler.wfile.write(
                json.dumps({
                    "message": str(e)
                }).encode()
            )


    @staticmethod
    def list_tasks(handler):

        tasks = TaskService.list_tasks()

        handler.send_response(200)
        handler.send_header(
            "Content-Type",
            "application/json"
        )
        handler.end_headers()

        handler.wfile.write(
            json.dumps(tasks).encode("utf-8")
        )