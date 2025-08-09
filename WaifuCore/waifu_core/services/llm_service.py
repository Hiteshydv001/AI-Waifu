# waifu_core/services/llm_service.py
import json
import re
import os
from pathlib import Path
from openai import AsyncOpenAI
from waifu_core.models import LLMProvider
import yaml
import ast

SERVICE_CONFIG = yaml.safe_load(Path("config/services.yaml").read_text())
CHARACTER_CONFIG = yaml.safe_load(Path("config/character.yaml").read_text())


def _load_dotenv_if_present() -> None:
    """Lightweight .env loader (no extra dependency).

    Looks for a .env in WaifuCore/ or repo root and exports vars that are not already set.
    """
    candidate_paths = [
        Path("WaifuCore/.env"),
        Path(".env"),
        Path(__file__).resolve().parents[2] / ".env",  # repo root
        Path(__file__).resolve().parents[1] / ".env",  # WaifuCore/.env
    ]
    for env_path in candidate_paths:
        try:
            if env_path.exists():
                for line in env_path.read_text(encoding="utf-8").splitlines():
                    line = line.strip()
                    if not line or line.startswith("#"):
                        continue
                    if "=" not in line:
                        continue
                    key, value = line.split("=", 1)
                    key = key.strip()
                    value = value.strip().strip('"').strip("'")
                    os.environ.setdefault(key, value)
                break
        except Exception:
            # Non-fatal; just skip if any parsing error
            pass

class LLMService:
    def __init__(self, provider: LLMProvider):
        print(f"Initializing LLM Service with provider: {provider.value.upper()}")
        self.config = SERVICE_CONFIG['llm']
        self.character = CHARACTER_CONFIG
        self.provider = provider
        
        # Load .env (non-intrusive; ignores if missing)
        _load_dotenv_if_present()

        api_key = None
        base_url = None

        if self.provider == LLMProvider.GROQ:
            api_key = os.environ.get("GROQ_API_KEY") or SERVICE_CONFIG.get('groq_api_key')
            base_url = "https://api.groq.com/openai/v1"
        elif self.provider == LLMProvider.OLLAMA:
            api_key = "ollama"
            base_url = "http://localhost:11434/v1"
        elif self.provider == LLMProvider.OPENAI:
            api_key = os.environ.get("OPENAI_API_KEY") or SERVICE_CONFIG.get('openai_api_key')
        
        self.client = AsyncOpenAI(api_key=api_key, base_url=base_url)
        
        self.history_path = Path(self.character['history_file'])
        self.history_path.parent.mkdir(exist_ok=True, parents=True)
        self.history = self._load_history()
        print("LLM Service Initialized.")

    def _load_history(self):
        if self.history_path.exists():
            with open(self.history_path, "r", encoding='utf-8') as f:
                return json.load(f)
        return [{"role": "system", "content": self.character['system_prompt']}]

    def _save_history(self):
        with open(self.history_path, "w", encoding='utf-8') as f:
            json.dump(self.history, f, indent=2, ensure_ascii=False)

    async def generate_response(self, user_input: str, memories: list[str]) -> tuple[str, str]:
        print("🧠 Thinking...")
        
        # Prepare memory context (no "Senpai" here)
        memory_context = "You remember these facts about the user:\n- " + "\n- ".join(memories) if memories else ""
        
        # Add user input to history (no "Senpai says:" here)
        full_user_input = f"{memory_context}\n\nUser: {user_input}".strip()
        self.history.append({"role": "user", "content": full_user_input})

        response = await self.client.chat.completions.create(
            model=self.config['models'][self.provider],
            messages=self.history,
            temperature=self.config['temperature'],
            max_tokens=self.config['max_tokens'],
        )
        
        assistant_message = response.choices[0].message.content
        self.history.append({"role": "assistant", "content": assistant_message})
        self._save_history()

        emotion = "neutral"
        text = assistant_message
        
        match = re.match(r"\[(\w+)\]\s*(.*)", assistant_message, re.DOTALL)
        if match:
            emotion = match.group(1).lower()
            text = match.group(2).strip()
        
        print(f"LLM Response (Emotion: {emotion}): '{text}'")
        return emotion, text

    async def extract_memories(self) -> list[str]:
        print("📝 Checking for new memories...")
        conversation_log = "\n".join([f"{msg['role']}: {msg['content']}" for msg in self.history[-4:]])
        
        prompt = self.character['memory_extraction_prompt'].format(conversation_log=conversation_log)
        
        response = await self.client.chat.completions.create(
            model=self.config['models'][self.provider],
            messages=[{"role": "system", "content": prompt}],
            temperature=0.0,
        )
        
        content = response.choices[0].message.content
        try:
            # The LLM should return a string representation of a list
            # Find the list within the response text
            list_match = re.search(r'\[.*\]', content, re.DOTALL)
            if list_match:
                extracted_facts = ast.literal_eval(list_match.group(0))
                if isinstance(extracted_facts, list):
                    return extracted_facts
        except (ValueError, SyntaxError):
            print(f"Could not parse memory extraction response: {content}")
        
        return []