# 🤖 SmartGuide AI

**Real-time AI Guidance for Any Software - Browser Extension + Desktop App + Mobile PWA**

---

## ✨ Features

- 💬 Chat Bubble UI with AI responses
- 🎯 Element Highlighting - AI shows exactly where to click
- ⚡ Auto-Execute with permission
- 🖥️ Desktop App Control (Excel, CapCut, WhatsApp & 50+ apps)
- 📱 Mobile PWA support
- 🌐 Hinglish responses
- 🔥 Powered by Groq API (llama-3.3-70b-versatile)

---

## 📥 Installation

### Step 1: Desktop App

```
1. Download this repository (Code → Download ZIP)
2. Extract the ZIP file
3. Open desktop-app folder
4. Run: pip install -r requirements.txt
5. Run: python main.py
```

### Step 2: Browser Extension

```
1. Open Chrome browser
2. Go to: chrome://extensions/
3. Enable "Developer mode" (top right)
4. Click "Load unpacked"
5. Select the browser-extension folder
6. Done! Click the extension icon to start
```

### Step 3: Mobile (PWA)

```
1. Open Chrome on your phone
2. Make sure desktop server is running
3. Enter your PC's IP address when prompted
4. Tap "Add to Home Screen"
5. App icon appears on home screen!
```

---

## 🎮 Commands

### Desktop
| Command | Action |
|---------|--------|
| `"Notepad kholo"` | Opens Notepad |
| `"Excel kholo"` | Opens Excel |
| `"CapCut kholo"` | Opens CapCut |
| `"WhatsApp kholo"` | Opens WhatsApp |
| `"Chrome kholo"` | Opens Chrome |

### YouTube
| Command | Action |
|---------|--------|
| `"Video chalao"` | Play/Pause |
| `"10 minute aage badhao"` | Seek forward |
| `"Volume badhao"` | Increase volume |
| `"Search karo [query]"` | Search YouTube |

### Browser
| Command | Action |
|---------|--------|
| `"Naya tab kholo"` | New tab |
| `"Tab band karo"` | Close tab |
| `"Refresh karo"` | Refresh page |

---

## 🛠️ Tech Stack

- **AI**: Groq API (llama-3.3-70b-versatile)
- **Backend**: Python + WebSocket
- **Extension**: Chrome Extension (Manifest V3)
- **Desktop Control**: PyAutoGUI
- **Mobile**: PWA

---

## ⚙️ Setup

### Get Free Groq API Key

1. Visit [console.groq.com](https://console.groq.com)
2. Sign up (free)
3. Create API key
4. Create `.env` file in desktop-app folder:

```
GROQ_API_KEY=your_key_here
```

---

## 📁 Structure

```
SmartGuide-AI/
├── browser-extension/    # Chrome Extension
├── desktop-app/          # Python Server
├── mobile-app/           # PWA Mobile App
└── installer/            # Install Scripts
```

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| Extension not working | Check if server is running |
| Server error | Install Python + run pip install |
| AI not responding | Check Groq API key |
| Mobile not connecting | Same WiFi network required |

---

## 📄 License

MIT License

---

**Made with ❤️ by FitFocusHub**
