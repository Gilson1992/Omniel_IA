import asyncio
import json
import random
import time
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

ws_router = APIRouter()

TRANSCRIPTS = [
    "Monitoring all systems...",
    "Neural network sync complete.",
    "Scanning perimeter. No threats detected.",
    "Power core at optimal levels.",
    "Satellite uplink established.",
    "Running predictive analysis...",
    "All defensive protocols active.",
    "Updating threat database...",
    "Bio-metric scan complete. Identity confirmed.",
    "Processing ambient audio feeds.",
]


@ws_router.websocket("/assistant/events")
async def websocket_events(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            event = {
                "type": random.choice(["status", "transcript", "metric"]),
                "timestamp": time.time(),
                "data": {
                    "transcript": random.choice(TRANSCRIPTS),
                    "status": random.choice(["ONLINE", "SCANNING", "PROCESSING", "IDLE"]),
                    "cpu": round(random.uniform(5.0, 85.0), 1),
                    "ram": round(random.uniform(30.0, 75.0), 1),
                },
            }
            await websocket.send_text(json.dumps(event))
            await asyncio.sleep(3)
    except WebSocketDisconnect:
        pass
