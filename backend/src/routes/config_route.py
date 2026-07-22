import json

from services.config_service import ConfigService
from utils.response import Response

class ConfigRoute:

    @staticmethod
    def get_config(handler):

        config = ConfigService.get_public_config()

        Response.json(
                handler,
                200,
                config
            )