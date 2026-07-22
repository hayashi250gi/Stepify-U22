from config.config import Config

from services.user_service import UserService
from services.jwt_service import JwtService

from clients.google_auth_client import GoogleAuthClient


class AuthService:

    @staticmethod
    def login_with_google(id_token_str: str) -> dict:
        """
        ログインまたは新規登録を行う
        """

        id_info = GoogleAuthClient.verify_id_token(
            id_token_str
        )

        google_sub = id_info["sub"]
        display_name = id_info.get("name", "User")

        user = UserService.get_user_by_google_sub(
            google_sub
        )

        if user is None:

            user_id = UserService.create_user(
                google_sub=google_sub,
                display_name=display_name,
            )

            user = UserService.get_user(user_id)

        else:

            UserService.update_last_login(
                user["user_id"]
            )

            user = UserService.get_user(
                user["user_id"]
            )
        
        token = JwtService.generate_token(
            user["user_id"]
        )

        return {
            "token": token,
            "user": user,
        }