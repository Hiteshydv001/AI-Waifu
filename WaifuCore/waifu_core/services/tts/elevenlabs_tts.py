# waifu_core/services/tts/elevenlabs_tts.py
import os
from .base_tts import BaseTTSService

try:
    import elevenlabs
    from elevenlabs.client import ElevenLabs
    ELEVENLABS_AVAILABLE = True
except ImportError:
    ELEVENLABS_AVAILABLE = False
    # Don't raise an error here - let the class handle it

class ElevenLabsTTSService(BaseTTSService):
    def __init__(self, config):
        super().__init__(config)
        
        if not ELEVENLABS_AVAILABLE:
            raise ImportError(
                "ElevenLabs library not found. Please run 'pip install elevenlabs'"
            )
            
        api_key = (
            os.getenv('ELEVENLABS_API_KEY') or 
            os.getenv('elven_lab_api_key') or 
            self.config.get('api_key')
        )
        
        if not api_key:
            raise ValueError(
                "ElevenLabs API key not found. Set ELEVENLABS_API_KEY or elven_lab_api_key environment variable "
                "or add it to services.yaml"
            )
            
        self.client = ElevenLabs(api_key=api_key)
        self.voice_id = self.config.get('voice_id', 'Rachel')  # Default voice
        self.model_id = self.config.get('model_id', 'eleven_monolingual_v1')
        
        print("ElevenLabs TTS Service Initialized and ready.")

    async def synthesize(self, text: str, emotion: str) -> bytes | None:
        print(f"🗣️  Synthesizing speech with ElevenLabs...")
        try:
            # Map emotions to voice settings if needed
            voice_settings = self.config.get('voice_settings', {
                'stability': 0.75,
                'similarity_boost': 0.75,
                'style': 0.0,
                'use_speaker_boost': True
            })
            
            # Adjust voice settings based on emotion
            if emotion == 'happy':
                voice_settings['style'] = 0.3
            elif emotion == 'sad':
                voice_settings['style'] = -0.3
            elif emotion == 'excited':
                voice_settings['style'] = 0.5
            
            # Generate audio using ElevenLabs
            audio_generator = self.client.generate(
                text=text,
                voice=self.voice_id,
                model=self.model_id,
                voice_settings=elevenlabs.VoiceSettings(**voice_settings)
            )
            
            # Convert generator to bytes
            audio_bytes = b''.join(audio_generator)
            
            print("ElevenLabs synthesis complete.")
            return audio_bytes
            
        except Exception as e:
            print(f"ElevenLabs synthesis error: {e}")
            return None
