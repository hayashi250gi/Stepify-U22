"""各種設定・環境変数を管理するモジュール"""

import os

from dotenv import load_dotenv


load_dotenv()

class Config:
    ENV = os.getenv("ENV", "development")
    DEBUG_MODE = ENV != "production"

    ## server
    HOST = os.getenv("HOST", "0.0.0.0")
    PORT = int(os.getenv("PORT", 8000))

    ## PostgreSQL
    DB_HOST = os.getenv("DB_HOST", "db" if ENV == "production" else "localhost")
    DB_PORT = int(os.getenv("DB_PORT", 5432))
    DB_USER = os.getenv("DB_USER", "stepify")
    DB_PASSWORD = os.getenv("DB_PASSWORD") or ("password" if ENV != "production" else None)
    DB_NAME = os.getenv("DB_NAME", "stepify")

    ## Gemini
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
    GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
    AI_RATE_LIMIT_REQUESTS = int(os.getenv("AI_RATE_LIMIT_REQUESTS", 10))
    AI_RATE_LIMIT_WINDOW_SECONDS = int(os.getenv("AI_RATE_LIMIT_WINDOW_SECONDS", 60))
    AI_MAX_INPUT_CHARS = int(os.getenv("AI_MAX_INPUT_CHARS", 5000))

    ## JWT
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
    JWT_EXPIRE_HOURS = int(os.getenv("JWT_EXPIRE_HOURS", 24))

    ## OAuth
    GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
    GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
    GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:3000")

    if ENV == "production":
        required_settings = {
            "DB_PASSWORD": DB_PASSWORD,
            "JWT_SECRET_KEY": JWT_SECRET_KEY,
            "GOOGLE_CLIENT_ID": GOOGLE_CLIENT_ID,
            "GOOGLE_CLIENT_SECRET": GOOGLE_CLIENT_SECRET,
            "GOOGLE_REDIRECT_URI": GOOGLE_REDIRECT_URI if not GOOGLE_REDIRECT_URI.startswith("http://localhost") else None,
            "GEMINI_API_KEY": GEMINI_API_KEY,
        }
        missing_settings = [name for name, value in required_settings.items() if not value]
        if missing_settings:
            raise RuntimeError(f"必須の本番環境変数が未設定です: {', '.join(missing_settings)}")
        if len(JWT_SECRET_KEY) < 32:
            raise RuntimeError("JWT_SECRET_KEYは32文字以上で設定してください")
        if not GOOGLE_REDIRECT_URI.startswith("https://"):
            raise RuntimeError("本番のGOOGLE_REDIRECT_URIはHTTPSで設定してください")