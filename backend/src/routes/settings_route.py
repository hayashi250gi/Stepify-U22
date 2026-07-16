import json

from services.settings_service import SettingsService


class SettingsRoute:

    @staticmethod
    def get_settings(handler, user_id: int):
        """
        GET /api/users/{user_id}/settings
        """

        settings = SettingsService.get_settings(user_id)

        if settings is None:
            handler.send_response(404)
            handler.end_headers()
            return

        handler.send_response(200)
        handler.send_header(
            "Content-Type",
            "application/json",
        )
        handler.end_headers()

        handler.wfile.write(
            json.dumps(settings).encode()
        )

    @staticmethod
    def update_settings(handler, user_id: int):
        """
        PUT /api/users/{user_id}/settings
        """

        try:
            content_length = int(
                handler.headers.get("Content-Length", 0)
            )

            body = handler.rfile.read(content_length)

            settings = json.loads(body)

        except json.JSONDecodeError:

            handler.send_response(400)
            handler.send_header(
                "Content-Type",
                "application/json",
            )
            handler.end_headers()

            handler.wfile.write(
                json.dumps({
                    "message": "Invalid JSON."
                }).encode()
            )

            return

        try:

            SettingsService.update_settings(
                user_id=user_id,
                settings=settings,
            )

        except ValueError as e:

            handler.send_response(400)
            handler.send_header(
                "Content-Type",
                "application/json",
            )
            handler.end_headers()

            handler.wfile.write(
                json.dumps({
                    "message": str(e)
                }).encode()
            )

            return

        handler.send_response(204)
        handler.end_headers()