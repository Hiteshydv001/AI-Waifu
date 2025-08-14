# waifu_core/engine.py
import re
from waifu_core.models import LLMProvider, CharacterState
from waifu_core.services.asr_service import ASRService
from waifu_core.services.llm_service import LLMService
from waifu_core.services.memory_service import MemoryService
from waifu_core.services.tts.coqui_tts import CoquiTTSService
from waifu_core.services.tts.kokoro_tts import KokoroTTSService

# Try to import ElevenLabs TTS service, handle import error gracefully
try:
    from waifu_core.services.tts.elevenlabs_tts import ElevenLabsTTSService
    ELEVENLABS_AVAILABLE = True
except ImportError as e:
    print(f"ElevenLabs TTS service unavailable: {e}")
    ELEVENLABS_AVAILABLE = False

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
        elif tts_provider.lower() == "elevenlabs":
            if ELEVENLABS_AVAILABLE:
                self.tts_service = ElevenLabsTTSService(config=SERVICE_CONFIG['tts']['elevenlabs'])
            else:
                raise ValueError(f"ElevenLabs TTS provider is not available. Please install the 'elevenlabs' package.")
        else:
            raise ValueError(f"Invalid TTS provider selected: {tts_provider}")
            
        self.memory_service = MemoryService()
        self.emotion_map = CHARACTER_CONFIG['emotion_map']

    def _clean_text_for_tts(self, text: str) -> str:
        """Removes bracketed/asterisked actions and expressions for clean TTS input."""
        # This regex now correctly handles multi-word actions.
        cleaned_text = re.sub(r'[\*\(\[].*?[\*\)\]]', '', text)
        return " ".join(cleaned_text.split())

    async def run_turn(self, audio_filepath: str | None = None, text_input: str | None = None):
        # The generator now yields 5 values: state, text, audio, animation, action
        self.state = CharacterState.LISTENING
        yield self.state, None, None, None, None
        
        if audio_filepath:
            user_input = self.asr_service.transcribe_audio(audio_filepath)
        elif text_input:
            user_input = text_input
        else:
            self.state = CharacterState.IDLE
            yield self.state, "No input received, ji.", None, "neutral", None
            return
            
        if not user_input or len(user_input) < 2:
            self.state = CharacterState.IDLE
            yield self.state, "I didn't quite catch that, ji.", None, "playful", None
            return

        self.state = CharacterState.THINKING
        yield self.state, None, None, "thinking", None
        
        relevant_memories = self.memory_service.retrieve_relevant_memories(user_input)
        # LLM service now returns emotion, action, and text
        emotion, action, ananya_text_raw = await self.llm_service.generate_response(user_input, relevant_memories)

        ananya_text_for_tts = self._clean_text_for_tts(ananya_text_raw)
        ananya_text_for_ui = ananya_text_raw

        self.state = CharacterState.SPEAKING
        animation = self.emotion_map.get(emotion, self.emotion_map.get("default", {}))['animation']
        
        # Yield the action along with other state
        yield self.state, ananya_text_for_ui, None, animation, action
        
        audio_output_bytes = await self.tts_service.synthesize(ananya_text_for_tts, emotion)
        
        yield self.state, ananya_text_for_ui, audio_output_bytes, animation, action
        
        new_memories = await self.llm_service.extract_memories()
        self.memory_service.add_memories(new_memories)

        self.state = CharacterState.IDLE
        yield self.state, ananya_text_for_ui, audio_output_bytes, animation, action