import os
from pathlib import Path
from dotenv import load_dotenv

class Config:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return
        self._initialized = True
        load_dotenv()
        self._load_config()

    def _load_config(self):
        self.groq_api_key = os.getenv("GROQ_API_KEY", "")
        self.cerebras_api_key = os.getenv("CEREBRAS_API_KEY", "")
        self.server_port = int(os.getenv("SERVER_PORT", "8765"))
        self.log_level = os.getenv("LOG_LEVEL", "INFO")
        self.use_local_ai = os.getenv("USE_LOCAL_AI", "false").lower() == "true"
        self.ollama_host = os.getenv("OLLAMA_HOST", "http://localhost:11434")
        self.screenshot_dir = Path(__file__).parent / "screenshots"
        self.screenshot_dir.mkdir(exist_ok=True)
        self.auth_token = self._get_or_create_token()

    def _get_or_create_token(self):
        token_file = Path(__file__).parent / ".auth_token"
        if token_file.exists():
            return token_file.read_text().strip()
        import secrets
        token = secrets.token_hex(32)
        token_file.write_text(token)
        return token

    def validate(self):
        errors = []
        if not self.groq_api_key or self.groq_api_key == "your_groq_api_key_here":
            errors.append("GROQ_API_KEY not set in .env")
        if self.server_port < 1024 or self.server_port > 65535:
            errors.append("SERVER_PORT must be between 1024-65535")
        return errors
