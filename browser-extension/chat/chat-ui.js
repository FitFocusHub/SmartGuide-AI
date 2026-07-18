/**
 * SmartGuide AI - Chat UI
 * Copyright (c) 2026 FitFocusHub. All Rights Reserved.
 * Unauthorized copying, modification, or distribution is strictly prohibited.
 */
console.log("[SmartGuide] v2.0 loaded - direct API, no server");
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
    },

    async checkApiKey() {
        try {
            const result = await chrome.storage.local.get(["apiKey"]);
            if (result.apiKey) {
                this.showStatus("Ready", "#00ff88");
            } else {
                this.showStatus("No API Key", "#ff4444");
            }
        } catch (e) {
            this.showStatus("Ready", "#00ff88");
        }
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
        
        const selectors = 'button, a, [role="button"], input[type="text"], input[type="email"], input[type="search"], textarea, [onclick], [tabindex]';
        
        document.querySelectorAll(selectors).forEach((el) => {
            const r = el.getBoundingClientRect();
            const style = window.getComputedStyle(el);
            
            if (r.width < 5 || r.height < 5 || r.width > 800) return;
            if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return;
            if (r.bottom < 0 || r.top > window.innerHeight) return;
            
            let text = '';
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                text = el.placeholder || el.value || el.name || el.id || '';
            } else {
                text = el.textContent?.trim() || el.getAttribute('aria-label') || el.title || '';
            }
            text = text.substring(0, 50).replace(/\s+/g, ' ');
            
            if (!text) return;
            
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
        this.checkApiKey();
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
