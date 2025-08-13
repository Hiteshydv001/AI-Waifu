# WaifuCore/main_api.py
import sys
import uvicorn
import asyncio
import base64
from pathlib import Path
import os
import ssl

try:
    import certifi
    os.environ.pop("SSL_CERT_FILE", None)
    os.environ["SSL_CERT_FILE"] = certifi.where()
    print(f"SSL Cert File set to: {certifi.where()}")
except ImportError:
    print("Warning: 'certifi' package not found. SSL verification might fail.")

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
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

@app.get("/api/settings")
async def get_settings():
    return {"llm_providers": [p.value for p in LLMProvider], "tts_providers": ["coqui", "kokoro"]}

if __name__ == "__main__":
    print("--- Starting WaifuCore Headless API on http://localhost:8000 ---")
    uvicorn.run(app, host="0.0.0.0", port=8000)