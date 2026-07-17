# SmartGuide AI

### 🤖 Real-time AI Guidance for Any Software

SmartGuide AI is a browser extension + desktop companion app that provides real-time AI guidance for any software using Groq API. Get instant help with any application - from Excel to CapCut, WhatsApp to Photoshop!

---

## ✨ Features

- 💬 **Chat Bubble UI** - Beautiful floating chat interface
- 🎯 **Element Highlighting** - AI highlights exactly where to click
- ⌨️ **Auto-Execute** - With your permission, AI performs actions automatically
- 🖥️ **Desktop App Control** - Open and control any desktop application
- 📱 **Mobile Support** - PWA support for mobile devices
- 🌐 **Hinglish Responses** - AI responds in Hinglish for better understanding
- ⚡ **Lightning Fast** - Powered by Groq API (llama-3.3-70b-versatile)

---

## 📥 Download & Install

### 🌐 Browser Extension

[![Chrome Web Store](https://img.shields.io/badge/Chrome%20Web%20Store-Extension-blue?style=for-the-badge&logo=google-chrome)](https://chrome.google.com/webstore/detail/smartguide-ai)

**Installation Steps:**
1. Download the extension folder
2. Open Chrome → `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select the `browser-extension` folder

---

### 🖥️ Desktop Application

[![Download Desktop App](https://img.shields.io/badge/Download-Desktop%20App-green?style=for-the-badge&logo=windows)](https://github.com/your-username/SmartGuide-AI/releases/latest)

**Installation Steps:**
1. Download the Desktop App from above
2. Extract the ZIP file
3. Run `main.exe` or `start.bat`
4. Server will start on `ws://127.0.0.1:8765`
5. Open Chrome extension and start using!

**Requirements:**
- Windows 10/11
- Python 3.8+ (for manual setup)

---

### 📱 Mobile App (PWA)

[![Install PWA](https://img.shields.io/badge/Install-PWA-purple?style=for-the-badge&logo=android)](https://your-pwa-url.web.app)

**Installation Steps:**
1. Open Chrome on your phone
2. Visit the SmartGuide AI web app
3. Tap "Add to Home Screen"
4. App will be installed like a native app!

**Features:**
- Works on Android & iOS
- No app store needed
- Full AI capabilities
- Offline support

---

## 🚀 Quick Start

### Step 1: Start the Desktop Server

```bash
# Navigate to desktop-app folder
cd desktop-app

# Install dependencies
pip install -r requirements.txt

# Start the server
python main.py
```

### Step 2: Install Browser Extension

1. Open Chrome
2. Go to `chrome://extensions/`
3. Enable Developer Mode
4. Click "Load Unpacked"
5. Select `browser-extension` folder

### Step 3: Start Using!

1. Click the SmartGuide AI icon in Chrome
2. Type your question or command
3. Get instant AI guidance!

---

## 🎯 Supported Applications

### Desktop Apps
| Category | Applications |
|----------|-------------|
| **Office** | Excel, Word, PowerPoint, Outlook |
| **Browsers** | Chrome, Firefox, Edge, Brave, Opera |
| **Creative** | CapCut, Photoshop, Premiere, Figma, Canva |
| **Communication** | WhatsApp, Telegram, Discord, Zoom, Teams |
| **Development** | VS Code, PyCharm, IntelliJ, Postman |
| **Media** | VLC, Spotify, OBS, Audacity |
| **Gaming** | Steam, Epic Games |
| **Utilities** | Notepad, Calculator, Paint, 7-Zip, WinRAR |

### Web Apps
- YouTube (Full control - play, pause, seek, volume)
- Google Search
- Any website!

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| **AI Engine** | Groq API (llama-3.3-70b-versatile) |
| **Backend** | Python + WebSocket |
| **Frontend** | Chrome Extension (Manifest V3) |
| **Desktop Control** | PyAutoGUI |
| **Mobile** | PWA (Progressive Web App) |

---

## 📁 Project Structure

```
SmartGuide-AI/
├── browser-extension/        # Chrome Extension
│   ├── manifest.json
│   ├── chat/
│   │   ├── chat-ui.js       # Main chat interface
│   │   └── chat.css         # Styles
│   ├── content/
│   ├── background/
│   └── assets/
│
├── desktop-app/              # Python Desktop Server
│   ├── main.py              # WebSocket server
│   ├── ai/
│   │   ├── groq_handler.py  # AI integration
│   │   └── prompt_templates.py
│   ├── utils/
│   └── requirements.txt
│
├── mobile-app/               # PWA / Mobile
│   ├── index.html
│   ├── app.js
│   └── manifest.json
│
└── README.md
```

---

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in `desktop-app/`:

```env
GROQ_API_KEY=your_groq_api_key_here
SERVER_PORT=8765
LOG_LEVEL=INFO
```

### Get Free Groq API Key

1. Visit [console.groq.com](https://console.groq.com)
2. Sign up for free
3. Create an API key
4. Add to `.env` file

---

## 🎮 Commands Examples

### Desktop Commands
| Command | Action |
|---------|--------|
| `"Notepad kholo"` | Opens Notepad |
| `"Excel kholo aur data likho"` | Opens Excel and types |
| `"CapCut kholo"` | Opens CapCut |
| `"WhatsApp kholo"` | Opens WhatsApp Desktop |
| `"Chrome kholo"` | Opens Chrome Browser |

### YouTube Commands
| Command | Action |
|---------|--------|
| `"Video chalao"` | Play/Pause |
| `"10 minute aage badhao"` | Seek forward |
| `"Volume badhao"` | Increase volume |
| `"Search karo [query]"` | Search YouTube |

### Browser Commands
| Command | Action |
|---------|--------|
| `"Naya tab kholo"` | Opens new tab (Ctrl+T) |
| `"Tab band karo"` | Close tab (Ctrl+W) |
| `"Refresh karo"` | Refresh page (Ctrl+R) |

---

## 🐛 Troubleshooting

### Extension not working?
1. Check if desktop server is running
2. Refresh the extension
3. Check console for errors

### Server won't start?
1. Install Python 3.8+
2. Run `pip install -r requirements.txt`
3. Check if port 8765 is available

### AI not responding?
1. Check your Groq API key
2. Verify internet connection
3. Check rate limits

---

## 📄 License

MIT License - Feel free to use and modify!

---

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Fork the project
- Create a feature branch
- Submit a Pull Request

---

## ⭐ Support

If you find SmartGuide AI helpful, please give us a ⭐ on GitHub!

---

## 📞 Contact

- **GitHub**: [Your GitHub Profile](https://github.com/your-username)
- **Email**: your-email@example.com
- **Discord**: [Join our server](https://discord.gg/your-server)

---

**Made with ❤️ by SmartGuide AI Team**
