# ===================================================
# ファイル名: main.py
# 最終更新日: 2026/08/27
# 作成者: 林健太
# 概要: アプリケーションの起動処理を行うエントリーポイント
# ===================================================

from database.database import Database
from database.schema_initializer import SchemaInitializer

from server.server import run


def main():
    
    Database.create_pool()
    SchemaInitializer.create_schema()

    try:
        run()
    finally:
        Database.close_pool()
    

if __name__ == "__main__":
    main()