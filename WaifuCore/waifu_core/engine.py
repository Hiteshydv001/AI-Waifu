# waifu_core/engine.py
import re # <-- ADD THIS IMPORT
from waifu_core.models import LLMProvider, CharacterState
from waifu_core.services.asr_service import ASRService
from waifu_core.services.llm_service import LLMService
from waifu_core.services.memory_service import MemoryService
from waifu_core.services.tts.coqui_tts import CoquiTTSService
from waifu_core.services.tts.kokoro_tts import KokoroTTSService
import yaml
from pathlib import Path

SERVICE_CONFIG = yaml.safe_load(Path("config/services.yaml").read_text())
CHARACTER_CONFIG = yaml.safe_load(Path("config/character.yaml").read_text())

class ConversationEngine:
    def __init__(self, llm_provider: LLMProvider, tts_provider: str):
        print(f"--- Creating ConversationEngine with LLM: {llm_provider.value}, TTS: {tts_provider} ---")
        self.state = CharacterState.IDLE
        self.asr_service = ASRService()
        self.llm_service = LLMService(provider=llm_provider)
        
        if tts_provider.lower() == "coqui":
            self.tts_service = CoquiTTSService(config=SERVICE_CONFIG['tts']['coqui'])
        elif tts_provider.lower() == "kokoro":
            self.tts_service = KokoroTTSService(config=SERVICE_CONFIG['tts']['kokoro'])
        else:
            raise ValueError(f"Invalid TTS provider selected: {tts_provider}")
            
        self.memory_service = MemoryService()
        self.emotion_map = CHARACTER_CONFIG['emotion_map']

    def _clean_text_for_tts(self, text: str) -> str:
        """Removes bracketed actions and asterisks from text for clean TTS input."""
        cleaned_text = re.sub(r'[\*\(\[]\w+[\*\)\]]', '', text)
        return " ".join(cleaned_text.split())

    async def run_turn(self, audio_filepath: str | None = None, text_input: str | None = None):
        # ... (listening and thinking parts are unchanged)
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
        emotion, ananya_text_raw = await self.llm_service.generate_response(user_input, relevant_memories)

        # --- MODIFICATION HERE ---
        # 1. Clean the text before sending it to the TTS
        ananya_text_for_tts = self._clean_text_for_tts(ananya_text_raw)

        # 2. The chatbot UI should still show the full, expressive text with actions
        ananya_text_for_ui = ananya_text_raw

        self.state = CharacterState.SPEAKING
        animation = self.emotion_map.get(emotion, self.emotion_map.get("default", {}))['animation']
        # Show the full expressive text in the UI
        yield self.state, ananya_text_for_ui, None, animation
        
        # Synthesize audio using only the cleaned text
        audio_output_bytes = await self.tts_service.synthesize(ananya_text_for_tts, emotion)
        
        yield self.state, ananya_text_for_ui, audio_output_bytes, animation
        
        # ... (memory extraction and idle state parts are unchanged)
        new_memories = await self.llm_service.extract_memories()
        self.memory_service.add_memories(new_memories)

        self.state = CharacterState.IDLE
        yield self.state, ananya_text_for_ui, audio_output_bytes, animation