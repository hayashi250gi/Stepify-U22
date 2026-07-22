from repositories.user_repository import UserRepository


class UserService:

    @staticmethod
    def create_user(
        google_sub: str,
        display_name: str,
    ) -> int:
        """
        ユーザーを新規登録する
        """

        return UserRepository.create_user(
            google_sub=google_sub,
            display_name=display_name,
        )

    @staticmethod
    def get_user(user_id: int) -> dict | None:
        """
        ユーザーIDから取得する
        """

        return UserRepository.get_user(user_id)

    @staticmethod
    def get_user_by_google_sub(
        google_sub: str,
    ) -> dict | None:
        """
        Googleアカウントから取得する
        """

        return UserRepository.get_user_by_google_sub(
            google_sub
        )

    @staticmethod
    def list_users() -> list:
        """
        全ユーザーを取得する
        """

        return UserRepository.list_users()

    @staticmethod
    def update_display_name(
        user_id: int,
        display_name: str,
    ) -> bool:
        """
        表示名を変更する
        """

        display_name = display_name.strip()

        if len(display_name) == 0:
            raise ValueError(
                "Display name is required."
            )

        if len(display_name) > 100:
            raise ValueError(
                "Display name must be 100 characters or less."
            )

        return UserRepository.update_display_name(
            user_id=user_id,
            display_name=display_name,
        )

    @staticmethod
    def update_last_login(
        user_id: int,
    ) -> bool:
        """
        最終ログイン日時を更新する
        """

        return UserRepository.update_last_login(
            user_id
        )

    @staticmethod
    def delete_user(user_id: int) -> bool:
        """
        ユーザーを削除する
        """

        return UserRepository.delete_user(
            user_id
        )
