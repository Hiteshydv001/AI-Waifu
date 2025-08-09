# web/main_web.py
import sys
from pathlib import Path
import os
import ssl

# Fix SSL certificate issues on Windows
try:
    import certifi
    os.environ['SSL_CERT_FILE'] = certifi.where()
except ImportError:
    # Fallback if certifi is not available
    ssl._create_default_https_context = ssl._create_unverified_context

import gradio as gr
import io
import soundfile as sf
import asyncio

# Add the parent directory to Python path to find waifu_core module
sys.path.append(str(Path(__file__).parent.parent))

from waifu_core.engine import ConversationEngine
from waifu_core.models import CharacterState

# --- Setup ---
engine = ConversationEngine()
audio_queue = asyncio.Queue()

# --- UI Layout & Logic ---
def create_ui():
    js_content = Path("web/static/js/main.js").read_text()
    js_module = f"<script type='module'>{js_content}</script>"
    css_content = Path("web/static/css/style.css").read_text()

    with gr.Blocks(theme=gr.themes.Soft(), css=css_content, title="WaifuCore - Ananya") as demo:
        # CHANGED: Variable name from yuki_state to ananya_state
        ananya_state = gr.Textbox(label="Ananya State", visible=False)
        
        gr.Markdown("# Project WaifuCore")
        # CHANGED: UI Title
        gr.Markdown(f"### Chat with Ananya (using {engine.llm_service.provider.value.upper()})")

        with gr.Row():
            with gr.Column(scale=2):
                gr.HTML(f"""
                    <div id="vrm-container" style="width: 100%; height: 600px; position: relative;">
                        <canvas id="vrm-canvas" style="width: 100%; height: 100%;"></canvas>
                    </div>
                    <link rel="manifest" href="static/manifest.json">
                    {js_module}
                """)
            with gr.Column(scale=3):
                chatbot = gr.Chatbot(
                    # CHANGED: UI Label
                    label="Conversation with Ananya",
                    type="messages",
                    height=500
                )
                audio_player = gr.Audio(visible=False, autoplay=True)
                
                with gr.Row():
                    # CHANGED: UI Label
                    mic_input = gr.Audio(sources=["microphone"], type="filepath", label="Speak to Ananya")
                    text_input = gr.Textbox(label="Or type your message", placeholder="Hi Ananya...", scale=3)
                
                send_button = gr.Button("Send")

        # --- Event Handling ---
        async def handle_turn(audio_path, text_msg, history):
            history = history or []
            user_display_msg = text_msg if text_msg else "🎤 (You spoke)"
            # Use openai-style message format
            history.append({"role": "user", "content": user_display_msg})
            yield {chatbot: history}

            turn_generator = engine.run_turn(audio_filepath=audio_path, text_input=text_msg)
            
            assistant_response_added = False
            async for state, text, audio_bytes, animation in turn_generator:
                payload = {"state": state.value, "animation": animation}
                if text and not assistant_response_added:
                    # Add assistant response only once
                    history.append({"role": "assistant", "content": text})
                    assistant_response_added = True
                elif text and assistant_response_added:
                    # Update the existing assistant response
                    history[-1]["content"] = text
                    
                if audio_bytes:
                    await audio_queue.put(audio_bytes)
                
                # CHANGED: Output component name
                yield {ananya_state: payload, chatbot: history}

        async def process_audio_queue():
            while True:
                audio_bytes = await audio_queue.get()
                data, samplerate = sf.read(io.BytesIO(audio_bytes))
                yield {audio_player: (samplerate, data)}

        demo.load(process_audio_queue, outputs=[audio_player])
        
        send_button.click(
            handle_turn, 
            inputs=[mic_input, text_input, chatbot], 
            # CHANGED: Output component name
            outputs=[ananya_state, chatbot]
        ).then(lambda: (None, ""), outputs=[mic_input, text_input])

        # CHANGED: Linking to the new state textbox
        ananya_state.change(
            fn=None,
            inputs=[ananya_state],
            js="""
            (payload) => {
                // CHANGED: The message type sent to JS
                window.postMessage({ type: "ananya_state_update", payload: payload });
            }
            """
        )
    return demo

if __name__ == "__main__":
    app = create_ui()
    
    # Launch the app (manifest.json will be served from the web directory)
    app.queue().launch(
        share=False,
        server_name="127.0.0.1",
        server_port=7860,
        favicon_path=None
    )