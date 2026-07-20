/**
 * SmartGuide AI - Chat UI
 * Copyright (c) 2026 FitFocusHub. All Rights Reserved.
 * Unauthorized copying, modification, or distribution is strictly prohibited.
 */
console.log("[SmartGuide] v1.0 loaded - with memory");
const _0x5c8d = "SG-FH-2026-X7K9";

window.smartGuideChat = {
    container: null,
    messagesContainer: null,
    inputField: null,
    isOpen: false,
    adTimer: null,
    adInterval: 30 * 60 * 1000,

    init() {
        if (this.container) return;
        this.createUI();
        this.bindEvents();
        this.checkApiKey();
        this.startAdTimer();
        this.listenServerStatus();
    },

    async checkApiKey() {
        try {
            const result = await chrome.storage.local.get(["apiKey", "backupApiKey", "serverStatus"]);
            const hasApi = result.apiKey || result.backupApiKey;
            const serverOk = result.serverStatus === "connected";
            
            if (!hasApi) {
                this.showStatus("No API Key", "#ff4444");
            } else if (!serverOk) {
                this.showStatus("Server Offline", "#ffaa00");
            } else {
                this.showStatus("Ready", "#00ff88");
            }
        } catch (e) {
            this.showStatus("Ready", "#00ff88");
        }
    },

    listenServerStatus() {
        chrome.storage.onChanged.addListener((changes) => {
            if (changes.serverStatus) {
                const status = changes.serverStatus.newValue;
                if (status === "connected") {
                    this.showStatus("Ready", "#00ff88");
                } else {
                    const hasKey = document.getElementById("sg-status")?.textContent !== "No API Key";
                    if (hasKey) this.showStatus("Server Offline", "#ffaa00");
                }
            }
        });
    },

    showStatus(text, color) {
        const el = document.getElementById("sg-status");
        if (el) { el.textContent = text; el.style.color = color; }
        const dot = document.getElementById("sg-dot");
        if (dot) { dot.className = color === "#00ff88" ? "sg-dot" : "sg-dot disconnected"; }
    },

    getPageElements() {
        const els = [];
        const seen = new Set();
        
        const selectors = [
            'button', 'a', '[role="button"]',
            'input[type="text"]', 'input[type="email"]', 'input[type="search"]', 'input[type="password"]', 'input[type="number"]',
            'textarea', 'select',
            '[onclick]', '[tabindex]',
            '[role="menuitem"]', '[role="tab"]', '[role="link"]', '[role="navigation"]',
            'nav a', 'nav button',
            '[class*="menu"]', '[class*="btn"]', '[class*="button"]', '[class*="nav"]',
            '[aria-label]', '[title]'
        ].join(', ');
        
        document.querySelectorAll(selectors).forEach((el) => {
            const r = el.getBoundingClientRect();
            const style = window.getComputedStyle(el);
            
            if (r.width < 5 || r.height < 5 || r.width > 800) return;
            if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return;
            if (r.bottom < -50 || r.top > window.innerHeight + 50) return;
            
            let text = '';
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                text = el.placeholder || el.value || el.name || el.id || el.type || '';
            } else if (el.tagName === 'SELECT') {
                text = el.options[el.selectedIndex]?.text || el.name || el.id || '';
            } else {
                text = el.textContent?.trim() || el.getAttribute('aria-label') || el.title || el.getAttribute('data-tooltip') || '';
            }
            text = text.substring(0, 80).replace(/\s+/g, ' ').trim();
            
            if (!text && !el.id && !el.getAttribute('aria-label')) return;
            
            const key = `${Math.round(r.x)}-${Math.round(r.y)}-${text.substring(0,20)}`;
            if (seen.has(key)) return;
            seen.add(key);
            
            const rect = el.getBoundingClientRect();
            els.push({
                tag: el.tagName.toLowerCase(),
                text: text || el.id || el.getAttribute('aria-label') || 'unlabeled',
                x: Math.round(rect.x + rect.width / 2),
                y: Math.round(rect.y + rect.height / 2),
                w: Math.round(rect.width),
                h: Math.round(rect.height),
                id: el.id || '',
                classes: el.className?.toString().substring(0, 50) || '',
                role: el.getAttribute('role') || '',
                type: el.type || '',
                href: el.href ? el.href.substring(0, 80) : '',
                disabled: el.disabled || false,
                ariaLabel: el.getAttribute('aria-label') || ''
            });
        });
        
        const pageText = document.body?.innerText?.substring(0, 500) || '';
        
        return {
            url: location.href,
            title: document.title,
            domain: location.hostname,
            viewport: { w: window.innerWidth, h: window.innerHeight },
            scrollY: Math.round(window.scrollY),
            scrollX: Math.round(window.scrollX),
            pageText: pageText,
            elements: els.slice(0, 50)
        };
    },

    createUI() {
        this.container = document.createElement("div");
        this.container.id = "smartguide-chat";
        this.container.innerHTML = `
            <div class="sg-bubble" id="sg-bubble">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg>
                <div class="sg-dot" id="sg-dot"></div>
            </div>
            <div class="sg-window" id="sg-window" style="display:none;">
                <div class="sg-header">
                    <div class="sg-header-left">
                        <div class="sg-logo">SG</div>
                        <span>SmartGuide AI</span>
                    </div>
                    <div class="sg-header-right">
                        <span id="sg-status" class="sg-status">Connecting...</span>
                        <button id="sg-clear" class="sg-btn-clear" title="Clear memory">🗑</button>
                        <button id="sg-close" class="sg-btn-close">×</button>
                    </div>
                </div>
                <div class="sg-messages" id="sg-messages">
                    <div class="sg-welcome" id="sg-welcome">
                        <div class="sg-welcome-icon">🤖</div>
                        <div class="sg-welcome-text">Welcome to <span class="sg-welcome-brand">SmartGuide AI</span></div>
                        <div class="sg-welcome-sub">Ask me anything. I am here to help!</div>
                    </div>
                </div>
                <div class="sg-input-area">
                    <input type="text" id="sg-input" placeholder="Type your question..." autocomplete="off">
                    <button id="sg-send" class="sg-send-btn">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(this.container);
        this.messagesContainer = document.getElementById("sg-messages");
        this.inputField = document.getElementById("sg-input");
    },

    bindEvents() {
        document.getElementById("sg-bubble").onclick = () => this.toggle();
        document.getElementById("sg-close").onclick = () => this.close();
        document.getElementById("sg-send").onclick = () => this.sendMessage();
        document.getElementById("sg-clear").onclick = () => this.clearHistory();
        this.inputField.onkeypress = (e) => { if (e.key === "Enter") this.sendMessage(); };
    },

    toggle() { this.isOpen ? this.close() : this.open(); },
    open() {
        document.getElementById("sg-bubble").style.display = "none";
        document.getElementById("sg-window").style.display = "flex";
        this.isOpen = true;
        this.inputField.focus();
        this.checkApiKey();
    },
    close() {
        document.getElementById("sg-bubble").style.display = "flex";
        document.getElementById("sg-window").style.display = "none";
        this.isOpen = false;
    },

    clearHistory() {
        chrome.runtime.sendMessage({ type: "clear_history" }, () => {
            this.messagesContainer.innerHTML = `
                <div class="sg-msg sg-msg-system">
                    <div class="sg-msg-content">
                        Memory cleared! Start a new conversation.
                    </div>
                </div>
            `;
        });
    },

    showHelp() {
        const help = `
<b>SmartGuide AI - Commands</b><br><br>
<b>/help</b> - Show this help message<br>
<b>/shortcuts</b> - Show shortcuts for current website<br>
<b>/keys</b> - Show all keyboard keys<br><br>
<b>How to Use:</b><br>
- Type your question normally<br>
- "Open YouTube" - Opens YouTube<br>
- "Search on Google" - Performs search<br>
- "How to subscribe" - Step by step guide<br>
- "Copy this" - Copies selected text<br>
- "New tab" - Opens new tab<br><br>
<b>You can also say:</b><br>
- "Go back" / "Go forward"<br>
- "Reload" / "Refresh page"<br>
- "Close tab"<br>
- "Go to Amazon" / "Open Facebook"<br>
- "Fill the form"<br>
- "Download"
        `;
        this.addMessage(help, "ai");
    },

    async showShortcuts() {
        let siteName = "Browser";
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tab && tab.url) {
                const url = tab.url.toLowerCase();
                if (url.includes("chatgpt")) siteName = "ChatGPT";
                else if (url.includes("youtube")) siteName = "YouTube";
                else if (url.includes("google")) siteName = "Google";
                else if (url.includes("facebook")) siteName = "Facebook";
                else if (url.includes("twitter") || url.includes("x.com")) siteName = "Twitter/X";
                else if (url.includes("instagram")) siteName = "Instagram";
                else if (url.includes("amazon")) siteName = "Amazon";
                else if (url.includes("github")) siteName = "GitHub";
                else if (url.includes("stackoverflow")) siteName = "Stack Overflow";
                else if (url.includes("linkedin")) siteName = "LinkedIn";
                else if (url.includes("reddit")) siteName = "Reddit";
                else if (url.includes("netflix")) siteName = "Netflix";
                else if (url.includes("spotify")) siteName = "Spotify";
                else siteName = "Browser";
            }
        } catch(e) {}

        let shortcuts = "";

        if (siteName === "ChatGPT") {
            shortcuts = `
<b>ChatGPT Shortcuts:</b><br><br>
- Ctrl+Shift+O - New chat<br>
- Ctrl+Shift+S - Toggle sidebar<br>
- / - Focus message input<br>
- Ctrl+Shift+C - Copy code block<br>
- Ctrl+Shift+M - Toggle model picker<br>
- Ctrl+Enter - Send without thinking<br>
- Shift+Enter - New line in message<br>
- Ctrl+Shift+R - Regenerate response<br>
- Ctrl+L - New chat<br>
- Ctrl+Shift+H - Toggle history<br>
- Escape - Stop generating<br>
- Ctrl+Shift+P - Pin chat
            `;
        } else if (siteName === "YouTube") {
            shortcuts = `
<b>YouTube Shortcuts:</b><br><br>
- K - Play/Pause<br>
- J - Back 10s<br>
- L - Forward 10s<br>
- M - Mute/Unmute<br>
- F - Fullscreen<br>
- T - Theater mode<br>
- I - Miniplayer<br>
- 0-9 - Jump to 0%-90%<br>
- / - Focus search<br>
- Shift+N - Next video<br>
- Shift+P - Previous video<br>
- > - Speed up<br>
- < - Slow down<br>
- C - Toggle captions<br>
- B - Toggle subtitles<br>
- Z - Toggle zoom<br>
- End - Go to end<br>
- Home - Go to beginning<br>
- Ctrl+Left - Previous frame<br>
- Ctrl+Right - Next frame
            `;
        } else if (siteName === "Google") {
            shortcuts = `
<b>Google Search Shortcuts:</b><br><br>
- / or Ctrl+K - Focus search<br>
- Tab - Move to first result<br>
- Arrow keys - Navigate results<br>
- Enter - Open result<br>
- Ctrl+Enter - Open in new tab<br>
- Escape - Close suggestions<br>
- Ctrl+L - Address bar<br>
- Ctrl+Shift+L - Clear search<br>
- G then I - Google Images<br>
- G then M - Google Maps<br>
- G then N - Google News
            `;
        } else if (siteName === "Facebook") {
            shortcuts = `
<b>Facebook Shortcuts:</b><br><br>
- Alt+1 - Home<br>
- Alt+2 - Timeline<br>
- Alt+3 - Friends<br>
- Alt+4 - Messages<br>
- Alt+5 - Notifications<br>
- Alt+6 - Settings<br>
- Alt+7 - Activity Log<br>
- Alt+8 - About<br>
- Alt+9 - Terms<br>
- Alt+0 - Help<br>
- / - Search
            `;
        } else if (siteName === "Twitter/X") {
            shortcuts = `
<b>Twitter/X Shortcuts:</b><br><br>
- N - New tweet<br>
- Enter - Send tweet<br>
- Ctrl+Enter - Send without confirm<br>
- / or Q - Focus search<br>
- G then H - Home<br>
- G then N - Notifications<br>
- G then M - Messages<br>
- G then P - Profile<br>
- J/K - Next/Previous tweet<br>
- L - Like<br>
- R - Reply<br>
- T - Retweet<br>
- B - Bookmark<br>
- Esc - Close compose
            `;
        } else if (siteName === "GitHub") {
            shortcuts = `
<b>GitHub Shortcuts:</b><br><br>
- T - File finder<br>
- S or / - Search<br>
- G then N - Notifications<br>
- G then C - Code<br>
- G then I - Issues<br>
- G then P - Pull requests<br>
- G then B - Projects<br>
- G then W - Wiki<br>
- . - Open in editor<br>
- L - Toggle line numbers<br>
- Ctrl+Shift+C - Copy URL<br>
- [ - Go back<br>
- ] - Go forward
            `;
        } else if (siteName === "Stack Overflow") {
            shortcuts = `
<b>Stack Overflow Shortcuts:</b><br><br>
- / - Focus search<br>
- H - Home<br>
- S - Questions<br>
- T - Tags<br>
- U - Users<br>
- J/K - Next/Previous question<br>
- L - Upvote<br>
- D - Downvote<br>
- Shift+F - Follow<br>
- Ctrl+Enter - Submit answer
            `;
        } else if (siteName === "LinkedIn") {
            shortcuts = `
<b>LinkedIn Shortcuts:</b><br><br>
- G then N - Notifications<br>
- G then M - Messages<br>
- G then H - Home feed<br>
- G then J - Jobs<br>
- G then C - Connections<br>
- G then P - Profile<br>
- G then S - Search<br>
- N - New post<br>
- Enter - Send message<br>
- Esc - Close dialog
            `;
        } else {
            shortcuts = `
<b>Browser Shortcuts:</b><br><br>
<b>Tab Management:</b><br>
- Ctrl+T - New tab<br>
- Ctrl+W - Close tab<br>
- Ctrl+Tab - Next tab<br>
- Ctrl+Shift+Tab - Previous tab<br>
- Ctrl+1-9 - Specific tab<br><br>
<b>Navigation:</b><br>
- Alt+Left - Back<br>
- Alt+Right - Forward<br>
- F5 / Ctrl+R - Reload<br>
- Ctrl+Home - Page top<br>
- Ctrl+End - Page bottom<br><br>
<b>Actions:</b><br>
- Ctrl+C - Copy<br>
- Ctrl+V - Paste<br>
- Ctrl+X - Cut<br>
- Ctrl+Z - Undo<br>
- Ctrl+A - Select all<br>
- Ctrl+F - Find<br>
- Ctrl+H - History<br>
- Ctrl+J - Downloads<br>
- Ctrl+L - Address bar<br>
- Ctrl+D - Bookmark<br>
- F11 - Fullscreen<br>
- Ctrl+Shift+I - DevTools<br><br>
<b>Search:</b><br>
- Ctrl+K / Ctrl+E - Search bar<br>
- / - YouTube search
            `;
        }
        this.addMessage(shortcuts, "ai");
    },

    showKeys() {
        const keys = `
<b>All Keyboard Keys:</b><br><br>
<b>Letters:</b> A B C D E F G H I J K L M N O P Q R S T U V W X Y Z<br><br>
<b>Numbers:</b> 0 1 2 3 4 5 6 7 8 9<br><br>
<b>Special:</b> Enter, Space, Tab, Escape, Backspace, Delete, Insert<br><br>
<b>Arrow Keys:</b> Up, Down, Left, Right<br><br>
<b>Function Keys:</b> F1-F12<br><br>
<b>Modifiers:</b> Ctrl, Alt, Shift, Windows/Cmd<br><br>
<b>Media:</b> VolumeUp, VolumeDown, Mute, MediaPlayPause, MediaNextTrack, MediaPrevTrack<br><br>
<b>Browser:</b> BrowserBack, BrowserForward, BrowserRefresh, BrowserHome, BrowserFavorites<br><br>
<b>How to Use:</b><br>
Say: "Press Ctrl+C" or "Press Enter" or "Press F11"
        `;
        this.addMessage(keys, "ai");
    },

    sendMessage() {
        const text = this.inputField.value.trim();
        if (!text) return;
        
        const welcome = document.getElementById("sg-welcome");
        if (welcome) welcome.remove();
        
        if (text === "/help") {
            this.addMessage(text, "user");
            this.inputField.value = "";
            this.showHelp();
            return;
        }
        
        if (text === "/shortcuts") {
            this.addMessage(text, "user");
            this.inputField.value = "";
            this.showShortcuts();
            return;
        }
        
        if (text === "/keys") {
            this.addMessage(text, "user");
            this.inputField.value = "";
            this.showKeys();
            return;
        }
        
        this.addMessage(text, "user");
        this.inputField.value = "";
        this.addTypingIndicator();

        const ctx = this.getPageElements();
        console.log("[SmartGuide] Elements found:", ctx.elements.length);
        
        chrome.runtime.sendMessage({
            type: "query",
            query: text,
            context: ctx
        }, (response) => {
            this.removeTypingIndicator();
            
            if (chrome.runtime.lastError) {
                this.addMessage("Error: " + chrome.runtime.lastError.message, "error");
                return;
            }
            
            if (!response) {
                this.addMessage("No response from background.", "error");
                return;
            }
            
            if (response.error) {
                this.addMessage(response.error, "error");
                return;
            }
            
            if (response.explanation) {
                this.addMessage(response.explanation, "ai");
            }
            
            if (response.steps && response.steps.length > 0) {
                let txt = "";
                response.steps.forEach((s, i) => { txt += `${i+1}. ${s.description || s}\n`; });
                this.addMessage(txt.trim(), "steps");
            }
            
            if (response.highlight && response.highlight.length > 0) {
                this.showHighlights(response.highlight);
            }
            
            if (response.execute && response.execute.length > 0) {
                this.executeAutomation(response.execute);
            }
        });
    },

    addMessage(text, type = "ai") {
        const div = document.createElement("div");
        div.className = `sg-msg sg-msg-${type}`;
        div.innerHTML = `<div class="sg-msg-content">${text.replace(/\n/g, '<br>')}</div>`;
        this.messagesContainer.appendChild(div);
        this.scrollToBottom();
    },

    addTypingIndicator() {
        const t = document.createElement("div");
        t.className = "sg-msg sg-typing";
        t.innerHTML = '<div class="sg-dots"><span></span><span></span><span></span></div>';
        this.messagesContainer.appendChild(t);
        this.scrollToBottom();
    },

    removeTypingIndicator() {
        const t = this.messagesContainer.querySelector(".sg-typing");
        if (t) t.remove();
    },

    scrollToBottom() {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    },

    async executeAutomation(actions) {
        for (const action of actions) {
            this.addMessage(`Executing: ${action.action}...`, "steps");
            
            try {
                if (action.action === "open_tab" || action.action === "navigate" || 
                    action.action === "close_tab" || action.action === "switch_tab" ||
                    action.action === "go_back" || action.action === "go_forward" ||
                    action.action === "reload" || action.action === "list_tabs") {
                    
                    const result = await new Promise((resolve, reject) => {
                        chrome.runtime.sendMessage({
                            type: "browser_action",
                            action: action.action,
                            url: action.url,
                            tabId: action.tabId
                        }, (response) => {
                            if (chrome.runtime.lastError) {
                                reject(new Error(chrome.runtime.lastError.message));
                            } else if (response.error) {
                                reject(new Error(response.error));
                            } else {
                                resolve(response);
                            }
                        });
                    });
                    
                    this.addMessage(`Done: ${action.action}`, "ai");
                } else {
                    const result = await new Promise((resolve, reject) => {
                        chrome.runtime.sendMessage({
                            type: "automation",
                            command: action
                        }, (response) => {
                            if (chrome.runtime.lastError) {
                                reject(new Error(chrome.runtime.lastError.message));
                            } else if (response.error) {
                                reject(new Error(response.error));
                            } else {
                                resolve(response);
                            }
                        });
                    });
                    
                    this.addMessage(`Done: ${action.action}`, "ai");
                }
            } catch (err) {
                this.addMessage(`Failed: ${err.message}`, "error");
            }
        }
    },

    startAdTimer() {
        setTimeout(() => this.showAd(), 2 * 60 * 1000);
        this.adTimer = setInterval(() => this.showAd(), this.adInterval);
    },

    showAd() {
        if (!this.messagesContainer) return;
        
        const ads = [
            { icon: "🚀", title: "SmartGuide AI Pro", desc: "Unlock premium features - unlimited AI queries!", cta: "Upgrade Now", link: "#" },
            { icon: "🎯", title: "Learn Coding Free", desc: "Master Python, JavaScript, and more with AI guidance.", cta: "Start Learning", link: "#" },
            { icon: "💡", title: "Productivity Tips", desc: "Discover shortcuts and tricks to work 10x faster.", cta: "Learn More", link: "#" },
            { icon: "🔥", title: "SmartGuide Premium", desc: "No limits, faster AI, priority support.", cta: "Get Premium", link: "#" },
        ];
        
        const ad = ads[Math.floor(Math.random() * ads.length)];
        
        const adDiv = document.createElement("div");
        adDiv.className = "sg-ad-banner";
        adDiv.innerHTML = `
            <span class="sg-ad-label">AD</span>
            <button class="sg-ad-close" onclick="this.parentElement.remove()">✕</button>
            <div class="sg-ad-content">
                <div class="sg-ad-icon">${ad.icon}</div>
                <div class="sg-ad-text">
                    <h4>${ad.title}</h4>
                    <p>${ad.desc}</p>
                </div>
            </div>
            <a class="sg-ad-cta" href="${ad.link}" target="_blank">${ad.cta}</a>
        `;
        
        this.messagesContainer.appendChild(adDiv);
        this.scrollToBottom();
        
        setTimeout(() => {
            if (adDiv.parentElement) adDiv.remove();
        }, 30000);
    },

    showHighlights(elements) {
        document.querySelectorAll('.sg-hl').forEach(e => e.remove());
        
        elements.forEach((el, i) => {
            const hl = document.createElement('div');
            hl.className = 'sg-hl';
            hl.style.cssText = `
                position:fixed; left:${el.x - el.w/2 - 5}px; top:${el.y - el.h/2 - 5}px;
                width:${el.w + 10}px; height:${el.h + 10}px;
                border:3px solid #00ff00; background:rgba(0,255,0,0.15);
                border-radius:8px; z-index:999999; pointer-events:none;
                animation:sgPulse 1.5s infinite;
                box-shadow:0 0 25px rgba(0,255,0,0.5);
            `;
            const badge = document.createElement('div');
            badge.style.cssText = 'position:absolute;top:-12px;left:-12px;background:#00ff00;color:#000;width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:bold;';
            badge.textContent = i + 1;
            hl.appendChild(badge);
            
            if (el.text) {
                const lbl = document.createElement('div');
                lbl.style.cssText = 'position:absolute;bottom:-28px;left:50%;transform:translateX(-50%);background:#0a0a1a;color:#00ff00;padding:3px 10px;border-radius:6px;font-size:11px;white-space:nowrap;border:1px solid #00ff00;font-weight:500;';
                lbl.textContent = el.text.substring(0, 30);
                hl.appendChild(lbl);
            }
            
            document.body.appendChild(hl);
            setTimeout(() => hl.remove(), 7000);
        });
    }
};

document.addEventListener("DOMContentLoaded", () => window.smartGuideChat.init());
if (document.readyState !== "loading") window.smartGuideChat.init();
