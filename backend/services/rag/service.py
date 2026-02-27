import io
from dataclasses import dataclass

from fastapi import HTTPException, UploadFile

from core.config import get_settings
from services.db import get_conn


@dataclass
class Chunk:
    index: int
    text: str


def extract_text(upload: UploadFile) -> str:
    raw = upload.file.read()
    if upload.content_type == 'application/pdf' or upload.filename.lower().endswith('.pdf'):
        try:
            from pypdf import PdfReader
        except ImportError as exc:
            raise HTTPException(status_code=500, detail='pypdf dependency missing') from exc
        reader = PdfReader(io.BytesIO(raw))
        return '\n'.join((page.extract_text() or '') for page in reader.pages)
    return raw.decode('utf-8', errors='ignore')


def chunk_text(text: str, size: int = 700, overlap: int = 120) -> list[Chunk]:
    text = ' '.join(text.split())
    if not text:
        return []
    chunks: list[Chunk] = []
    start = 0
    idx = 0
    while start < len(text):
        end = min(len(text), start + size)
        chunks.append(Chunk(index=idx, text=text[start:end]))
        idx += 1
        if end == len(text):
            break
        start = end - overlap
    return chunks


def _embed_texts(texts: list[str]) -> list[list[float]]:
    settings = get_settings()
    if not settings.openai_api_key:
        raise HTTPException(status_code=400, detail='OPENAI_API_KEY not configured for embeddings')
    try:
        from openai import OpenAI
    except ImportError as exc:
        raise HTTPException(status_code=500, detail='openai dependency missing') from exc
    client = OpenAI(api_key=settings.openai_api_key)
    resp = client.embeddings.create(model=settings.openai_embedding_model, input=texts)
    return [d.embedding for d in resp.data]


def ingest_document(user_id: str, upload: UploadFile) -> tuple[int, int]:
    content = extract_text(upload)
    chunks = chunk_text(content)
    if not chunks:
        raise HTTPException(status_code=400, detail='No text extracted from document')

    embeddings = _embed_texts([c.text for c in chunks])
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                'INSERT INTO documents (filename, mime, content, status, user_id) VALUES (%s, %s, %s, %s, %s) RETURNING id',
                (upload.filename, upload.content_type, content, 'ingested', user_id),
            )
            doc_id = cur.fetchone()['id']
            for c, emb in zip(chunks, embeddings):
                cur.execute(
                    'INSERT INTO chunks (document_id, chunk_index, content, embedding, meta) VALUES (%s, %s, %s, %s::vector, %s::jsonb)',
                    (doc_id, c.index, c.text, str(emb), '{}'),
                )
        conn.commit()
    return doc_id, len(chunks)


def query_knowledge(question: str, top_k: int = 5) -> dict:
    emb = _embed_texts([question])[0]
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                '''
                SELECT c.id, c.document_id, c.chunk_index, c.content
                FROM chunks c
                ORDER BY c.embedding <=> %s::vector
                LIMIT %s
                ''',
                (str(emb), top_k),
            )
            rows = cur.fetchall()

    citations = [
        {
            'document_id': r['document_id'],
            'chunk_id': r['id'],
            'chunk_index': r['chunk_index'],
            'snippet': r['content'][:220],
        }
        for r in rows
    ]
    context = '\n\n'.join(f"[{i + 1}] {r['content']}" for i, r in enumerate(rows))
    answer = 'Based on retrieved documents:\n' + context[:1200] if context else 'No relevant knowledge found.'
    return {'answer': answer, 'citations': citations}
