from services.rag.service import chunk_text


def test_chunker_splits_large_text():
    text = 'A' * 2000
    chunks = chunk_text(text, size=500, overlap=100)
    assert len(chunks) >= 4
    assert chunks[0].index == 0
    assert all(c.text for c in chunks)
