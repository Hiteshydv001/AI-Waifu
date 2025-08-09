# Project Ananya - AI Waifu Core

Project Ananya is an interactive, voice-driven AI companion. She listens, responds, and remembers your conversations, brought to life by a modular engine that combines state-of-the-art AI technologies. The default persona, Ananya, is a warm, witty, and culturally-aware friend who speaks a natural mix of English and Hinglish.

This project serves as an advanced framework (WaifuCore) for building personalized AI companions.

![UI Screenshot](httpskindly_provide_a_screenshot_of_the_UI_here)

---

### ✨ Features

-   **Multi-Backend LLM:** Choose your "brain" at runtime. Supports ultra-fast **Groq**, private **Ollama** (local), and powerful **OpenAI** models.
-   **Dual TTS Engines:**
    -   **Coqui TTS (XTTS v2):** For high-quality, zero-shot voice cloning from a single audio sample. This is what gives Ananya her unique voice.
    -   **Kokoro TTS:** For an extremely fast, lightweight, and fully local TTS experience with a high-quality built-in voice.
-   **Real-time Interaction:** Features a responsive Gradio UI with streaming microphone input and auto-playing audio responses.
-   **Long-Term Memory:** Ananya remembers key facts from your conversations using a ChromaDB vector store, giving her a persistent memory.
-   **Dynamic 3D Avatar:** A placeholder for a VRM 3D model with live lip-syncing that reacts when she speaks.
-   **Deeply Configurable Persona:** Ananya's entire personality, from her system prompt to her emotional responses, is defined in simple YAML configuration files.

---

### 🛠️ Tech Stack

-   **UI:** Gradio
-   **ASR (Speech-to-Text):** faster-whisper
-   **TTS (Text-to-Speech):** Coqui TTS or Kokoro TTS
-   **LLM (Language Model):** Groq / Ollama / OpenAI
-   **Memory:** ChromaDB

---

### 📂 Project Structure

-   `config/`: All project configuration.
    -   `character.yaml`: Defines Ananya's persona, system prompt, and memory extraction rules.
    -   `services.yaml`: Holds API keys and configurations for all backend services.
-   `waifu_core/`: The core Python application package.
    -   `engine.py`: The central orchestrator that manages the conversation flow.
    -   `services/`: Modular classes for each AI service (ASR, LLM, Memory, and the swappable TTS engines).
-   `web/`: The Gradio frontend application.
    -   `main_web.py`: The entry point for the web UI.
    -   `static/`: Contains the 3D model (`ananya.vrm`), JavaScript for the viewer, and CSS.
-   `assets/character_voices/`: Contains the reference audio file (`.wav`) used by Coqui TTS for voice cloning.
-   `models/kokoro/`: (Local Only) Contains the downloaded Kokoro TTS model files.

---

### 🚀 Getting Started

#### Prerequisites

-   Python `3.11` is strongly recommended. (3.10 and 3.12 are okay, but 3.13+ may have package compatibility issues).
-   An NVIDIA GPU with CUDA is highly recommended for good performance.
-   (For Kokoro) `espeak-ng` system dependency.
    -   On Debian/Ubuntu: `sudo apt-get update && sudo apt-get install espeak-ng`
    -   On Windows: [Download and run the installer](https://github.com/espeak-ng/espeak-ng/releases).

#### Installation

1.  **Clone the Repository:**
    ```bash
    git clone <your-repo-url>
    cd hiteshydv001-ai-waifu
    ```

2.  **Create and Activate a Virtual Environment:**
    ```powershell
    # Windows
    python -m venv venv
    .\venv\Scripts\Activate.ps1
    ```
    ```bash
    # Linux / macOS
    python3 -m venv venv
    source venv/bin/activate
    ```

3.  **Install Dependencies:**
    ```bash
    pip install --upgrade pip
    pip install -r requirements.txt
    ```

#### Configuration

Before running, configure your services in `config/services.yaml`:

1.  **API Keys:** Fill in your `groq_api_key` and/or `openai_api_key` if you plan to use them.
2.  **ASR Device:** By default, ASR (`faster-whisper`) is set to use `cuda`. If you do not have an NVIDIA GPU, change it to CPU mode:
    ```yaml
    asr:
      device: "cpu"
      compute_type: "int8"
    ```
3.  **TTS Setup:**
    *   **For Coqui TTS (Voice Cloning):** Make sure you have a high-quality, short `.wav` file in `assets/character_voices/`. The default is `ananya_reference.wav`. Update the path in `services.yaml` if you use a different name.
    *   **For Kokoro TTS:** Download the model files (`kokoro-v1_0.pth` and `config.json`) from [Hugging Face](https://huggingface.co/hexgrad/Kokoro-82M/tree/main) and place them in the `models/kokoro/` directory.

#### Running the Application

1.  **Start Local Services (If using Ollama):**
    *   Make sure your Ollama server is running. In a separate terminal, run: `ollama serve`.
    *   Ensure you have pulled the model specified in the config: `ollama pull llama3`.

2.  **Launch the Main Application:**
    *   Make sure you are in the project's root directory (`hiteshydv001-ai-waifu`) and your `(venv)` is active.
    *   Run the app as a module:
        ```bash
        python -m WaifuCore.web.main_web
        ```

3.  **Choose Your Backends:**
    *   The application will prompt you in the terminal to select your desired LLM and TTS provider for the session.

4.  **Open the UI:**
    *   Open your web browser and navigate to the URL shown in the terminal (usually `http://127.0.0.1:7860`).

---

### 🎨 Customization

-   **Change the Persona:** Edit `config/character.yaml` to change Ananya's name, system prompt, and personality.
-   **Change the Voice:**
    -   **Coqui:** Replace the file in `assets/character_voices/` with a sample of your desired voice and update the path in `services.yaml`.
    -   **Kokoro:** Change the `voice` key in `services.yaml` to any of the built-in voices (e.g., `af_bella`, `am_michael`).
-   **Change the Avatar:** Replace the `ananya.vrm` file in `web/static/vrm/` with your own VRM model, which you can create for free using [VRoid Studio](https://vroid.com/en/studio).

---

### 📜 License

This project is open-source. Please check the licenses of the respective AI models and libraries used.