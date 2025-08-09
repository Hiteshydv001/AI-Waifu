# waifu_core/services/tts/base_tts.py
from abc import ABC, abstractmethod

class BaseTTSService(ABC):
    @abstractmethod
    def __init__(self, config):
        self.config = config
        print(f"Initializing {self.__class__.__name__}...")

    @abstractmethod
    async def synthesize(self, text: str, emotion: str) -> bytes | None:
        """Takes text and returns WAV audio bytes."""
        pass