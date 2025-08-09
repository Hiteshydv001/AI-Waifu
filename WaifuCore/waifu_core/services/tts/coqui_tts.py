# waifu_core/services/tts/coqui_tts.py
import torch
import numpy as np
import soundfile as sf
import io
from pathlib import Path
from .base_tts import BaseTTSService

try:
    # This is the official, high-level API for Coqui TTS
    from TTS.api import TTS
except ImportError:
    raise ImportError("Coqui TTS library not found. Please ensure it is correctly placed in site-packages.")

class CoquiTTSService(BaseTTSService):
    def __init__(self, config):
        super().__init__(config)
        self.reference_voice_path = config['reference_voice']
        
        if not Path(self.reference_voice_path).exists():
            raise FileNotFoundError(f"Coqui reference voice not found at: {self.reference_voice_path}")

        # --- Official Direct Integration Logic from README ---
        model_name = "tts_models/multilingual/multi-dataset/xtts_v2"
        device = "cuda" if torch.cuda.is_available() else "cpu"
        print(f"Loading Coqui TTS model '{model_name}' onto device '{device}'...")
        
        # This loads the model directly into this application's memory
        self.model = TTS(model_name).to(device)
        
        print("Coqui TTS Service Initialized and model loaded directly via API.")

    async def synthesize(self, text: str, emotion: str) -> bytes | None:
        print(f"🗣️  Synthesizing speech with Coqui TTS (Direct API Call)...")
        
        try:
            # The .tts() method is the core function for synthesis.
            # It correctly handles the `speaker_wav` argument for voice cloning.
            wav_array = self.model.tts(
                text=text,
                speaker_wav=self.reference_voice_path,
                language=self.config.get('language', 'en')
            )

            if not isinstance(wav_array, list) or len(wav_array) == 0:
                print("TTS synthesis did not return a valid audio array.")
                return None

            # Convert list of floats to a NumPy array for saving
            wav_np = np.array(wav_array, dtype=np.float32)

            # Convert numpy array to WAV bytes in memory
            buffer = io.BytesIO()
            # The API object provides the correct sample rate
            sf.write(buffer, wav_np, self.model.synthesizer.output_sample_rate, format='WAV', subtype='PCM_16')
            buffer.seek(0)
            audio_bytes = buffer.read()
            
            print("Synthesis complete.")
            return audio_bytes

        except Exception as e:
            print(f"An unexpected error occurred during Coqui TTS synthesis: {e}")
            import traceback
            traceback.print_exc()
            return None