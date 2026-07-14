"""タスクのサービスモジュール"""

from repositories.task_repository import TaskRepository


class TaskService:
    """タスクのサービスクラス"""

    @staticmethod
    def get_task(task_id: int):
        """タスクを取得する"""
        return TaskRepository.get_task(task_id)

    @staticmethod
    def create_task(user_id: int, title: str):
        """タスクを作成する"""
        
        # title編集
        title = title.strip()
        if len(title) == 0:
            raise ValueError("Title cannot be empty")
        
        if len(title) > 255:
            raise ValueError("Title must be 255 characters or less")
        
        ### TODO 認証実装後は、ユーザーIDはJWTから取得するようにする
        task_id = TaskRepository.create_task(user_id = user_id, title = title)
        return task_id
    
    @staticmethod
    def update_task(task_id: int, user_id: int, title: str):
        """タスクを更新する"""

        # 前後の空白を削除
        title = title.strip()

        # バリデーション
        if len(title) == 0:
            raise ValueError("Task title is required.")

        if len(title) > 255:
            raise ValueError("Task title must be 255 characters or less.")

        # タスクの存在確認
        task = TaskRepository.get_task(task_id)

        if task is None:
            return None

        # TODO
        # JWT認証実装後
        # task["user_id"] == user_id を確認し、
        # 一致しない場合は PermissionError を送出する

        updated_task_id = TaskRepository.update_task(
            task_id=task_id,
            title=title
        )

        return updated_task_id
    
    @staticmethod
    def delete_task(task_id: int, user_id: int):
        """タスクを削除する"""

        task = TaskRepository.get_task(task_id)

        if task is None:
            return None

        # TODO
        # JWT認証後
        # task["user_id"] == user_id を確認
        # 一致しない場合は PermissionError

        deleted_task_id = TaskRepository.delete_task(task_id)

        return deleted_task_id
    

    @staticmethod
    def list_tasks():
        """タスクの一覧を取得する"""
        return TaskRepository.list_tasks()