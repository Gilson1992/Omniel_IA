from core.config import get_settings
from services.llm.base import LLMClient
from services.llm.mock_client import MockLLMClient
from services.llm.openai_client import OpenAILLMClient


def get_llm_client() -> LLMClient:
    settings = get_settings()
    if settings.openai_api_key:
        try:
            return OpenAILLMClient()
        except RuntimeError:
            return MockLLMClient()
    return MockLLMClient()
