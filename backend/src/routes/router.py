## 各ルートの処理をまとめるクラス

from routes.task_route import TaskRoute
from routes.hello_route import HelloRoute


class Router:

    @staticmethod
    def route(handler):

        path = handler.path

        ## pathに応じて各ルートの処理を呼び出す
        if path == "/api/hello":
            HelloRoute.get(handler)
            return
        
        if path == "/api/tasks":
            ## /api/tasks に対する処理
            if handler.command == "GET":
                """タスク一覧を取得する"""
                TaskRoute.list_tasks(handler)
                return
            
            if handler.command == "POST":
                """タスクを作成する"""
                TaskRoute.create_task(handler)
                return
                 
        elif path.startswith("/api/tasks/"):
            ## /api/tasks/{task_id} に対する処理
            task_id = path.removeprefix("/api/tasks/")

            if task_id.isdigit():
                if handler.command == "GET":
                    TaskRoute.get_task(handler, int(task_id))
                    return
                if handler.command == "PUT":
                    TaskRoute.update_task(handler, int(task_id))
                    return
                if handler.command == "DELETE":
                    TaskRoute.delete_task(handler, int(task_id))
                    return


        handler.send_response(404)
        handler.end_headers()