from setuptools import setup, find_packages

setup(
    name="smartguide-ai",
    version="1.0.0",
    author="FitFocusHub",
    description="SmartGuide AI - Browser automation and assistance server",
    long_description=open("README.md", encoding="utf-8").read(),
    long_description_content_type="text/markdown",
    url="https://github.com/FitFocusHub/SmartGuide-AI",
    packages=find_packages(),
    include_package_data=True,
    install_requires=[
        "websockets>=11.0",
        "pyautogui>=0.9.53",
        "pyperclip>=1.8.0",
        "psutil>=5.9.0",
        "Pillow>=10.0.0",
        "pygetwindow>=0.0.9; sys_platform == 'win32'",
    ],
    entry_points={
        "console_scripts": [
            "smartguide-server=server.server:main",
        ],
    },
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: Proprietary",
        "Operating System :: OS Independent",
    ],
    python_requires=">=3.8",
)
