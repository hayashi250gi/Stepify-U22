from routes.auth_route import AuthRoute
from routes.hello_route import HelloRoute
from routes.task_route import TaskRoute
from routes.user_route import UserRoute
from routes.settings_route import SettingsRoute
from routes.config_route import ConfigRoute



class Router:

    @staticmethod
    def route(handler):

        path = handler.path
        method = handler.command

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

            if path == "/api/tasks":
                TaskRoute.create_task(handler)
                return

        # =========================
        # PUT
        # =========================

        elif method == "PUT":

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

        handler.send_response(404)
        handler.end_headers()