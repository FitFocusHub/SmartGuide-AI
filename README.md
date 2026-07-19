<p align="center">
  <img src="https://img.shields.io/badge/SmartGuide-AI-Ultimate-E94560?style=for-the-badge&logo=robot&logoColor=white" alt="SmartGuide AI"/>
  <img src="https://img.shields.io/badge/Platform-Chrome%20%2B%20Python-4285F4?style=for-the-badge" alt="Platform"/>
  <img src="https://img.shields.io/badge/Language-English_%2B_Hindi-FF6B6B?style=for-the-badge" alt="Language"/>
</p>

<h1 align="center">SmartGuide AI Ultimate</h1>

<p align="center">
  <b>Advanced AI Navigation, Automation, Desktop & Browser Assistant</b><br>
  Understands, explains, guides and automates everything on your computer.
</p>

---

## What is SmartGuide AI Ultimate?

SmartGuide AI Ultimate is a Chrome extension + Python automation server that understands your screen, remembers context, and can automate tasks on any website or desktop application.

**Features:**
- Screen understanding - detects buttons, inputs, menus, etc.
- Conversation memory - remembers previous interactions
- Full automation - clicks, types, scrolls automatically
- 50+ apps supported - YouTube, Chrome, VS Code, Word, Excel, etc.
- English + Hindi responses

---

## Download

<p align="center">
  <a href="https://github.com/FitFocusHub/SmartGuide-AI/archive/refs/heads/master.zip">
    <img src="https://img.shields.io/badge/Download_Latest_Code-Master-blue?style=for-the-badge&logo=github&logoColor=white" alt="Download Latest"/>
  </a>
</p>

---

## Installation

### Step 1: Install Python Dependencies
1. Open Command Prompt
2. Run: `pip install -r server/requirements.txt`
3. Or run `setup.bat` for automatic setup

### Step 2: Get Free API Keys
1. **Groq (Primary):** Go to [console.groq.com](https://console.groq.com), sign up free, create API key
2. **BazaarLink (Backup):** Go to [bazaarlink.ai](https://bazaarlink.ai), sign up free, create API key

### Step 3: Load Chrome Extension
1. Open Chrome, go to `chrome://extensions/`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked**
4. Select the `browser-extension` folder

### Step 4: Add API Keys
1. Click SmartGuide AI icon in toolbar
2. Enter Groq API key (Primary)
3. Enter BazaarLink API key (Backup)
4. Click **Save API Keys**

### Step 5: Start Automation Server
1. Open Command Prompt
2. Navigate to server folder: `cd server`
3. Run: `python server.py`
4. Keep this window open

### Step 6: Start Using
1. Go to any website
2. Click the purple chat bubble
3. Ask your question
4. AI will guide you or automate the task

---

## Automation Features

When server is running, AI can:
- Click buttons automatically
- Type text
- Press keyboard shortcuts
- Scroll pages
- Open/close applications
- Manage windows
- Read clipboard
- Take screenshots
- And much more!

---

## Requirements

- Python 3.8+
- Chrome/Edge/Brave browser
- Free Groq or BazaarLink API key
- Internet connection

---

## Troubleshooting

### "Server not connected" error
- Make sure `python server.py` is running
- Check if port 8765 is not blocked

### Extension not loading
- Make sure Developer mode is ON
- Try extracting the zip file again

### AI not responding
- Check your API keys are valid
- Check internet connection

---

## License

**Proprietary** - Copyright (c) 2026 FitFocusHub. All Rights Reserved.
