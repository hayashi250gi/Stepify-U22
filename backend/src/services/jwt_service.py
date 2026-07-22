import jwt

from datetime import datetime
from datetime import timedelta

from config.config import Config


class JwtService:

    @staticmethod
    def generate_token(user_id: int):

        payload = {
            "user_id": user_id,
            "exp": datetime.utcnow()
            + timedelta(
                hours=Config.JWT_EXPIRE_HOURS
            ),
        }

        return jwt.encode(
            payload,
            Config.JWT_SECRET_KEY,
            algorithm="HS256",
        )

    @staticmethod
    def verify_token(token: str):

        try:

            payload = jwt.decode(
                token,
                Config.JWT_SECRET_KEY,
                algorithms=["HS256"],
            )

            return payload

        except jwt.ExpiredSignatureError:

            raise ValueError(
                "Token has expired."
            )

        except jwt.InvalidTokenError:

            raise ValueError(
                "Invalid token."
            )