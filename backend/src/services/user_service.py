from repositories.user_repository import UserRepository


class UserService:

    @staticmethod
    def create_user(
        google_sub: str,
        display_name: str,
    ) -> int:
        """
        ユーザーを新規作成する
        google_sub: GoogleアカウントID
        display_name: 表示名
        """

        display_name = display_name.strip()

        if not display_name:
            raise ValueError("display_name is required.")

        if len(display_name) > 100:
            raise ValueError("display_name must be 100 characters or less.")

        return UserRepository.create_user(
            google_sub=google_sub,
            display_name=display_name,
        )

    @staticmethod
    def get_user(user_id: int) -> dict | None:
        """
        user_idからユーザーを取得する
        """

        return UserRepository.get_user(user_id)

    @staticmethod
    def get_user_by_google_sub(
        google_sub: str,
    ) -> dict | None:
        """
        GoogleアカウントIDからユーザーを取得する
        """

        return UserRepository.get_user_by_google_sub(
            google_sub
        )

    @staticmethod
    def update_display_name(
        user_id: int,
        display_name: str,
    ) -> None:
        """
        表示名を更新する
        """

        display_name = display_name.strip()

        if not display_name:
            raise ValueError("display_name cannot be empty.")

        if len(display_name) > 100:
            raise ValueError("display_name must be 100 characters or less.")

        UserRepository.update_display_name(
            user_id=user_id,
            display_name=display_name,
        )

    @staticmethod
    def update_last_login(user_id: int) -> None:
        """
        最終ログイン日時を更新する
        """

        UserRepository.update_last_login(user_id)

    @staticmethod
    def delete_user(user_id: int) -> None:
        """
        ユーザーを削除する
        """

        UserRepository.delete_user(user_id)