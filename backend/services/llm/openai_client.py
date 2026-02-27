from collections.abc import Iterable

from core.config import get_settings
from services.llm.base import LLMClient


class OpenAILLMClient(LLMClient):
    def __init__(self) -> None:
        settings = get_settings()
        self._model = settings.openai_chat_model
        try:
            from openai import OpenAI
        except ImportError as exc:
            raise RuntimeError('openai dependency missing') from exc
        self._client = OpenAI(api_key=settings.openai_api_key)

    @property
    def source(self) -> str:
        return 'openai'

    def generate(self, messages: list[dict[str, str]]) -> str:
        resp = self._client.chat.completions.create(model=self._model, messages=messages)
        return resp.choices[0].message.content or ''

    def stream(self, messages: list[dict[str, str]]) -> Iterable[str]:
        stream = self._client.chat.completions.create(model=self._model, messages=messages, stream=True)
        for chunk in stream:
            delta = chunk.choices[0].delta.content
            if delta:
                yield delta
