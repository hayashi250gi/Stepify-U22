"""タスクのサービスモジュール"""

from repositories.task_repository import TaskRepository


class TaskService:
    """タスクのサービスクラス"""

    # def __init__(self, task_repository):
    #     self.task_repository = task_repository

    # def create_task(self, task_data):
    #     """タスクを作成する"""
    #     return self.task_repository.create(task_data)

    # def get_task(self, task_id):
    #     """タスクを取得する"""
    #     return self.task_repository.get(task_id)
    
    @staticmethod
    def get_task_list():
        """タスクの一覧を取得する"""
        return TaskRepository.get_task_list()

    # def update_task(self, task_id, task_data):
    #     """タスクを更新する"""
    #     return self.task_repository.update(task_id, task_data)

    # def delete_task(self, task_id):
    #     """タスクを削除する"""
    #     return self.task_repository.delete(task_id)