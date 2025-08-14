# WaifuCore/main_api_simple.py - Simplified version for Railway deployment
import sys
import uvicorn
import asyncio
import base64
from pathlib import Path
import os

try:
    import certifi
    os.environ.pop("SSL_CERT_FILE", None)
    os.environ["SSL_CERT_FILE"] = certifi.where()
    print(f"SSL Cert File set to: {certifi.where()}")
except ImportError:
    print("Warning: 'certifi' package not found. SSL verification might fail.")

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

# Load environment variables
GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY") 
ELEVENLABS_API_KEY = os.environ.get("ELEVENLABS_API_KEY")
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")

print(f"Environment loaded - GROQ: {'✓' if GROQ_API_KEY else '✗'}, Gemini: {'✓' if GEMINI_API_KEY else '✗'}")

app = FastAPI(title="WaifuCore API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Simplified connection manager for Railway deployment
class SimpleConnectionManager:
    def __init__(self):
        self.active_connections: dict[WebSocket, dict] = {}
    
    async def connect(self, websocket: WebSocket, llm_provider: str, tts_provider: str):
        await websocket.accept()
        # Store connection info without heavy engine initialization
        self.active_connections[websocket] = {
            "llm": llm_provider,
            "tts": tts_provider
        }
    
    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            del self.active_connections[websocket]

manager = SimpleConnectionManager()

@app.websocket("/ws/chat")
async def websocket_endpoint(websocket: WebSocket, llm: str = 'gemini', tts: str = 'coqui'):
    await manager.connect(websocket, llm_provider=llm, tts_provider=tts)
    try:
        while True:
            data = await websocket.receive_json()
            # Simple echo response for now - replace with full engine when dependencies are available
            await websocket.send_json({
                "state": "idle",
                "animation": "neutral", 
                "text": "Hello! I'm currently running in simplified mode for Railway deployment.",
                "action": None
            })
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        print(f"Client disconnected")
    except Exception as e:
        manager.disconnect(websocket)
        print(f"Error: {e}")
        await websocket.close(code=1011, reason=f"Internal Server Error: {e}")

@app.get("/")
async def root():
    return {"message": "WaifuCore API is running!", "status": "healthy", "mode": "simplified"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "waifucore-api", "mode": "simplified"}

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
    """Get available TTS providers"""
    return ["kokoro", "coqui", "elevenlabs"]

@app.get("/api/settings")
async def get_settings():
    return {
        "llm_providers": get_available_llm_providers(), 
        "tts_providers": get_available_tts_providers()
    }

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    print(f"--- Starting WaifuCore Simplified API on port {port} ---")
    uvicorn.run(app, host="0.0.0.0", port=port)
