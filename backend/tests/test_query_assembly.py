from services.rag import service


class DummyCursor:
    def __enter__(self):
        return self

    def __exit__(self, *args):
        return False

    def execute(self, *_args, **_kwargs):
        return None

    def fetchall(self):
        return [
            {'id': 1, 'document_id': 10, 'chunk_index': 0, 'content': 'alpha beta gamma'},
            {'id': 2, 'document_id': 10, 'chunk_index': 1, 'content': 'delta epsilon zeta'},
        ]


class DummyConn:
    def __enter__(self):
        return self

    def __exit__(self, *args):
        return False

    def cursor(self):
        return DummyCursor()


def test_query_knowledge_builds_citations(monkeypatch):
    monkeypatch.setattr(service, '_embed_texts', lambda _texts: [[0.1] * 1536])
    monkeypatch.setattr(service, 'get_conn', lambda: DummyConn())

    result = service.query_knowledge('What is alpha?', top_k=2)
    assert len(result['citations']) == 2
    assert result['citations'][0]['chunk_id'] == 1
    assert 'retrieved documents' in result['answer'].lower()
