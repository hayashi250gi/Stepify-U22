# ===================================================
# ファイル名: ai_route.py
# 最終更新日: 2026/08/27
# 作成者: 林健太
# 概要: AI関連APIのHTTPルートを処理するモジュール
# ===================================================

import json
import threading
import time

from services.ai_service import AiService
from utils.response import Response
from config.config import Config


class AiRoute:
    _rate_limit = {}
    _rate_limit_lock = threading.Lock()

    @classmethod
    def _is_rate_limited(cls, client_ip):
        now = time.monotonic()
        window = Config.AI_RATE_LIMIT_WINDOW_SECONDS
        with cls._rate_limit_lock:
            requests = [timestamp for timestamp in cls._rate_limit.get(client_ip, []) if now - timestamp < window]
            limited = len(requests) >= Config.AI_RATE_LIMIT_REQUESTS
            if not limited:
                requests.append(now)
            cls._rate_limit[client_ip] = requests
            return limited

    @staticmethod
    def decompose_task(handler):

        client_ip = handler.headers.get("X-Real-IP", handler.client_address[0])
        if AiRoute._is_rate_limited(client_ip):
            Response.json(
                handler,
                429,
                {"message": "AIリクエストが多すぎます。しばらく待ってください。"},
                {"Retry-After": str(Config.AI_RATE_LIMIT_WINDOW_SECONDS)},
            )
            return

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

            if content_length <= 0 or content_length > Config.AI_MAX_INPUT_CHARS * 4:
                Response.json(handler, 413, {"message": "リクエストサイズが上限を超えています。"})
                return

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

        if len(task_title) + len(task_detail) > Config.AI_MAX_INPUT_CHARS:
            Response.json(handler, 413, {"message": "入力文字数が上限を超えています。"})
            return

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