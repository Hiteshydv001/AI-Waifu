# web/main_web.py
import sys
from pathlib import Path
import os
import ssl

# Robust SSL certificate configuration before importing libs that use httpx/SSL
def _configure_ssl():
    bad_path = os.environ.get("SSL_CERT_FILE")
    if bad_path and not os.path.isfile(bad_path):
        # Remove invalid path so HTTP clients don't crash
        os.environ.pop("SSL_CERT_FILE", None)
    try:
        import certifi
        os.environ["SSL_CERT_FILE"] = certifi.where()
    except Exception:
        # Fallback if certifi is not available
        ssl._create_default_https_context = ssl._create_unverified_context

_configure_ssl()

import gradio as gr
import io
import soundfile as sf
import asyncio

# Add the parent directory to Python path to find waifu_core module
sys.path.append(str(Path(__file__).resolve().parent.parent))

from waifu_core.engine import ConversationEngine
from waifu_core.models import CharacterState

# --- Setup ---
engine = ConversationEngine()
audio_queue = asyncio.Queue()

# --- THIS IS THE CRITICAL FIX FOR STATIC FILES ---
# Get the absolute path to the directory containing this script
web_dir = Path(__file__).parent.resolve()
# Define the path to the static directory
static_dir = web_dir / "static"

# --- UI Layout & Logic ---
def create_ui():
    js_content = (static_dir / "js/main.js").read_text()
    js_module = f"<script type='module'>{js_content}</script>"
    css_content = (static_dir / "css/style.css").read_text()

    with gr.Blocks(theme=gr.themes.Soft(), css=css_content, title="WaifuCore - Ananya") as demo:
        ananya_state = gr.Textbox(label="Ananya State", visible=False)
        
        gr.Markdown("# Project WaifuCore")
        gr.Markdown(f"### Chat with Ananya (using {engine.llm_service.provider.value.upper()})")

        with gr.Row():
            with gr.Column(scale=2):
                gr.HTML(f"""
                    <div id="vrm-container">
                        <canvas id="vrm-canvas"></canvas>
                    </div>
                    {js_module}
                """)
            with gr.Column(scale=3):
                chatbot = gr.Chatbot(
                    label="Conversation with Ananya",
                    height=500,
                    bubble_full_width=False
                )
                audio_player = gr.Audio(visible=False, autoplay=True)
                
                with gr.Row():
                    mic_input = gr.Audio(sources=["microphone"], type="filepath", label="Speak to Ananya")
                    text_input = gr.Textbox(label="Or type your message", placeholder="Hi Ananya...", scale=3, container=False)
                
                send_button = gr.Button("Send", variant="primary")

        # --- Event Handling ---
        # ... (Your handle_turn and process_audio_queue functions are correct and do not need changes)
        async def handle_turn(audio_path, text_msg, history):
            history = history or []
            user_display_msg = text_msg if text_msg else "🎤 (You spoke)"
            history.append([user_display_msg, None])
            yield {chatbot: history, send_button: gr.Button(interactive=False)}

            turn_generator = engine.run_turn(audio_filepath=audio_path, text_input=text_msg)
            
            assistant_response_text = ""
            async for state, text, audio_bytes, animation in turn_generator:
                payload = {"state": state.value, "animation": animation}
                if text:
                    assistant_response_text = text
                    history[-1][1] = assistant_response_text
                    
                if audio_bytes:
                    await audio_queue.put(audio_bytes)
                
                yield {ananya_state: payload, chatbot: history}
            
            yield {send_button: gr.Button(interactive=True)}


        async def process_audio_queue():
            while True:
                audio_bytes = await audio_queue.get()
                data, samplerate = sf.read(io.BytesIO(audio_bytes))
                yield {audio_player: (samplerate, data)}
        
        demo.load(process_audio_queue, outputs=[audio_player])
        
        gr.on(
            triggers=[text_input.submit, send_button.click],
            fn=handle_turn,
            inputs=[mic_input, text_input, chatbot],
            outputs=[ananya_state, chatbot, send_button]
        ).then(lambda: (None, ""), outputs=[mic_input, text_input])

        ananya_state.change(
            fn=None,
            inputs=[ananya_state],
            js="""
            (payload) => {
                window.postMessage({ type: "ananya_state_update", payload: payload });
            }
            """
        )
    return demo

if __name__ == "__main__":
    app = create_ui()
    
    # --- THIS IS THE SECOND CRITICAL FIX ---
    # We explicitly tell Gradio to allow access to our static directory.
    app.queue().launch(
        share=False,
        allowed_paths=[str(static_dir)] # <-- THIS LINE IS THE FIX
    )