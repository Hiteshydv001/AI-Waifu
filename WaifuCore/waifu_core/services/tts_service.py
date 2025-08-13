# waifu_core/services/tts_service.py
import yaml
from pathlib import Path
import torch
import numpy as np
import soundfile as sf
import io
import aiohttp
import asyncio
import os

# --- Kokoro Integration ---
# We now import BOTH KModel and KPipeline
try:
    from kokoro import KModel, KPipeline
except ImportError:
    KModel = None
    KPipeline = None
    print("Kokoro library not found. Kokoro TTS will be unavailable.")

# --- ElevenLabs Integration ---
try:
    import elevenlabs
    from elevenlabs.client import ElevenLabs
    ELEVENLABS_AVAILABLE = True
except ImportError:
    ELEVENLABS_AVAILABLE = False
    print("ElevenLabs library not found. Install with 'pip install elevenlabs'")

# Load configs
SERVICE_CONFIG = yaml.safe_load(Path("config/services.yaml").read_text())
CHARACTER_CONFIG = yaml.safe_load(Path("config/character.yaml").read_text())

class TTSService:
    def __init__(self):
        print("Initializing TTS Service...")
        self.config = SERVICE_CONFIG['tts']
        self.provider = self.config.get('provider', 'kokoro')
        
        print(f"TTS Provider: {self.provider}")
        
        if self.provider == 'kokoro':
            self._init_kokoro()
        elif self.provider == 'elevenlabs':
            self._init_elevenlabs()
        elif self.provider == 'coqui':
            self._init_coqui()
        else:
            raise ValueError(f"Unsupported TTS provider: {self.provider}")
        
        print("TTS Service Initialized and ready.")

    def _init_kokoro(self):
        """Initialize Kokoro TTS service"""
        if not KModel or not KPipeline:
            raise ImportError(
                "Kokoro library not found. Please run 'pip install kokoro' and ensure "
                "espeak-ng is installed on your system."
            )
            
        self.kokoro_config = self.config['kokoro']
        self.device = self.kokoro_config.get('device', 'cuda' if torch.cuda.is_available() else 'cpu')
        
        # Define paths to the model files
        model_dir = Path(self.kokoro_config['model_dir'])
        model_file = model_dir / "kokoro-v1_0.pth"
        config_file = model_dir / "config.json"

        # Check if both files exist
        if not model_file.exists() or not config_file.exists():
            raise FileNotFoundError(
                f"Kokoro model files not found in '{model_dir}'.\n"
                "Please ensure 'kokoro-v1_0.pth' and 'config.json' are present."
            )
            
        # Create the KModel instance with the file paths
        print(f"Loading Kokoro model weights from '{model_dir}'...")
        k_model = KModel(
            config=str(config_file),
            model=str(model_file)
        ).to(self.device).eval()
        
        # Create the KPipeline instance using the loaded KModel object
        print("Initializing Kokoro language pipeline...")
        self.pipeline = KPipeline(
            lang_code='a',
            model=k_model
        )

    def _init_elevenlabs(self):
        """Initialize ElevenLabs TTS service"""
        if not ELEVENLABS_AVAILABLE:
            raise ImportError(
                "ElevenLabs library not found. Please run 'pip install elevenlabs'"
            )
            
        self.elevenlabs_config = self.config['elevenlabs']
        api_key = os.getenv('ELEVENLABS_API_KEY') or self.elevenlabs_config.get('api_key')
        
        if not api_key:
            raise ValueError(
                "ElevenLabs API key not found. Set ELEVENLABS_API_KEY environment variable "
                "or add it to services.yaml"
            )
            
        self.elevenlabs_client = ElevenLabs(api_key=api_key)
        self.voice_id = self.elevenlabs_config.get('voice_id', 'Rachel')  # Default voice
        self.model_id = self.elevenlabs_config.get('model_id', 'eleven_monolingual_v1')

    def _init_coqui(self):
        """Initialize Coqui TTS service"""
        self.coqui_config = self.config['coqui']
        print(f"Coqui TTS API URL: {self.coqui_config['api_url']}")

    async def synthesize(self, text: str, emotion: str) -> bytes | None:
        """Synthesizes audio from text using the configured TTS provider."""
        print(f"🗣️  Synthesizing speech with {self.provider}...")
        
        try:
            if self.provider == 'kokoro':
                return await self._synthesize_kokoro(text, emotion)
            elif self.provider == 'elevenlabs':
                return await self._synthesize_elevenlabs(text, emotion)
            elif self.provider == 'coqui':
                return await self._synthesize_coqui(text, emotion)
            else:
                raise ValueError(f"Unknown TTS provider: {self.provider}")
                
        except Exception as e:
            print(f"An unexpected error occurred during TTS synthesis: {e}")
            import traceback
            traceback.print_exc()
            return None

    async def _synthesize_kokoro(self, text: str, emotion: str) -> bytes | None:
        """Synthesize using Kokoro TTS"""
        voice = self.kokoro_config.get('voice', 'af_heart')
        
        audio_chunks = []
        generator = self.pipeline(text, voice=voice)
        
        for i, (gs, ps, audio_segment) in enumerate(generator):
            if audio_segment is not None:
                audio_chunks.append(audio_segment)

        if not audio_chunks:
            print("Kokoro produced no audio.")
            return None

        full_audio = np.concatenate([chunk.cpu().numpy() for chunk in audio_chunks])
        
        buffer = io.BytesIO()
        sf.write(buffer, full_audio, 24000, format='WAV', subtype='PCM_16')
        buffer.seek(0)
        audio_bytes = buffer.read()
        
        print("Kokoro synthesis complete.")
        return audio_bytes

    async def _synthesize_elevenlabs(self, text: str, emotion: str) -> bytes | None:
        """Synthesize using ElevenLabs TTS"""
        try:
            # Map emotions to voice settings if needed
            voice_settings = self.elevenlabs_config.get('voice_settings', {
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
            audio_generator = self.elevenlabs_client.generate(
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

    async def _synthesize_coqui(self, text: str, emotion: str) -> bytes | None:
        """Synthesize using Coqui TTS"""
        try:
            payload = {
                'text': text,
                'language': self.coqui_config.get('language', 'en'),
                'reference_audio': self.coqui_config.get('reference_voice')
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    self.coqui_config['api_url'],
                    json=payload,
                    timeout=aiohttp.ClientTimeout(total=30)
                ) as response:
                    if response.status == 200:
                        audio_bytes = await response.read()
                        print("Coqui synthesis complete.")
                        return audio_bytes
                    else:
                        print(f"Coqui TTS API error: {response.status}")
                        return None
                        
        except Exception as e:
            print(f"Coqui synthesis error: {e}")
            return None