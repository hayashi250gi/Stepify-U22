import json

from services.ai_service import AiService
from utils.response import Response


class AiRoute:

    @staticmethod
    def decompose_task(handler):

        # -----------------------------
        # リクエスト取得
        # -----------------------------
        try:

            content_length = int(
                handler.headers.get(
                    "Content-Length",
                    0
                )
            )

            body = handler.rfile.read(
                content_length
            )

            data = json.loads(body)

        except json.JSONDecodeError:

            Response.json(
                handler,
                400,
                {
                    "message":
                    "Invalid JSON."
                }
            )

            return

        # -----------------------------
        # 入力チェック
        # -----------------------------
        task_title = data.get("task_title")
        task_detail = data.get("task_detail", "")

        if task_title is None:

            Response.json(
                handler,
                400,
                {
                    "message":
                    "task_title is required."
                }
            )

            return

        if not isinstance(task_title, str):

            Response.json(
                handler,
                400,
                {
                    "message":
                    "task_title must be a string."
                }
            )

            return

        if not isinstance(task_detail, str):

            Response.json(
                handler,
                400,
                {
                    "message":
                    "task_detail must be a string."
                }
            )

            return

        task_title = task_title.strip()
        task_detail = task_detail.strip()

        if len(task_title) == 0:

            Response.json(
                handler,
                400,
                {
                    "message":
                    "task_title is empty."
                }
            )

            return

        # -----------------------------
        # AI実行
        # -----------------------------
        try:

            subtasks = AiService.decompose_task(
                task_title=task_title,
                task_detail=task_detail
            )

        except ValueError as e:

            Response.json(
                handler,
                500,
                {
                    "message":
                    str(e)
                }
            )

            return

        # -----------------------------
        # レスポンス
        # -----------------------------
        Response.json(
            handler,
            200,
            {
                "task_title": task_title,
                "task_detail": task_detail,
                "subtasks": subtasks
            }
        )