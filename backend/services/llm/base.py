from abc import ABC, abstractmethod
from typing import Iterable


class LLMClient(ABC):
    @abstractmethod
    def generate(self, messages: list[dict[str, str]]) -> str:
        raise NotImplementedError

    @abstractmethod
    def stream(self, messages: list[dict[str, str]]) -> Iterable[str]:
        raise NotImplementedError

    @property
    @abstractmethod
    def source(self) -> str:
        raise NotImplementedError
