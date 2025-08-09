# waifu_core/engine.py
from waifu_core.models import LLMProvider, CharacterState
from waifu_core.services.asr_service import ASRService
from waifu_core.services.llm_service import LLMService
from waifu_core.services.memory_service import MemoryService

# --- NEW: Import specific TTS services ---
from waifu_core.services.tts.coqui_tts import CoquiTTSService
from waifu_core.services.tts.kokoro_tts import KokoroTTSService

import yaml
from pathlib import Path

SERVICE_CONFIG = yaml.safe_load(Path("config/services.yaml").read_text())
CHARACTER_CONFIG = yaml.safe_load(Path("config/character.yaml").read_text())

class ConversationEngine:
    def __init__(self):
        llm_provider = self._get_user_llm_choice()
        tts_provider = self._get_user_tts_choice() # <-- NEW
        
        self.state = CharacterState.IDLE
        self.asr_service = ASRService()
        self.llm_service = LLMService(provider=llm_provider)
        
        # --- NEW: Dynamic TTS Service Loading ---
        if tts_provider == "coqui":
            self.tts_service = CoquiTTSService(config=SERVICE_CONFIG['tts']['coqui'])
        elif tts_provider == "kokoro":
            self.tts_service = KokoroTTSService(config=SERVICE_CONFIG['tts']['kokoro'])
        else:
            raise ValueError("Invalid TTS provider selected.")
            
        self.memory_service = MemoryService()
        self.emotion_map = CHARACTER_CONFIG['emotion_map']

    def _get_user_llm_choice(self) -> LLMProvider:
        print("\n" + "="*50 + "\n Welcome to Project WaifuCore\n" + "="*50)
        prompt = "\nPlease select an LLM provider:\n  1. Groq (Fast, Cloud)\n  2. Ollama (Private, Local)\n  3. OpenAI (Paid, Cloud)\n\nEnter choice [1]: "
        while True:
            choice = input(prompt).strip() or "1"
            if choice == "1": return LLMProvider.GROQ
            if choice == "2": return LLMProvider.OLLAMA
            if choice == "3": return LLMProvider.OPENAI
            print("Invalid choice.")
    
    def _get_user_tts_choice(self) -> str:
        prompt = "\nPlease select a TTS (Voice) provider:\n  1. Coqui TTS (High-Quality Voice Cloning, requires server)\n  2. Kokoro TTS (Fast, Local Library, built-in voice)\n\nEnter choice [1]: "
        while True:
            choice = input(prompt).strip() or "1"
            if choice == "1": return "coqui"
            if choice == "2": return "kokoro"
            print("Invalid choice.")

    async def run_turn(self, audio_filepath: str | None = None, text_input: str | None = None):
        # This function's logic remains the same! The modular design pays off.
        # ... (no changes needed here, copy from your existing working version)
        self.state = CharacterState.LISTENING
        yield self.state, None, None, None
        
        if audio_filepath:
            user_input = self.asr_service.transcribe_audio(audio_filepath)
        elif text_input:
            user_input = text_input
        else:
            self.state = CharacterState.IDLE
            yield self.state, "No input received, ji.", None, "neutral"
            return
            
        if not user_input or len(user_input) < 2:
            self.state = CharacterState.IDLE
            yield self.state, "I didn't quite catch that, ji.", None, "playful"
            return

        self.state = CharacterState.THINKING
        yield self.state, None, None, None
        
        relevant_memories = self.memory_service.retrieve_relevant_memories(user_input)
        emotion, ananya_text = await self.llm_service.generate_response(user_input, relevant_memories)

        self.state = CharacterState.SPEAKING
        animation = self.emotion_map.get(emotion, self.emotion_map.get("default", {}))['animation']
        yield self.state, ananya_text, None, animation
        
        audio_output_bytes = await self.tts_service.synthesize(ananya_text, emotion)
        
        yield self.state, ananya_text, audio_output_bytes, animation
        
        new_memories = await self.llm_service.extract_memories()
        self.memory_service.add_memories(new_memories)

        self.state = CharacterState.IDLE
        yield self.state, ananya_text, audio_output_bytes, animation