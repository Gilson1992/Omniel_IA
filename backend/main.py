from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routes import router
from api.websocket import ws_router
from core.config import get_settings
from services.db import init_db

settings = get_settings()

app = FastAPI(title='OMNIEL API', description='Backend API for OMNIEL', version='0.1.0')

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin, 'http://127.0.0.1:5173'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)


@app.on_event('startup')
def startup() -> None:
    init_db()


app.include_router(router)
app.include_router(ws_router)


@app.get('/health', tags=['Health'])
def health():
    return {'status': 'ok', 'service': 'omniel-api'}


if __name__ == '__main__':
    import uvicorn

    uvicorn.run('main:app', host=settings.backend_host, port=settings.backend_port, reload=True)
