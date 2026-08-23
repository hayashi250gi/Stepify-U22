import json
from urllib.parse import parse_qs, urlsplit
from routes.auth_route import AuthRoute
from routes.hello_route import HelloRoute
from routes.task_route import TaskRoute
from routes.user_route import UserRoute
from routes.settings_route import SettingsRoute
from routes.config_route import ConfigRoute
from routes.ai_route import AiRoute
from utils.auth import Auth



class Router:

    @staticmethod
    def route(handler):

        parsed_path = urlsplit(handler.path)
        path = parsed_path.path
        method = handler.command

        public_path = path in ("/api/auth/google", "/api/config", "/api/hello", "/api/ai/decompose")
        if path.startswith("/api/") and not public_path and not Auth.authenticate(handler):
            return

        # =========================
        # GET
        # =========================

        if method == "GET":

            if path == "/api/hello":
                HelloRoute.get(handler)
                return

            if path == "/api/tasks":
                TaskRoute.list_tasks(handler)
                return

            if path == "/api/tasks/suggest":
                task_id = parse_qs(parsed_path.query).get("task_id", [None])[0]
                TaskRoute.get_suggestion(handler, int(task_id) if task_id and task_id.isdigit() else None)
                return

            if path.startswith("/api/tasks/"):

                task_id = path.removeprefix("/api/tasks/")
                if task_id.isdigit():
                    TaskRoute.get_task(handler, int(task_id))
                    return

            if path.startswith("/api/users/") and path.endswith("/settings"):

                ### /api/users/{user_id}/settings
                user_id = path.removeprefix("/api/users/")
                user_id = user_id.removesuffix("/settings")

                if user_id.isdigit():
                    SettingsRoute.get_settings(handler, int(user_id))
                    return

            if path.startswith("/api/users/"):

                user_id = path.removeprefix("/api/users/")

                if user_id.isdigit():
                    UserRoute.get_user(handler, int(user_id))
                    return
                
            if path == "/api/config":
                ConfigRoute.get_config(handler)
                return

        # =========================
        # POST
        # =========================

        elif method == "POST":

            if path == "/api/auth/google":
                AuthRoute.login_with_google(handler)
                return
            
            if path == "/api/ai/decompose":
                AiRoute.decompose_task(handler)
                return

            if path == "/api/tasks":
                TaskRoute.create_task(handler)
                return

            if path == "/api/tasks/import":
                TaskRoute.import_tasks(handler)
                return

            if path.startswith("/api/tasks/") and path.endswith("/history"):
                parts = path.split("/")
                if len(parts) == 5 and parts[3].isdigit():
                    TaskRoute.save_history(handler, int(parts[3]))
                    return

        # =========================
        # PUT
        # =========================

        elif method == "PUT":

            if path.startswith("/api/tasks/") and "/subtasks/" in path:
                # /api/tasks/{task_id}/subtasks/{subtask_id}
                parts = path.split("/")
                task_id = parts[3]
                subtask_id = parts[5]

                if task_id.isdigit() and subtask_id.isdigit():
                    TaskRoute.update_subtask_status(handler, int(task_id), int(subtask_id))
                    return
                            
            if path.startswith("/api/tasks/"):

                task_id = path.removeprefix("/api/tasks/")
                if task_id.isdigit():
                    TaskRoute.update_task(handler, int(task_id))
                    return
                            
            if path.startswith("/api/users/") and path.endswith("/settings"):

                ### /api/users/{user_id}/settings
                user_id = path.removeprefix("/api/users/")
                user_id = user_id.removesuffix("/settings")

                if user_id.isdigit():
                    SettingsRoute.update_settings(handler, int(user_id))
                    return

            if path.startswith("/api/users/"):

                user_id = path.removeprefix("/api/users/")

                if user_id.isdigit():
                    UserRoute.update_display_name(handler, int(user_id))
                    return

        # =========================
        # DELETE
        # =========================

        elif method == "DELETE":

            if path.startswith("/api/tasks/"):

                task_id = path.removeprefix("/api/tasks/")

                if task_id.isdigit():
                    TaskRoute.delete_task(handler, int(task_id))
                    return

            if path.startswith("/api/users/"):

                user_id = path.removeprefix("/api/users/")

                if user_id.isdigit():
                    UserRoute.delete_user(handler, int(user_id))
                    return

        # =========================
        # Not Found
        # =========================

        Response.json(handler, 404, {"message": "Endpoint not found."})