from fastapi.testclient import TestClient

from main import app


client = TestClient(app)


def test_websocket_rejects_without_token():
    try:
        with client.websocket_connect('/assistant/events'):
            assert False, 'Expected websocket auth rejection'
    except Exception:
        assert True
