import json

from services.config_service import ConfigService


class ConfigRoute:

    @staticmethod
    def get_config(handler):

        config = ConfigService.get_public_config()

        handler.send_response(200)
        handler.send_header(
            "Content-Type",
            "application/json"
        )
        handler.end_headers()

        handler.wfile.write(
            json.dumps(config).encode()
        )