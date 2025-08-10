# web/main_web.py
import sys
from pathlib import Path
import os
import ssl
import asyncio
import io

# --- SSL CERT FIX ---
def _configure_ssl():
    bad_path = os.environ.get("SSL_CERT_FILE")
    if bad_path and not os.path.isfile(bad_path):
        os.environ.pop("SSL_CERT_FILE", None)
    try:
        import certifi
        os.environ["SSL_CERT_FILE"] = certifi.where()
    except Exception:
        ssl._create_default_https_context = ssl._create_unverified_context

_configure_ssl()

# --- External imports ---
import gradio as gr
from gradio import Request
import soundfile as sf
import uvicorn
from fastapi import FastAPI

# Add the parent directory to Python path
sys.path.append(str(Path(__file__).resolve().parent.parent))

from waifu_core.engine import ConversationEngine
from waifu_core.models import CharacterState, LLMProvider

# --- Session Management ---
session_engines = {}

# --- Static Files Setup ---
web_dir = Path(__file__).parent.resolve()
static_dir = web_dir / "static"

# --- UI Layout ---
def create_ui():
    js_content = (static_dir / "js/main.js").read_text(encoding="utf-8")
    js_module = f"<script type='module'>{js_content}</script>"
    css_content = (static_dir / "css/style.css").read_text(encoding="utf-8")

    with gr.Blocks(theme=gr.themes.Soft(), css=css_content, title="WaifuCore - Ananya") as demo:
        audio_queue = gr.State(asyncio.Queue())
        ananya_state = gr.Textbox(label="Ananya State", visible=False)

        gr.Markdown("# Project WaifuCore")
        gr.Markdown("### Chat with Ananya")

        with gr.Row():
            with gr.Column(scale=1):
                llm_dropdown = gr.Dropdown(
                    label="LLM Provider",
                    choices=[p.value for p in LLMProvider],
                    value=LLMProvider.GROQ.value,
                )
                tts_dropdown = gr.Dropdown(
                    label="TTS Provider",
                    choices=["coqui", "kokoro"],
                    value="coqui",
                )

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
        async def handle_turn(request: Request, queue, audio_path, text_msg, history, llm_provider, tts_provider):
            if request.session_hash not in session_engines:
                session_engines[request.session_hash] = ConversationEngine(llm_provider=LLMProvider(llm_provider), tts_provider=tts_provider)
            engine = session_engines[request.session_hash]

            history = history or []
            user_display_msg = text_msg if text_msg else "🎤 (You spoke)"
            history.append([user_display_msg, None])
            yield {chatbot: history, send_button: gr.Button(interactive=False)}

            turn_generator = engine.run_turn(audio_filepath=audio_path, text_input=text_msg)

            async for state, text, audio_bytes, animation in turn_generator:
                payload = {"state": state.value, "animation": animation}
                if text:
                    history[-1][1] = text
                if audio_bytes:
                    await queue.put(audio_bytes)

                yield {ananya_state: payload, chatbot: history}

            yield {send_button: gr.Button(interactive=True)}

        async def process_audio_queue(queue):
            while True:
                audio_bytes = await queue.get()
                data, samplerate = sf.read(io.BytesIO(audio_bytes))
                yield {audio_player: (samplerate, data)}

        demo.load(process_audio_queue, inputs=[audio_queue], outputs=[audio_player])

        gr.on(
            triggers=[text_input.submit, send_button.click],
            fn=handle_turn,
            inputs=[audio_queue, mic_input, text_input, chatbot, llm_dropdown, tts_dropdown],
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

        def update_engine(request: Request, llm, tts):
            session_engines[request.session_hash] = ConversationEngine(llm_provider=LLMProvider(llm), tts_provider=tts)

        llm_dropdown.change(fn=update_engine, inputs=[llm_dropdown, tts_dropdown], outputs=None)
        tts_dropdown.change(fn=update_engine, inputs=[llm_dropdown, tts_dropdown], outputs=None)

    return demo

# --- App Entry ---
if __name__ == "__main__":
    print("Welcome to Project WaifuCore")
    print("Select your LLM and TTS providers in the web interface.")

    demo = create_ui()

    import fastapi
    app = fastapi.FastAPI()
    app = gr.mount_gradio_app(app, demo, path="/")

    uvicorn.run(app, host="0.0.0.0", port=7860)
