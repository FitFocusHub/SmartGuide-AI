from setuptools import setup, find_packages

setup(
    name="smartguide-ai",
    version="1.0.0",
    description="AI-powered Desktop Automation Assistant",
    author="SmartGuide Team",
    packages=find_packages(),
    python_requires=">=3.10",
    install_requires=[
        "PyQt6>=6.5.0",
        "pyautogui>=0.9.54",
        "pygetwindow>=0.0.9",
        "Pillow>=10.0.0",
        "opencv-python>=4.8.0",
        "pytesseract>=0.3.10",
        "google-generativeai>=0.3.0",
        "fastapi>=0.104.0",
        "uvicorn>=0.24.0",
        "websockets>=12.0",
        "python-dotenv>=1.0.0",
        "httpx>=0.25.0",
    ],
    entry_points={
        "console_scripts": [
            "smartguide=main:main",
        ],
    },
)
