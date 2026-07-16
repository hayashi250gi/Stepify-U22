# フロントに公開可能な設定を返すサービス

from config.config import Config

class ConfigService:
    @staticmethod
    def get_public_config() -> dict:
        return {
            "GOOGLE_CLIENT_ID": Config.GOOGLE_CLIENT_ID,
        }