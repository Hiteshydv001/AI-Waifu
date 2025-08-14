# waifu_core/services/llm_service.py
import json
import re
import os
from pathlib import Path
from waifu_core.models import LLMProvider
import yaml
import ast

# Import different clients
try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False
    print("Google Generative AI library not found. Install with: pip install google-generativeai")

try:
    from openai import AsyncOpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False
    print("OpenAI library not found. Install with: pip install openai")

SERVICE_CONFIG = yaml.safe_load(Path("config/services.yaml").read_text())
CHARACTER_CONFIG = yaml.safe_load(Path("config/character.yaml").read_text())

def _load_dotenv_if_present() -> None:
    current_dir = Path(__file__).resolve().parent
    candidate_dirs = [
        current_dir,
        current_dir.parent,
        current_dir.parent.parent,
        current_dir.parent.parent.parent,
    ]
    for directory in candidate_dirs:
        env_path = directory / ".env"
        if env_path.exists():
            print(f"--- Found .env file at: {env_path} ---")
            for line in env_path.read_text(encoding="utf-8").splitlines():
                line = line.strip()
                if not line or line.startswith("#"): continue
                if "=" not in line: continue
                key, value = line.split("=", 1)
                key = key.strip()
                value = value.strip().strip('"').strip("'")
                os.environ.setdefault(key, value)
            return
    print("--- .env file not found in candidate paths. Relying on system environment variables. ---")

class LLMService:
    def __init__(self, provider: LLMProvider):
        print(f"Initializing LLM Service with provider: {provider.value.upper()}")
        self.config = SERVICE_CONFIG['llm']
        self.character = CHARACTER_CONFIG
        self.provider = provider
        
        _load_dotenv_if_present()

        if self.provider == LLMProvider.GEMINI:
            self._init_gemini()
        elif self.provider.value.startswith("groq-"):
            self._init_groq()
        elif self.provider == LLMProvider.OLLAMA:
            self._init_ollama()
        else:
            raise ValueError(f"Unsupported LLM provider: {provider}")
        
        self.history_path = Path(self.character['history_file'])
        self.history_path.parent.mkdir(exist_ok=True, parents=True)
        self.history = self._load_history()
        print("LLM Service Initialized.")

    def _init_gemini(self):
        """Initialize Gemini AI client"""
        if not GEMINI_AVAILABLE:
            raise ImportError("Google Generative AI library not found. Install with: pip install google-generativeai")
        
        api_key = os.environ.get("GEMINI_API_KEY") or SERVICE_CONFIG.get('gemini_api_key')
        if not api_key:
            raise ValueError("Gemini API key not found. Set GEMINI_API_KEY environment variable or add to services.yaml")
        
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel(self.config['models'][self.provider.value])
        print("Gemini AI client initialized")

    def _init_groq(self):
        """Initialize Groq client"""
        if not OPENAI_AVAILABLE:
            raise ImportError("OpenAI library required for Groq. Install with: pip install openai")
        
        api_key = os.environ.get("GROQ_API_KEY")
        if not api_key:
            raise ValueError("Groq API key not found")
        
        self.client = AsyncOpenAI(
            api_key=api_key,
            base_url="https://api.groq.com/openai/v1"
        )

    def _init_ollama(self):
        """Initialize Ollama client"""
        if not OPENAI_AVAILABLE:
            raise ImportError("OpenAI library required for Ollama. Install with: pip install openai")
        
        ollama_host = os.environ.get("OLLAMA_HOST_URL", "http://localhost:11434")
        self.client = AsyncOpenAI(
            api_key="ollama",
            base_url=f"{ollama_host}/v1"
        )
        print(f"Ollama client configured to use base URL: {ollama_host}/v1")

    def _load_history(self):
        if self.history_path.exists():
            with open(self.history_path, "r", encoding='utf-8') as f:
                return json.load(f)
        return [{"role": "system", "content": self.character['system_prompt']}]

    def _save_history(self):
        with open(self.history_path, "w", encoding='utf-8') as f:
            json.dump(self.history, f, indent=2, ensure_ascii=False)

    async def generate_response(self, user_input: str, memories: list[str]) -> tuple[str, str | None, str]:
        print("🧠 Thinking...")
        
        memory_context = "You remember these facts about the user:\n- " + "\n- ".join(memories) if memories else ""
        full_user_input = f"{memory_context}\n\nUser: {user_input}".strip()
        
        if self.provider == LLMProvider.GEMINI:
            return await self._generate_gemini_response(full_user_input)
        else:
            return await self._generate_openai_compatible_response(full_user_input)

    async def _generate_gemini_response(self, user_input: str) -> tuple[str, str | None, str]:
        """Generate response using Gemini API"""
        # For Gemini, we need to handle conversation differently
        # Convert history to Gemini format
        conversation_parts = []
        
        # Add system prompt as first message
        system_prompt = self.character['system_prompt']
        conversation_parts.append(f"System instructions: {system_prompt}")
        
        # Add conversation history (last few messages)
        for msg in self.history[-6:]:  # Keep last 6 messages for context
            if msg['role'] == 'system':
                continue
            elif msg['role'] == 'user':
                conversation_parts.append(f"User: {msg['content']}")
            elif msg['role'] == 'assistant':
                conversation_parts.append(f"Assistant: {msg['content']}")
        
        # Add current user input
        conversation_parts.append(f"User: {user_input}")
        
        # Create the full prompt
        full_prompt = "\n".join(conversation_parts)
        
        try:
            # Use Gemini's generate_content method
            response = await self.model.generate_content_async(
                full_prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=self.config['temperature'],
                    max_output_tokens=self.config['max_tokens'],
                )
            )
            
            assistant_message = response.text
            
            # Update history
            self.history.append({"role": "user", "content": user_input})
            self.history.append({"role": "assistant", "content": assistant_message})
            self._save_history()
            
            return self._parse_response(assistant_message)
            
        except Exception as e:
            print(f"Gemini API error: {e}")
            # Fallback response
            return "neutral", None, "I'm sorry, I'm having trouble thinking right now. Could you try again?"

    async def _generate_openai_compatible_response(self, user_input: str) -> tuple[str, str | None, str]:
        """Generate response using OpenAI-compatible APIs (Groq, Ollama)"""
        self.history.append({"role": "user", "content": user_input})

        response = await self.client.chat.completions.create(
            model=self.config['models'][self.provider.value],
            messages=self.history,
            temperature=self.config['temperature'],
            max_tokens=self.config['max_tokens'],
        )
        
        assistant_message = response.choices[0].message.content
        self.history.append({"role": "assistant", "content": assistant_message})
        self._save_history()

        return self._parse_response(assistant_message)

    def _parse_response(self, assistant_message: str) -> tuple[str, str | None, str]:
        """Parse emotion, action, and text from assistant response"""
        emotion = "neutral"
        action = None
        text = assistant_message
        
        # Extract emotion
        emotion_match = re.match(r"\[(\w+)\]", text)
        if emotion_match:
            emotion = emotion_match.group(1).lower()
            text = text[emotion_match.end():].lstrip()

        # Extract action
        action_match = re.match(r"\[action:(\w+)\]", text)
        if action_match:
            action = action_match.group(1).lower()
            text = text[action_match.end():].lstrip()
        
        print(f"LLM Response (Emotion: {emotion}, Action: {action}): '{text.strip()}'")
        return emotion, action, text.strip()

    async def extract_memories(self) -> list[str]:
        print("📝 Checking for new memories...")
        conversation_log = "\n".join([f"{msg['role']}: {msg['content']}" for msg in self.history[-4:]])
        
        prompt = self.character['memory_extraction_prompt'].format(conversation_log=conversation_log)
        
        if self.provider == LLMProvider.GEMINI:
            return await self._extract_memories_gemini(prompt)
        else:
            return await self._extract_memories_openai_compatible(prompt)

    async def _extract_memories_gemini(self, prompt: str) -> list[str]:
        """Extract memories using Gemini API"""
        try:
            response = await self.model.generate_content_async(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.0,
                    max_output_tokens=200,
                )
            )
            
            content = response.text
            return self._parse_memory_extraction(content)
            
        except Exception as e:
            print(f"Gemini memory extraction error: {e}")
            return []

    async def _extract_memories_openai_compatible(self, prompt: str) -> list[str]:
        """Extract memories using OpenAI-compatible APIs"""
        try:
            response = await self.client.chat.completions.create(
                model=self.config['models'][self.provider.value],
                messages=[{"role": "system", "content": prompt}],
                temperature=0.0,
            )
            
            content = response.choices[0].message.content
            return self._parse_memory_extraction(content)
            
        except Exception as e:
            print(f"Memory extraction error: {e}")
            return []

    def _parse_memory_extraction(self, content: str) -> list[str]:
        """Parse memory extraction response"""
        try:
            list_match = re.search(r'\[.*\]', content, re.DOTALL)
            if list_match:
                extracted_facts = ast.literal_eval(list_match.group(0))
                if isinstance(extracted_facts, list):
                    return extracted_facts
        except (ValueError, SyntaxError):
            print(f"Could not parse memory extraction response: {content}")
        
        return []