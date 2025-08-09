# waifu_core/services/asr_service.py
from faster_whisper import WhisperModel
import yaml
from pathlib import Path

SERVICE_CONFIG = yaml.safe_load(Path("config/services.yaml").read_text())

class ASRService:
    def __init__(self):
        print("Initializing ASR Service...")
        self.config = SERVICE_CONFIG['asr']
        self.model = WhisperModel(
            self.config['model_size'],
            device=self.config['device'],
            compute_type=self.config['compute_type']
        )
        print("ASR Service Initialized.")

    def transcribe_audio(self, audio_filepath: str) -> str:
        """Transcribes an audio file."""
        print("🎯 Transcribing...")
        segments, _ = self.model.transcribe(audio_filepath, beam_size=5)
        transcription = " ".join([segment.text for segment in segments])
        print(f"Transcription: '{transcription.strip()}'")
        return transcription.strip()