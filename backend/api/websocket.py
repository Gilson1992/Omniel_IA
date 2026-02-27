import asyncio
import json
import random
import time

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from core.security import get_websocket_user
from services.tools.system import get_system_data

ws_router = APIRouter()

TRANSCRIPTS = [
    'Monitoring all systems...',
    'Neural network sync complete.',
    'Scanning perimeter. No threats detected.',
    'Power core at optimal levels.',
]


@ws_router.websocket('/assistant/events')
async def websocket_events(websocket: WebSocket):
    try:
        user = get_websocket_user(websocket)
    except Exception:
        await websocket.close(code=1008, reason='Missing or invalid token')
        return

    await websocket.accept()
    try:
        while True:
            sys = get_system_data()
            event = {
                'type': random.choice(['status', 'transcript', 'metric']),
                'timestamp': time.time(),
                'user': user.get('sub'),
                'data': {
                    'transcript': random.choice(TRANSCRIPTS),
                    'status': random.choice(['ONLINE', 'SCANNING', 'PROCESSING', 'IDLE']),
                    'cpu': sys.cpu_percent,
                    'ram': sys.ram_percent,
                },
            }
            await websocket.send_text(json.dumps(event))
            await asyncio.sleep(3)
    except WebSocketDisconnect:
        return
