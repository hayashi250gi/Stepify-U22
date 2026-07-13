"""タスクルート"""

import json

from services.task_service import TaskService


class TaskRoute:

    @staticmethod
    def get_task_list(handler):

        tasks = TaskService.get_task_list()

        handler.send_response(200)

        handler.send_header(
            "Content-Type",
            "application/json"
        )

        handler.end_headers()

        handler.wfile.write(
            json.dumps(tasks).encode()
        )