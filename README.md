## AI Waifu (WaifuCore) – Ananya

An interactive AI companion with voice and text, built around a modular engine that stitches together:

- **LLM**: OpenAI, Groq (OpenAI-compatible), or local Ollama
- **ASR**: faster-whisper for speech-to-text
- **TTS**: Coqui TTS (voice cloning) or Kokoro TTS (fast, high‑quality built-in voices)
- **Memory**: ChromaDB for long‑term, retrievable memories
- **UI**: Gradio web app with a 3D avatar hook

The default character is **Ananya**, a warm, witty, Hinglish-speaking companion.

---

### Features
- **Choice of LLM** at runtime: Groq, Ollama, or OpenAI
- **Two TTS backends**: Coqui XTTS (voice cloning) or Kokoro (fast local synthesis)
- **Streaming UI** with mic input and auto‑playing TTS output
- **Long‑term memory** via ChromaDB and conversation history persistence
- **Config‑driven** behaviors and persona in `WaifuCore/config/*.yaml`

---

### Repository Layout
- `WaifuCore/web/main_web.py` – Gradio app entrypoint
- `WaifuCore/waifu_core/engine.py` – Conversation loop and service wiring
- `WaifuCore/waifu_core/services/*` – ASR, LLM, Memory, TTS services
- `WaifuCore/config/services.yaml` – API keys and service configs
- `WaifuCore/config/character.yaml` – Persona, memory extraction prompt, emotion→animation map
- `WaifuCore/models/kokoro/` – Kokoro model weights (not committed; see setup)
- `WaifuCore/assets/character_voices/` – Reference voice for Coqui

---

### Prerequisites
- Python 3.10–3.12 recommended (3.13 can have package issues; `numpy` is pinned out in `requirements.txt`)
- Windows, macOS, or Linux
- (Optional, GPU) NVIDIA CUDA for faster Whisper and TTS

TTS extras:
- **Kokoro**: Requires the Kokoro model files present locally
- **Coqui TTS (XTTS v2)**: Downloads automatically via the library; a single reference voice WAV is required for cloning

---

### Installation
1) Clone and open the project

```powershell
git clone https://github.com/<your-username>/<your-repo>.git
cd "AI Girlie"
```

2) Create a virtual environment and install dependencies

```powershell
cd WaifuCore
python -m venv venv
venv\Scripts\activate
pip install --upgrade pip
pip install -r requirements.txt
```

Notes (Windows):
- If `pyaudio` fails to install, try: `pip install pipwin` then `pipwin install pyaudio`.
- If you do not have CUDA, set ASR to CPU in `config/services.yaml`:
  - `asr.device: "cpu"`
  - `asr.compute_type: "int8"`

---

### Configuration
Edit `WaifuCore/config/services.yaml`:

- **API keys**
  - `openai_api_key`: set if using OpenAI
  - `groq_api_key`: set if using Groq (OpenAI-compatible endpoint)
  - Ollama requires no key but needs the local server running at `http://localhost:11434`

- **LLM**
  - Default models are set for each provider. You’ll choose the provider at runtime in the terminal.

- **ASR (faster-whisper)**
  - `model_size`: base/small/medium/large-v3
  - `device`: `cuda` or `cpu`
  - `compute_type`: `float16` (GPU) or `int8` (CPU)

- **Memory (ChromaDB)**
  - `db_path`: defaults to `waifu_core/local_db` inside `WaifuCore`

- **TTS**
  - `tts.coqui.reference_voice`: path to a single WAV file used for voice cloning
  - `tts.kokoro.model_dir`: folder with Kokoro model files
  - `tts.kokoro.voice`: e.g., `af_heart`

Edit `WaifuCore/config/character.yaml` to customize Ananya’s persona, memory extraction prompt, and emotion→animation mapping.

---

### TTS Backends
- **Kokoro (fast local TTS)**
  - Place the model files in `WaifuCore/models/kokoro/`:
    - `kokoro-v1_0.pth`
    - `config.json`
  - These files are large and are intentionally not tracked in Git. The code will error with a clear message if they’re missing.

- **Coqui TTS (XTTS v2, voice cloning)**
  - Ensure you have a reference voice WAV at `WaifuCore/assets/character_voices/ananya_happy.wav` (or update the path in `services.yaml`).
  - The library will download model files on first use. You can also prefetch using:
    ```powershell
    python download_tts_model.py
    ```

---

### Running the App
1) Activate your venv and ensure dependencies are installed

2) Start the Gradio UI (run from inside `WaifuCore` so relative paths resolve):

```powershell
cd WaifuCore
venv\Scripts\activate
python web/main_web.py
```

3) On launch, choose the LLM and TTS provider in the terminal prompts.

4) Open the app at `http://127.0.0.1:7860`.

You can speak via the mic or type messages. The assistant replies with text and synthesized speech. Conversation history is saved at `waifu_core/conversation_history_ananya.json`. Long‑term memory is stored in Chroma at `waifu_core/local_db`.

---

### Ollama (Local LLM)
- Install Ollama and start the server: `ollama serve`
- Pull a model that matches your config (e.g., `ollama pull llama3`)
- Keep `services.yaml` LLM settings as provided; the app uses an OpenAI‑compatible client with `base_url` pointing to Ollama.

---

### Troubleshooting
- **Large model files in Git**: Large Kokoro model files are intentionally ignored. Keep them local under `WaifuCore/models/kokoro/`.
- **ASR too slow / high VRAM**: Switch to `asr.device: cpu` and `compute_type: int8`. Try a smaller `model_size`.
- **No CUDA**: Set ASR to CPU and use Kokoro/Coqui on CPU (slower). The app detects CUDA where possible.
- **PyAudio install fails (Windows)**: Use `pipwin install pyaudio`.
- **Ollama not responding**: Ensure `ollama serve` is running and the model is pulled. The base URL is `http://localhost:11434/v1`.
- **Cert issues on Windows**: The web app sets `SSL_CERT_FILE` using `certifi` if available, or falls back to unverified SSL context.

---

### Security
- Do not commit your API keys. They live in `WaifuCore/config/services.yaml` locally.

---

### License and Credits
- Built with OpenAI/Groq/Ollama, faster‑whisper, Kokoro, Coqui TTS, ChromaDB, and Gradio.
- Character and UI assets are placeholders; replace with your own as needed.

