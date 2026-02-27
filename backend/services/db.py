from core.config import get_settings


class MissingDependencyError(RuntimeError):
    pass


def get_conn():
    try:
        import psycopg
        from psycopg.rows import dict_row
    except ImportError as exc:
        raise MissingDependencyError('psycopg is required for database operations') from exc

    settings = get_settings()
    dsn = settings.database_url.replace('+psycopg', '')
    return psycopg.connect(dsn, row_factory=dict_row)


def init_db() -> None:
    try:
        conn = get_conn()
    except MissingDependencyError:
        return

    with conn:
        with conn.cursor() as cur:
            cur.execute('CREATE EXTENSION IF NOT EXISTS vector;')
            cur.execute(
                '''
                CREATE TABLE IF NOT EXISTS documents (
                    id SERIAL PRIMARY KEY,
                    filename TEXT NOT NULL,
                    mime TEXT,
                    content TEXT,
                    status TEXT NOT NULL DEFAULT 'ingested',
                    user_id TEXT,
                    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
                );
                '''
            )
            cur.execute(
                '''
                CREATE TABLE IF NOT EXISTS chunks (
                    id SERIAL PRIMARY KEY,
                    document_id INTEGER NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
                    chunk_index INTEGER NOT NULL,
                    content TEXT NOT NULL,
                    embedding vector(1536),
                    meta JSONB NOT NULL DEFAULT '{}'::jsonb,
                    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
                );
                '''
            )
            cur.execute('CREATE INDEX IF NOT EXISTS idx_chunks_document ON chunks(document_id);')
        conn.commit()
