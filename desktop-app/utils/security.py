import secrets
import hashlib
import re
from pathlib import Path

class Security:
    @staticmethod
    def generate_token() -> str:
        return secrets.token_hex(32)

    @staticmethod
    def validate_token(token: str, expected: str) -> bool:
        return secrets.compare_digest(token, expected)

    @staticmethod
    def hash_text(text: str) -> str:
        return hashlib.sha256(text.encode()).hexdigest()

    @staticmethod
    def sanitize_input(text: str) -> str:
        text = re.sub(r'[<>"\']', '', text)
        text = text.strip()[:10000]
        return text

    @staticmethod
    def validate_coordinates(x: int, y: int) -> bool:
        return 0 <= x <= 10000 and 0 <= y <= 10000

    @staticmethod
    def sanitize_filename(filename: str) -> str:
        filename = re.sub(r'[^\w\-_\. ]', '', filename)
        return filename[:255]
