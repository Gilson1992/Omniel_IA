from collections.abc import Iterable

from services.llm.base import LLMClient


class MockLLMClient(LLMClient):
    @property
    def source(self) -> str:
        return 'mock'

    def generate(self, messages: list[dict[str, str]]) -> str:
        last = messages[-1]['content'] if messages else 'Hello'
        return f'[MOCK MODE] Received: {last}. Configure OPENAI_API_KEY for real LLM responses.'

    def stream(self, messages: list[dict[str, str]]) -> Iterable[str]:
        text = self.generate(messages)
        for token in text.split(' '):
            yield token + ' '
