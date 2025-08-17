# WaifuCore/main_api.py
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

sys.path.append(str(Path(__file__).resolve().parent.parent))

from waifu_core.engine import ConversationEngine
from waifu_core.models import LLMProvider

app = FastAPI(title="WaifuCore API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[WebSocket, ConversationEngine] = {}
    async def connect(self, websocket: WebSocket, llm_provider: str, tts_provider: str):
        await websocket.accept()
        engine = ConversationEngine(llm_provider=LLMProvider(llm_provider), tts_provider=tts_provider)
        self.active_connections[websocket] = engine
    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections: del self.active_connections[websocket]
    def get_engine(self, websocket: WebSocket) -> ConversationEngine:
        return self.active_connections[websocket]

manager = ConnectionManager()

@app.websocket("/ws/chat")
async def websocket_endpoint(websocket: WebSocket, llm: str = 'gemini', tts: str = 'coqui'):
    await manager.connect(websocket, llm_provider=llm, tts_provider=tts)
    try:
        while True:
            data = await websocket.receive_json()
            engine = manager.get_engine(websocket)
            input_type = data.get("type")
            payload = data.get("payload")
            text_input = None
            audio_filepath = None
            if input_type == "text": text_input = payload
            elif input_type == "audio":
                audio_bytes = base64.b64decode(payload)
                temp_dir = Path("temp_audio"); temp_dir.mkdir(exist_ok=True)
                temp_audio_path = temp_dir / "user_audio.wav"
                with open(temp_audio_path, "wb") as f: f.write(audio_bytes)
                audio_filepath = str(temp_audio_path)
            
            async for state, text, audio_bytes, animation, action in engine.run_turn(audio_filepath=audio_filepath, text_input=text_input):
                # Send the main payload with text, state, etc.
                response = {"state": state.value, "animation": animation, "text": text, "action": action}
                if text is not None or action is not None:
                    await websocket.send_json(response)

                # If audio is ready, send it in a separate, dedicated message
                if audio_bytes:
                    audio_b64 = base64.b64encode(audio_bytes).decode('utf-8')
                    # This message also contains the correct animation for the audio
                    await websocket.send_json({"audio": audio_b64, "animation": animation})
                    # This tiny sleep is crucial for preventing network packet merging
                    await asyncio.sleep(0.01)

    except WebSocketDisconnect:
        manager.disconnect(websocket)
        print(f"Client disconnected: {websocket.client.host}")
    except Exception as e:
        manager.disconnect(websocket)
        import traceback
        traceback.print_exc()
        await websocket.close(code=1011, reason=f"Internal Server Error: {e}")

def get_available_llm_providers():
    """Get available LLM providers with user-friendly names"""
    return [
        {"value": "gemini", "label": "Gemini 1.5 Flash"},
        {"value": "groq-llama3-8b-8192", "label": "Llama 3 8B (Groq)"},
        {"value": "groq-llama3-70b-8192", "label": "Llama 3 70B (Groq)"},
        {"value": "groq-mixtral-8x7b-32768", "label": "Mixtral 8x7B (Groq)"},
        {"value": "groq-gemma-7b-it", "label": "Gemma 7B (Groq)"},
        {"value": "groq-llama-3.1-8b-instant", "label": "Llama 3.1 8B Instant (Groq)"},
        {"value": "groq-llama-3.1-70b-versatile", "label": "Llama 3.1 70B Versatile (Groq)"},
        {"value": "ollama", "label": "Ollama (Local)"}
    ]

def get_available_tts_providers():
    """Get available TTS providers based on installed dependencies and configuration"""
    providers = []
    
    # Always include kokoro as it's the default
    providers.append("kokoro")
    
    # Check if Coqui TTS is available
    providers.append("coqui")
    
    # Check if ElevenLabs is available
    try:
        import elevenlabs
        from waifu_core.services.tts.elevenlabs_tts import ElevenLabsTTSService
        providers.append("elevenlabs")
    except ImportError:
        print("ElevenLabs TTS provider is not available")
        pass
    
    return providers

@app.get("/")
async def root():
    welcome_message = {
        "message": "Welcome to WaifuCore API! 🎉",
        "status": "healthy",
        "version": "1.0.0",
        "description": "An AI-powered waifu chat companion with voice synthesis",
        "endpoints": {
            "/": "This welcome page",
            "/docs": "API documentation (Swagger UI)",
            "/health": "Health check endpoint",
            "/api/settings": "Available LLM and TTS providers",
            "/ws/chat": "WebSocket endpoint for real-time chat"
        },
        "features": [
            "Real-time chat with AI waifu",
            "Voice synthesis with multiple providers",
            "Multiple LLM backends (Gemini, Groq, etc.)",
            "WebSocket-based communication",
            "Voice input support"
        ],
        "github": "https://github.com/Hiteshydv001/AI-Waifu"
    }
    return welcome_message

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "waifucore-api"}

@app.get("/api/settings")
async def get_settings():
    return {
        "llm_providers": get_available_llm_providers(), 
        "tts_providers": get_available_tts_providers()
    }

# --- ADD THIS SECTION AT THE END OF THE FILE ---
# This must be LAST, as it's a catch-all route.
# It serves the static files (HTML, JS, CSS) from the 'static' directory.
try:
    app.mount("/", StaticFiles(directory="static", html=True), name="static")
except RuntimeError:
    print("Static files directory not found, skipping mount. This is expected during local dev if you haven't built the frontend.")

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    print(f"--- Starting WaifuCore Headless API on port {port} ---")
    uvicorn.run(app, host="0.0.0.0", port=port)