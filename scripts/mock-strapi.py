import json
import os
from http.server import BaseHTTPRequestHandler, HTTPServer

STATE_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'mock-strapi-state.json')

COLLECTIONS = {
    '/api/articles': 'articles',
    '/api/hero-slides': 'heroSlides',
    '/api/site-setting': 'settings',
}


class MockStrapiHandler(BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        pass

    def _send_json(self, payload, code=200):
        body = json.dumps(payload).encode('utf-8')
        self.send_response(code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        try:
            with open(STATE_PATH, 'r', encoding='utf-8') as handle:
                state = json.load(handle)
        except (OSError, ValueError):
            self._send_json({'error': {'status': 500, 'name': 'InternalServerError'}}, 500)
            return
        route = self.path.split('?')[0].rstrip('/')
        key = COLLECTIONS.get(route)
        if key is None:
            self._send_json({'error': {'status': 404, 'name': 'NotFoundError'}}, 404)
            return
        self._send_json(state.get(key) or {'data': [], 'meta': {'pagination': {'total': 0}}})


if __name__ == '__main__':
    HTTPServer(('127.0.0.1', 1337), MockStrapiHandler).serve_forever()
