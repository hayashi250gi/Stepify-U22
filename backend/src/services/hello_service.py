"""テスト用のサービスモジュール。"""

from repositories.hello_repository import HelloRepository


class HelloService:

    @staticmethod
    def get():

        db = HelloRepository.get_database_status()

        return {
            "message": "backend ok",
            "db": db
        }