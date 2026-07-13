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
            TaskRoute.get_task_list(handler)
            return


        handler.send_response(404)
        handler.end_headers()