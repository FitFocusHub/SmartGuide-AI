import os
import sys
from pathlib import Path

def post_install():
    print("SmartGuide AI - Post Install Setup")
    print("=" * 40)

    env_file = Path(__file__).parent.parent / ".env"
    if not env_file.exists():
        api_key = input("Enter your Gemini API Key: ").strip()
        env_content = f"""GEMINI_API_KEY={api_key}
SERVER_PORT=8765
LOG_LEVEL=INFO
USE_LOCAL_AI=false
OLLAMA_HOST=http://localhost:11434
"""
        env_file.write_text(env_content)
        print(".env file created successfully!")
    else:
        print(".env file already exists, skipping...")

    print("\nSetup complete! Run 'python main.py' to start SmartGuide AI.")

if __name__ == "__main__":
    post_install()
