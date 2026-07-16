from repositories.settings_repository import SettingsRepository


class SettingsService:

    @staticmethod
    def get_settings(user_id: int) -> dict | None:
        """
        ユーザー設定を取得する
        """

        return SettingsRepository.get_settings(user_id)

    @staticmethod
    def update_settings(
        user_id: int,
        settings: dict,
    ) -> None:
        """
        ユーザー設定を更新する
        """

        SettingsService._validate_settings(settings)

        SettingsRepository.update_settings(
            user_id=user_id,
            settings=settings,
        )

    @staticmethod
    def _validate_settings(settings: dict) -> None:
        """
        設定値を検証する
        """

        if not isinstance(settings, dict):
            raise ValueError("Settings must be an object.")

        # appearance
        appearance = settings.get("appearance")

        if appearance is None:
            raise ValueError("appearance is required.")

        theme = appearance.get("theme")

        if theme not in ("light", "dark", "system"):
            raise ValueError("Invalid theme.")

        # notification
        notification = settings.get("notification")

        if notification is None:
            raise ValueError("notification is required.")

        if not isinstance(notification.get("enabled"), bool):
            raise ValueError("notification.enabled must be boolean.")

        if not isinstance(notification.get("sound"), bool):
            raise ValueError("notification.sound must be boolean.")

        # sync
        sync = settings.get("sync")

        if sync is None:
            raise ValueError("sync is required.")

        if not isinstance(sync.get("auto_sync"), bool):
            raise ValueError("sync.auto_sync must be boolean.")

        if not isinstance(sync.get("sync_only_wifi"), bool):
            raise ValueError("sync.sync_only_wifi must be boolean.")