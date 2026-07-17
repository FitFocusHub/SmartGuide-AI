# 🤖 SmartGuide AI

**Real-time AI Guidance for Any Software - Browser Extension + Desktop App + Mobile PWA**

---

## 📋 Project Description

SmartGuide AI is an innovative AI-powered assistant that provides real-time guidance for any software application. It combines a Chrome browser extension with a desktop companion app to deliver instant, contextual help right when you need it.

### 🎯 What Makes SmartGuide AI Special?

- **Instant AI Assistance**: Get real-time help with any software - from Excel to CapCut, WhatsApp to Photoshop
- **Smart Element Detection**: AI highlights exactly where to click and what to do
- **Auto-Execute with Permission**: AI can perform actions automatically with your approval
- **Hinglish Responses**: AI responds in natural Hinglish for better understanding
- **Lightning Fast**: Powered by Groq API (llama-3.3-70b-versatile) for instant responses
- **Works Everywhere**: Desktop apps, web browsers, and mobile devices

---

## ✨ Key Features

### 🌐 Browser Extension
- Beautiful floating chat interface
- Element highlighting with green boxes
- Permission-based auto-execution
- Quick action buttons
- Real-time WebSocket connection

### 🖥️ Desktop Application
- Control any desktop app via voice commands
- Auto-type, click, and navigate
- Support for 50+ applications
- Simple WebSocket server

### 📱 Mobile PWA
- Install as native app on Android/iOS
- No app store required
- Full AI capabilities
- Offline support

---

## 🚀 Quick Start

### For Users:
1. Download the Desktop App
2. Install Chrome Extension
3. Start asking questions!

### For Developers:
```bash
# Clone the repository
git clone https://github.com/your-username/SmartGuide-AI.git

# Navigate to project
cd SmartGuide-AI

# Install desktop app dependencies
cd desktop-app
pip install -r requirements.txt

# Start the server
python main.py

# Load extension in Chrome
# 1. Open chrome://extensions/
# 2. Enable Developer mode
# 3. Click "Load unpacked"
# 4. Select browser-extension folder
```

---

## 📁 Project Structure

```
SmartGuide-AI/
├── 📁 browser-extension/        # Chrome Extension (Manifest V3)
│   ├── manifest.json
│   ├── chat/
│   │   ├── chat-ui.js          # Main chat interface
│   │   └── chat.css            # Beautiful styles
│   ├── content/
│   ├── background/
│   └── assets/
│
├── 📁 desktop-app/              # Python Desktop Server
│   ├── main.py                 # WebSocket server + app control
│   ├── ai/
│   │   ├── groq_handler.py     # AI integration (Groq API)
│   │   └── prompt_templates.py # Smart prompt templates
│   ├── utils/
│   └── requirements.txt
│
├── 📁 mobile-app/               # PWA Mobile App
│   ├── index.html              # Mobile interface
│   ├── manifest.json           # PWA manifest
│   └── sw.js                   # Service worker
│
├── 📁 installer/                # Installation Scripts
│   ├── install.bat             # Windows installer
│   ├── install.py              # Python installer GUI
│   └── setup.iss               # Inno Setup script
│
└── README.md                   # This file
```

---

## 🎮 Supported Applications

### Desktop Apps (50+)
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

### Web Applications
- YouTube (Full control)
- Google Search
- Any website!

---

## 💡 Example Commands

### Desktop Commands
| Command | Action |
|---------|--------|
| `"Notepad kholo"` | Opens Notepad |
| `"Excel kholo aur data likho"` | Opens Excel and types |
| `"CapCut kholo"` | Opens CapCut |
| `"WhatsApp kholo"` | Opens WhatsApp Desktop |

### YouTube Commands
| Command | Action |
|---------|--------|
| `"Video chalao"` | Play/Pause |
| `"10 minute aage badhao"` | Seek forward |
| `"Volume badhao"` | Increase volume |

### Browser Commands
| Command | Action |
|---------|--------|
| `"Naya tab kholo"` | Opens new tab |
| `"Tab band karo"` | Close tab |
| `"Refresh karo"` | Refresh page |

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| **AI Engine** | Groq API (llama-3.3-70b-versatile) |
| **Backend** | Python + WebSocket |
| **Frontend** | Chrome Extension (Manifest V3) |
| **Desktop Control** | PyAutoGUI |
| **Mobile** | PWA (Progressive Web App) |
| **UI** | Custom CSS with gradient themes |

---

## ⚙️ Configuration

### Environment Variables (.env)
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

## 📥 Download & Installation

### 🖥️ Desktop App
[![Download Desktop](https://img.shields.io/badge/Download-Desktop%20App-green?style=for-the-badge&logo=windows)](https://github.com/your-username/SmartGuide-AI/releases/latest)

### 🌐 Browser Extension
[![Chrome Extension](https://img.shields.io/badge/Chrome%20Web%20Store-Extension-blue?style=for-the-badge&logo=google-chrome)](https://chrome.google.com/webstore/detail/smartguide-ai)

### 📱 Mobile App (PWA)
[![Install PWA](https://img.shields.io/badge/Install-PWA-purple?style=for-the-badge&logo=android)](https://your-pwa-url.web.app)

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Extension not working | Check if desktop server is running |
| Server won't start | Install Python 3.8+ and run `pip install -r requirements.txt` |
| AI not responding | Check your Groq API key and internet connection |
| Mobile not connecting | Ensure phone and PC are on same network |

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
