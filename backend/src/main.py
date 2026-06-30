from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import psycopg2


def check_db():

    connection = psycopg2.connect(
        host="db",
        dbname="stepify",
        user="stepify",
        password="password"
    )

    cursor = connection.cursor()

    cursor.execute("SELECT 1;")

    result = cursor.fetchone()

    connection.close()

    return result[0]


class Handler(BaseHTTPRequestHandler):

    def do_GET(self):

        if self.path == "/api/hello":

            db_result = check_db()

            data = {
                "message": "backend ok",
                "db": db_result
            }

            self.send_response(200)

            self.send_header(
                "Content-Type",
                "application/json"
            )

            self.end_headers()

            self.wfile.write(
                json.dumps(data).encode()
            )

            return

        self.send_response(404)
        self.end_headers()


HTTPServer(
    ("0.0.0.0", 8000),
    Handler
).serve_forever()