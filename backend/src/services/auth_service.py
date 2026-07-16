from services.user_service import UserService


class AuthService:

    @staticmethod
    def login_with_google(
        google_sub: str,
        display_name: str,
    ) -> dict:
        """
        Googleログイン
        """

        # TODO:
        # Google ID Tokenを検証し、
        # google_sub・display_nameを取得する

        user = UserService.get_user_by_google_sub(
            google_sub
        )

        if user is None:
            """ユーザーが存在しない場合は新規作成する"""

            user_id = UserService.create_user(
                google_sub=google_sub,
                display_name=display_name,
            )

            user = UserService.get_user(user_id)

        UserService.update_last_login(
            user["user_id"]
        )

        # TODO:
        # セッション生成
        # JWT発行

        return user