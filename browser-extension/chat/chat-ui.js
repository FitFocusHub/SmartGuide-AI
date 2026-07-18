console.log("[SmartGuide] v4 loaded - with ads");

window.smartGuideChat = {
    container: null,
    messagesContainer: null,
    inputField: null,
    isOpen: false,
    ws: null,
    isConnected: false,
    pendingActions: null,
    adTimer: null,
    adInterval: 30 * 60 * 1000, // 30 minutes

    init() {
        if (this.container) return;
        this.createUI();
        this.bindEvents();
        this.connectWebSocket();
        this.startAdTimer();
    },

    connectWebSocket() {
        try {
            this.ws = new WebSocket("ws://127.0.0.1:8765");
            this.ws.onopen = () => {
                this.isConnected = true;
                this.showStatus("Connected", "#00ff88");
                console.log("[SmartGuide] WebSocket connected");
            };
            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.removeTypingIndicator();
                    
                    console.log("[SmartGuide] Received:", JSON.stringify(data).substring(0, 200));
                    
                    if (data.error) { this.addMessage(data.error, "error"); return; }
                    
                    if (data.explanation) this.addMessage(data.explanation, "ai");
                    
                    if (data.steps && data.steps.length > 0) {
                        let txt = "";
                        data.steps.forEach((s, i) => { txt += `${i+1}. ${s.description || s}\n`; });
                        this.addMessage(txt.trim(), "steps");
                    }
                    
                    if (data.highlight && data.highlight.length > 0) {
                        this.showHighlights(data.highlight);
                    }
                    
                    if (data.execute && data.execute.length > 0) {
                        console.log("[SmartGuide] Execute actions:", data.execute.length);
                        this.askPermission(data.execute);
                    }
                } catch (e) {
                    console.error("[SmartGuide] Parse error:", e);
                    this.removeTypingIndicator();
                }
            };
            this.ws.onclose = () => {
                this.isConnected = false;
                this.showStatus("Disconnected", "#ff4444");
                setTimeout(() => this.connectWebSocket(), 3000);
            };
            this.ws.onerror = () => this.showStatus("Error", "#ff4444");
        } catch (e) {
            setTimeout(() => this.connectWebSocket(), 3000);
        }
    },

    showStatus(text, color) {
        const el = document.getElementById("sg-status");
        if (el) { el.textContent = text; el.style.color = color; }
        const dot = document.getElementById("sg-dot");
        if (dot) { dot.className = color === "#00ff88" ? "sg-dot" : "sg-dot disconnected"; }
    },

    // Better element detection
    getPageElements() {
        const els = [];
        const seen = new Set();
        
        // Find ALL visible interactive elements
        const selectors = 'button, a, [role="button"], input[type="text"], input[type="email"], input[type="search"], textarea, [onclick], [tabindex]';
        
        document.querySelectorAll(selectors).forEach((el) => {
            const r = el.getBoundingClientRect();
            const style = window.getComputedStyle(el);
            
            // Must be visible and have size
            if (r.width < 5 || r.height < 5 || r.width > 800) return;
            if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return;
            if (r.bottom < 0 || r.top > window.innerHeight) return;
            
            // Get text content
            let text = '';
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                text = el.placeholder || el.value || el.name || el.id || '';
            } else {
                text = el.textContent?.trim() || el.getAttribute('aria-label') || el.title || '';
            }
            text = text.substring(0, 50).replace(/\s+/g, ' ');
            
            if (!text) return;
            
            // Unique key to avoid duplicates
            const key = `${Math.round(r.x)}-${Math.round(r.y)}-${text.substring(0,20)}`;
            if (seen.has(key)) return;
            seen.add(key);
            
            els.push({
                tag: el.tagName.toLowerCase(),
                text: text,
                x: Math.round(r.x + r.width / 2),
                y: Math.round(r.y + r.height / 2),
                w: Math.round(r.width),
                h: Math.round(r.height),
                id: el.id || '',
                href: el.href ? el.href.substring(0, 50) : ''
            });
        });
        
        return {
            url: location.href,
            title: document.title,
            viewport: { w: window.innerWidth, h: window.innerHeight },
            elements: els.slice(0, 40)
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
                        <button id="sg-close" class="sg-btn-close">×</button>
                    </div>
                </div>
                <div class="sg-messages" id="sg-messages">
                    <div class="sg-msg sg-msg-system">
                        <div class="sg-msg-content">
                            Namaste! Main SmartGuide AI hoon.
                            <br><small>Kuch bhi puchin ya karne ko bolin</small>
                        </div>
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
        this.inputField.onkeypress = (e) => { if (e.key === "Enter") this.sendMessage(); };
    },

    toggle() { this.isOpen ? this.close() : this.open(); },
    open() {
        document.getElementById("sg-bubble").style.display = "none";
        document.getElementById("sg-window").style.display = "flex";
        this.isOpen = true;
        this.inputField.focus();
    },
    close() {
        document.getElementById("sg-bubble").style.display = "flex";
        document.getElementById("sg-window").style.display = "none";
        this.isOpen = false;
    },

    sendMessage() {
        const text = this.inputField.value.trim();
        if (!text) return;
        
        this.addMessage(text, "user");
        this.inputField.value = "";
        this.addTypingIndicator();

        const ctx = this.getPageElements();
        console.log("[SmartGuide] Elements found:", ctx.elements.length);
        
        if (this.isConnected && this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({
                type: "query",
                query: text,
                context: ctx,
                software: "general",
                timestamp: Date.now()
            }));
        } else {
            this.removeTypingIndicator();
            this.addMessage("Server disconnected!", "error");
        }
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

    // Ad System - 30 min mein ek ad
    startAdTimer() {
        // Pehla ad 2 minute baad
        setTimeout(() => this.showAd(), 2 * 60 * 1000);
        // Phir har 30 min
        this.adTimer = setInterval(() => this.showAd(), this.adInterval);
        console.log("[SmartGuide] Ad timer started - first ad in 2 min");
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
        
        // Auto remove after 30 seconds
        setTimeout(() => {
            if (adDiv.parentElement) adDiv.remove();
        }, 30000);
        
        console.log("[SmartGuide] Ad displayed");
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
    },

    askPermission(actions) {
        let text = "Kya ye actions karu?\n";
        actions.forEach((a, i) => {
            text += `${i+1}. ${a.description || a.action}\n`;
        });
        
        this.addMessage(text, "permission");
        this.pendingActions = actions;
        
        const btnDiv = document.createElement("div");
        btnDiv.className = "sg-permission-btns";
        btnDiv.innerHTML = `
            <button class="sg-btn sg-btn-yes" id="sg-yes">Han, karo</button>
            <button class="sg-btn sg-btn-no" id="sg-no">Nahi</button>
        `;
        this.messagesContainer.appendChild(btnDiv);
        
        document.getElementById("sg-yes").onclick = () => this.handlePermission(true);
        document.getElementById("sg-no").onclick = () => this.handlePermission(false);
        
        this.scrollToBottom();
    },

    handlePermission(confirmed) {
        document.querySelectorAll('.sg-permission-btns').forEach(e => e.remove());
        
        if (confirmed && this.pendingActions) {
            this.addMessage("Executing...", "ai");
            this.executeSequentially(this.pendingActions, 0);
        } else {
            this.addMessage("Thik hai.", "ai");
        }
        this.pendingActions = null;
    },

    async executeSequentially(actions, index) {
        if (index >= actions.length) {
            this.addMessage("Done!", "ai");
            return;
        }
        
        const action = actions[index];
        this.addMessage(`${index + 1}. ${action.description || action.action}...`, "steps");
        
        console.log("[SmartGuide] Executing action:", JSON.stringify(action));
        console.log("[SmartGuide] WS state:", this.ws?.readyState, "OPEN:", WebSocket.OPEN);
        
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            const msg = JSON.stringify({ type: "execute", ...action });
            console.log("[SmartGuide] Sending:", msg);
            this.ws.send(msg);
        } else {
            console.error("[SmartGuide] WS not open! State:", this.ws?.readyState);
            this.addMessage("Server disconnected! Reconnecting...", "error");
            this.connectWebSocket();
            return;
        }
        
        // Wait for action to complete
        const delay = action.action === "wait" ? (action.duration || 1) * 1000 : 1000;
        await new Promise(r => setTimeout(r, delay));
        
        this.executeSequentially(actions, index + 1);
    }
};

document.addEventListener("DOMContentLoaded", () => window.smartGuideChat.init());
if (document.readyState !== "loading") window.smartGuideChat.init();
