import json

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from fastapi.responses import StreamingResponse

from core.config import get_settings
from core.security import create_access_token, get_current_user
from schemas import (
    ChatRequest,
    ChatResponse,
    IngestResponse,
    KnowledgeQueryRequest,
    KnowledgeQueryResponse,
    LoginRequest,
    SystemResponse,
    TokenResponse,
    WeatherResponse,
)
from services import authenticate_user, get_system_data, get_weather_data, process_chat
from services.llm import get_llm_client
from services.rag.service import ingest_document, query_knowledge
from services.worker_jobs import enqueue_ingest
from services.db import get_conn

router = APIRouter()
settings = get_settings()


@router.post('/auth/login', response_model=TokenResponse, tags=['Auth'])
def login(body: LoginRequest):
    if not authenticate_user(body.username, body.password, settings):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid credentials')
    token = create_access_token({'sub': body.username})
    return TokenResponse(access_token=token)


@router.post('/assistant/chat', response_model=ChatResponse, tags=['Assistant'])
def chat(body: ChatRequest, _user=Depends(get_current_user)):
    return process_chat(body.message, body.session_id)


@router.post('/assistant/chat/stream', tags=['Assistant'])
def chat_stream(body: ChatRequest, _user=Depends(get_current_user)):
    sid = body.session_id or 'stream'
    messages = [
        {'role': 'system', 'content': 'You are Omniel assistant. Be concise.'},
        {'role': 'user', 'content': body.message},
    ]
    client = get_llm_client()

    def event_gen():
        for token in client.stream(messages):
            yield f"data: {json.dumps({'type': 'token', 'content': token, 'session_id': sid, 'source': client.source})}\n\n"
        yield f"data: {json.dumps({'type': 'done', 'session_id': sid, 'source': client.source})}\n\n"

    return StreamingResponse(event_gen(), media_type='text/event-stream')


@router.get('/tools/weather', response_model=WeatherResponse, tags=['Tools'])
def weather(city: str, _user=Depends(get_current_user)):
    return get_weather_data(city)


@router.get('/tools/system', response_model=SystemResponse, tags=['Tools'])
def system_stats(_user=Depends(get_current_user)):
    return get_system_data()


@router.post('/knowledge/ingest', response_model=IngestResponse, tags=['Knowledge'])
def knowledge_ingest(upload: UploadFile = File(...), user=Depends(get_current_user)):
    if settings.ingest_async:
        content = upload.file.read().decode('utf-8', errors='ignore')
        with get_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    "INSERT INTO documents (filename, mime, content, status, user_id) VALUES (%s, %s, %s, 'queued', %s) RETURNING id",
                    (upload.filename, upload.content_type, content, user.get('sub', 'unknown')),
                )
                doc_id = cur.fetchone()['id']
            conn.commit()
        job = enqueue_ingest(doc_id)
        return IngestResponse(document_id=doc_id, status='queued', job_id=job.id)

    doc_id, total = ingest_document(user.get('sub', 'unknown'), upload)
    return IngestResponse(document_id=doc_id, status='ingested', chunks=total)


@router.post('/knowledge/query', response_model=KnowledgeQueryResponse, tags=['Knowledge'])
def knowledge_query(body: KnowledgeQueryRequest, _user=Depends(get_current_user)):
    return query_knowledge(body.question, body.top_k)
