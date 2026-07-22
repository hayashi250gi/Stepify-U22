from google import genai
from google.genai import types
from google.genai.errors import ClientError

from config.config import Config


class GeminiClient:

    _client = genai.Client(
        api_key=Config.GEMINI_API_KEY
    )

    @staticmethod
    def generate(
        system_prompt: str,
        user_prompt: str
    ) -> str:
        """
        Geminiへ問い合わせる。
        """
        try:
            response = GeminiClient._client.models.generate_content(

                model=Config.GEMINI_MODEL,

                contents=f"""
                    {system_prompt}

                    {user_prompt}
                """.strip(),

                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema={
                        "type": "OBJECT",
                        "properties": {
                            "subtasks": {
                                "type": "ARRAY",
                                "items": {
                                    "type": "OBJECT",
                                    "properties": {

                                        "title": {
                                            "type": "STRING",
                                            "description": "サブタスク名"
                                        },

                                        "description": {
                                            "type": "STRING",
                                            "description": "サブタスクの内容・説明"
                                        },

                                        "order_no": {
                                            "type": "INTEGER",
                                            "description": "親タスク内での実行順"
                                        },

                                        "estimated_minutes": {
                                            "type": "INTEGER",
                                            "minimum": 5,
                                            "maximum": 60,
                                            "description": "実行予定時間(5~60分)"
                                        }

                                    },

                                    "required": [
                                        "title",
                                        "description",
                                        "order_no",
                                        "estimated_minutes"
                                    ]
                                }
                            }
                        },

                        "required": [
                            "subtasks"
                        ]
                    }
                )

            )
        
            return response.text
    
        except ClientError as e:
            raise ValueError(
                f"Gemini API Error: {e}"
            )
