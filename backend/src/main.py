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