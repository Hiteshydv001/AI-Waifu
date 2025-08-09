# waifu_core/services/tts/kokoro_tts.py
import torch
import numpy as np
import soundfile as sf
import io
from pathlib import Path
from .base_tts import BaseTTSService

try:
    from kokoro import KModel, KPipeline
except ImportError:
    raise ImportError("Kokoro library not found. Please ensure it is installed.")

class KokoroTTSService(BaseTTSService):
    def __init__(self, config):
        super().__init__(config)
        self.device = self.config.get('device', 'cuda' if torch.cuda.is_available() else 'cpu')
        
        model_dir = Path(self.config['model_dir'])
        model_file = model_dir / "kokoro-v1_0.pth"
        config_file = model_dir / "config.json"

        if not model_file.exists() or not config_file.exists():
            raise FileNotFoundError(f"Kokoro model files not found in '{model_dir}'.")
            
        print(f"Loading Kokoro model weights from '{model_dir}'...")
        k_model = KModel(
            config=str(config_file),
            model=str(model_file)
        ).to(self.device).eval()
        
        print("Initializing Kokoro language pipeline...")
        self.pipeline = KPipeline(lang_code='a', model=k_model)
        print("Kokoro TTS Service Initialized and ready.")

    async def synthesize(self, text: str, emotion: str) -> bytes | None:
        print(f"🗣️  Synthesizing speech with Kokoro...")
        try:
            voice = self.config.get('voice', 'af_heart')
            audio_chunks = [seg for gs, ps, seg in self.pipeline(text, voice=voice) if seg is not None]

            if not audio_chunks:
                return None

            full_audio = np.concatenate([chunk.cpu().numpy() for chunk in audio_chunks])
            
            buffer = io.BytesIO()
            sf.write(buffer, full_audio, 24000, format='WAV', subtype='PCM_16')
            buffer.seek(0)
            return buffer.read()
        except Exception as e:
            print(f"An unexpected error occurred during Kokoro TTS synthesis: {e}")
            return None