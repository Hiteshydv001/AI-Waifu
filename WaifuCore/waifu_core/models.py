# waifu_core/models.py
from pydantic import BaseModel
from enum import Enum, auto

class LLMProvider(str, Enum):
    GEMINI = "gemini"
    GROQ_LLAMA3_8B = "groq-llama3-8b-8192"
    GROQ_LLAMA3_70B = "groq-llama3-70b-8192"
    GROQ_MIXTRAL = "groq-mixtral-8x7b-32768"
    GROQ_GEMMA = "groq-gemma-7b-it"
    GROQ_LLAMA3_1_8B = "groq-llama-3.1-8b-instant"
    GROQ_LLAMA3_1_70B = "groq-llama-3.1-70b-versatile"
    OLLAMA = "ollama"

class CharacterState(str, Enum):
    IDLE = "idle"
    LISTENING = "listening"
    THINKING = "thinking"
    SPEAKING = "speaking"