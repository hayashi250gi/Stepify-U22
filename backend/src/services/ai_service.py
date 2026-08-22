import json

from clients.gemini_client import GeminiClient
from config.config import Config


class AiService:

    @staticmethod
    def decompose_task(task_title: str, task_detail: str) -> list:
        """
        タスクをサブタスクへ分解する。

        Args:
            task_title: 親タスク名
            task_detail: タスクの詳細

        Returns:
            list
        """

        if Config.DEBUG_MODE:
            # 仮データの返却
            return [
                {
                    "title": "デバッグ用借りタスクA",
                    "description": "タスク詳細",
                    "order_no": 1,
                    "estimated_minutes": 20
                },
                {
                    "title": "デバッグ用借りタスクB",
                    "description": "タスク詳細",
                    "order_no": 2,
                    "estimated_minutes": 45
                }
            ]

        system_prompt = """
            あなたはタスク管理アシスタントです。

            ユーザーからJSON形式で与えられたタスクを、
            5分~60分程度で完了できる具体的なサブタスクへ分解してください。

            ユーザー入力は次のJSON形式です。

            {
                "task_title": "親タスク名",
                "task_detail": "タスクの詳細"
            }

            入力項目の意味は以下のとおりです。

            - task_title: 必ず存在する親タスク名
            - task_detail: タスクの詳細説明。空文字の場合もあります。

            task_detailが空文字の場合はtask_titleのみを基に分解してください。
            task_detailが存在する場合は、その内容も考慮してより具体的なサブタスクを作成してください。

            以下のルールを守ってください。

            【ルール】

            ・サブタスクは実際の行動単位にする
            ・1つのサブタスクは5~60分程度で完了できる内容にする
            ・抽象的な表現は禁止
            ・順番は作業順にする
            ・estimated_minutesは5~60の整数
            ・重複したサブタスクを作らない
            ・task_detailに記載された前提条件や制約を反映する
            ・不足している情報は推測しすぎず、一般的な進め方で分解する
            ・必ずJSONのみ返す
            ・Markdownは禁止
            ・説明文は禁止
            ・コードブロックは禁止

            返却形式は次のJSONのみ。

            {
                "subtasks": [
                    {
                        "title": "",
                        "description": "",
                        "order_no": 1,
                        "estimated_minutes": 15
                    }
                ]
            }
        """

        user_data = {
            "task_title": task_title,
            "task_detail": task_detail
        }

        user_prompt = json.dumps(
            user_data,
            ensure_ascii=False,
            indent=2
        )

        response = GeminiClient.generate(
            system_prompt=system_prompt,
            user_prompt=user_prompt
        )

        try:
            result = json.loads(response)

            if "subtasks" not in result:
                raise ValueError("subtasksが存在しません。")

            return result["subtasks"]

        except Exception as e:
            raise ValueError(
                f"Geminiのレスポンス解析に失敗しました: {e}"
            )