# waifu_core/services/tts_service.py
import yaml
from pathlib import Path
import torch
import numpy as np
import soundfile as sf
import io

# --- Kokoro Integration ---
# We now import BOTH KModel and KPipeline
try:
    from kokoro import KModel, KPipeline
except ImportError:
    raise ImportError(
        "Kokoro library not found. Please run 'pip install kokoro' and ensure "
        "espeak-ng is installed on your system."
    )

# Load configs
SERVICE_CONFIG = yaml.safe_load(Path("config/services.yaml").read_text())
CHARACTER_CONFIG = yaml.safe_load(Path("config/character.yaml").read_text())

class TTSService:
    def __init__(self):
        print("Initializing TTS Service (Kokoro)...")
        self.config = SERVICE_CONFIG['tts']
        
        if self.config.get('provider') != 'kokoro':
            raise ValueError("TTS provider in services.yaml is not set to 'kokoro'")

        self.kokoro_config = self.config['kokoro']
        self.device = self.kokoro_config.get('device', 'cuda' if torch.cuda.is_available() else 'cpu')
        
        # --- THIS IS THE FINAL, CORRECTED INITIALIZATION LOGIC ---

        # 1. Define paths to the model files
        model_dir = Path(self.kokoro_config['model_dir'])
        model_file = model_dir / "kokoro-v1_0.pth"
        config_file = model_dir / "config.json"

        # 2. Check if both files exist
        if not model_file.exists() or not config_file.exists():
            raise FileNotFoundError(
                f"Kokoro model files not found in '{model_dir}'.\n"
                "Please ensure 'kokoro-v1_0.pth' and 'config.json' are present."
            )
            
        # 3. Step 1: Create the KModel instance with the file paths
        print(f"Loading Kokoro model weights from '{model_dir}'...")
        k_model = KModel(
            config=str(config_file),  # The 'config' parameter takes the config file path
            model=str(model_file)     # The 'model' parameter takes the model file path
        ).to(self.device).eval()
        
        # 4. Step 2: Create the KPipeline instance using the loaded KModel object
        # The voice 'af_heart' is American English, which corresponds to lang_code 'a'.
        print("Initializing Kokoro language pipeline...")
        self.pipeline = KPipeline(
            lang_code='a',
            model=k_model
        )
        print("Kokoro TTS Service Initialized and ready.")

    async def synthesize(self, text: str, emotion: str) -> bytes | None:
        """Synthesizes audio from text using the Kokoro library directly."""
        print(f"🗣️  Synthesizing speech with Kokoro...")
        
        try:
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
            
            print("Synthesis complete.")
            return audio_bytes

        except Exception as e:
            print(f"An unexpected error occurred during Kokoro TTS synthesis: {e}")
            import traceback
            traceback.print_exc()
            return None