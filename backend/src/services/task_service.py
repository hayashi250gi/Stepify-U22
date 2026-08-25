"""タスクのサービスモジュール"""

from repositories.task_repository import TaskRepository


class TaskService:
    """タスクのサービスクラス"""

    @staticmethod
    def get_task(task_id: int, user_id: int):
        """タスクを取得する"""
        return TaskRepository.get_task(task_id, user_id)

    @staticmethod
    def create_task(user_id: int, title: str, description: str | None = None, subtasks: list | None = None, deadline: str | None = None, priority: str = 'medium'):
        """タスクを作成する"""
        
        title = title.strip()
        if len(title) == 0:
            raise ValueError("Title cannot be empty")
        
        if len(title) > 255:
            raise ValueError("Title must be 255 characters or less")

        if description is not None and len(description) > 5000:
            raise ValueError("Description must be 5000 characters or less.")

        if subtasks is None:
            subtasks = []

        if not isinstance(subtasks, list):
            raise ValueError("Subtasks must be a list.")

        if priority not in ("low", "medium", "high"):
            raise ValueError("Priority must be low, medium, or high.")

        for subtask in subtasks:
            if not isinstance(subtask, dict):
                raise ValueError("Each subtask must be an object.")
            if not str(subtask.get("title", "")).strip():
                raise ValueError("Subtask title is required.")
            minutes = subtask.get("estimated_minutes")
            if minutes is not None and (not isinstance(minutes, int) or not 1 <= minutes <= 60):
                raise ValueError("Estimated minutes must be between 1 and 60.")
        
        task_id = TaskRepository.create_task(
            user_id=user_id,
            title=title,
            description=description,
            subtasks=subtasks,
            deadline=deadline,
            priority=priority
        )
        return task_id
    
    @staticmethod
    def update_task(task_id: int, user_id: int, title: str, description: str | None = None, subtasks: list | None = None, deadline: str | None = None, priority: str = 'medium'):
        """タスクを更新する"""

        # 前後の空白を削除
        title = title.strip()

        # バリデーション
        if len(title) == 0:
            raise ValueError("Task title is required.")

        if len(title) > 255:
            raise ValueError("Task title must be 255 characters or less.")

        if description is not None and len(description) > 5000:
            raise ValueError("Description must be 5000 characters or less.")

        if priority not in ("low", "medium", "high"):
            raise ValueError("Priority must be low, medium, or high.")

        if subtasks is not None:
            if not isinstance(subtasks, list):
                raise ValueError("Subtasks must be a list.")
            for subtask in subtasks:
                if not isinstance(subtask, dict) or not str(subtask.get("title", "")).strip():
                    raise ValueError("Each subtask must have a title.")

        updated_task_id = TaskRepository.update_task(
            task_id=task_id,
            user_id=user_id,
            title=title,
            description=description,
            subtasks=subtasks,
            deadline=deadline,
            priority=priority
        )

        return updated_task_id
    
    @staticmethod
    def delete_task(task_id: int, user_id: int):
        """タスクを削除する"""

        task = TaskRepository.get_task(task_id, user_id)

        if task is None:
            return None

        deleted_task_id = TaskRepository.delete_task(task_id, user_id)

        return deleted_task_id
    

    @staticmethod
    def list_tasks(user_id: int):
        """タスクの一覧を取得する"""
        return TaskRepository.list_tasks(user_id)

    @staticmethod
    def update_subtask_status(task_id: int, subtask_id: int, status: str, user_id: int):
        TaskRepository.update_subtask_status(task_id, subtask_id, status, user_id)

    @staticmethod
    def suggest_next_subtask(task_id: int | None = None, user_id: int | None = None):
        """優先度と締め切り、実行順に基づいて次のサブタスクを提案する。"""
        tasks = TaskRepository.list_tasks_with_subtasks(user_id)
        if task_id is not None:
            tasks = [task for task in tasks if task["task_id"] == task_id]

        # 優先度マッピング
        priority_map = {'high': 3, 'medium': 2, 'low': 1}
        tasks.sort(key=lambda x: (-priority_map.get(x['priority'], 0), x['deadline'] or '9999-12-31'))

        for task in tasks:
            # 完了済みのサブタスクは除外して取得
            active_subtasks = [s for s in task['subtasks'] if s['status'] != 'done']

            if active_subtasks:
                completed_count = len([s for s in task['subtasks'] if s['status'] == 'done'])
                total_count = len(task['subtasks'])

                return {
                    "task_id": task['task_id'],
                    "task_title": task['title'],
                    "progress": (completed_count / total_count * 100) if total_count > 0 else 0,
                    "completed_subtasks": completed_count,
                    "total_subtasks": total_count,
                    "subtask": active_subtasks[0]
                }
        return None

