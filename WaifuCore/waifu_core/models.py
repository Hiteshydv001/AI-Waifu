# waifu_core/models.py
from pydantic import BaseModel
from enum import Enum, auto

class LLMProvider(str, Enum):
    OPENAI = "openai"
    GROQ = "groq"
    OLLAMA = "ollama"

class CharacterState(str, Enum):
    IDLE = "idle"
    LISTENING = "listening"
    THINKING = "thinking"
    SPEAKING = "speaking"