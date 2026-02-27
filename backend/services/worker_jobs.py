from services.db import get_conn
from services.rag.service import _embed_texts, chunk_text


def get_queue():
    from redis import Redis
    from rq import Queue

    from core.config import get_settings

    settings = get_settings()
    redis = Redis.from_url(settings.redis_url)
    return Queue('default', connection=redis)


def enqueue_ingest(document_id: int):
    queue = get_queue()
    return queue.enqueue(ingest_document_job, document_id)


def ingest_document_job(document_id: int) -> None:
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute('SELECT content FROM documents WHERE id=%s', (document_id,))
            row = cur.fetchone()
            if not row:
                return
            content = row['content']
            chunks = chunk_text(content)
            embeddings = _embed_texts([c.text for c in chunks])
            cur.execute('DELETE FROM chunks WHERE document_id=%s', (document_id,))
            for c, emb in zip(chunks, embeddings):
                cur.execute(
                    'INSERT INTO chunks (document_id, chunk_index, content, embedding, meta) VALUES (%s, %s, %s, %s::vector, %s::jsonb)',
                    (document_id, c.index, c.text, str(emb), '{}'),
                )
            cur.execute("UPDATE documents SET status='ingested' WHERE id=%s", (document_id,))
        conn.commit()
