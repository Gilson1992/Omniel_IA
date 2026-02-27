from typing import Any, List, Optional

from pydantic import BaseModel, Field


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = 'bearer'


class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None


class Action(BaseModel):
    type: str
    payload: Any = None


class ChatResponse(BaseModel):
    reply: str
    actions: List[Action] = Field(default_factory=list)
    session_id: str
    source: str = 'llm'


class WeatherResponse(BaseModel):
    location: str
    temperature: float
    condition: str
    humidity: int
    wind_speed: float
    icon: str


class SystemResponse(BaseModel):
    cpu_percent: float
    ram_percent: float
    ram_used_gb: float
    ram_total_gb: float
    disk_percent: float
    disk_used_gb: float
    disk_total_gb: float
    uptime_seconds: int
    status: str


class Citation(BaseModel):
    document_id: int
    chunk_id: int
    chunk_index: int
    snippet: str


class KnowledgeQueryRequest(BaseModel):
    question: str
    top_k: int = 5


class KnowledgeQueryResponse(BaseModel):
    answer: str
    citations: List[Citation]


class IngestResponse(BaseModel):
    document_id: int
    status: str
    chunks: int = 0
    job_id: Optional[str] = None
