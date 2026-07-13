"""
PostgreSQL接続プールの管理を行う。
- 接続プールの生成
- 接続プールの開始
- 接続プールの終了

SQLの実行はRepository層で行う。
"""

from psycopg_pool import ConnectionPool

from config.config import Config


class Database:

    _pool = None

    @classmethod
    def create_pool(cls):
        """接続プールを初期化する"""

        if cls._pool is not None:
            return

        cls._pool = ConnectionPool(

            conninfo=(
                f"host={Config.DB_HOST} "
                f"port={Config.DB_PORT} "
                f"dbname={Config.DB_NAME} "
                f"user={Config.DB_USER} "
                f"password={Config.DB_PASSWORD}"
            ),

            min_size=1,
            max_size=10,
            timeout=30,
        )

        cls._pool.open()

        print("Database pool initialized.")

    @classmethod
    def get_connection(cls):
        """接続を取得する。接続プールが初期化されていない場合は例外を発生させる。"""

        if cls._pool is None:
            raise RuntimeError(
                "Database has not been initialized."
            )

        return cls._pool.connection()

    @classmethod
    def close_pool(cls):
        """接続プールを終了する。"""

        if cls._pool is not None:
            cls._pool.close()
            cls._pool = None

            print("Database pool closed.")