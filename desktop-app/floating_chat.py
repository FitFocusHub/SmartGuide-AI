import tkinter as tk
from tkinter import scrolledtext
import threading
import json
import os
import sys
from pathlib import Path
from groq import Groq
import httpx
import re
import time
import random
import subprocess
import ctypes

ctypes.windll.shcore.SetProcessDpiAwareness(2)

DESKTOP_APPS = {
    "notepad": "notepad.exe", "calculator": "calc.exe", "paint": "mspaint.exe",
    "excel": "excel.exe", "word": "winword.exe", "powerpoint": "powerpnt.exe",
    "chrome": "chrome.exe", "firefox": "firefox.exe", "edge": "msedge.exe",
    "vscode": "code.exe", "visual studio": "devenv.exe", "pycharm": "pycharm64.exe",
    "whatsapp": "WhatsApp.exe", "telegram": "Telegram.exe", "discord": "Discord.exe",
    "capcut": "CapCut.exe", "photoshop": "photoshop.exe", "figma": "figma.exe",
    "vlc": "vlc.exe", "spotify": "Spotify.exe", "obs": "obs64.exe",
    "steam": "steam.exe", "cmd": "cmd.exe", "powershell": "powershell.exe",
    "explorer": "explorer.exe", "teams": "ms-teams.exe", "zoom": "Zoom.exe",
    "slack": "Slack.exe", "notion": "Notion.exe", "obsidian": "Obsidian.exe",
    "sublime": "sublime_text.exe", "notepad++": "notepad++.exe", "postman": "Postman.exe",
    "7zip": "7zFM.exe", "winrar": "WinRAR.exe",
}

GREETINGS = ["Namaste!", "Hey!", "Bolo kya help chahiye?", "Haan, sun raha hoon!"]

SYSTEM_PROMPT = """You are SmartGuide AI. You help users with any desktop software.
Reply in English + Hindi mix (Hinglish). Keep replies short.
Give step-by-step instructions. Mention keyboard shortcuts.
If user asks to open something, use execute commands.

Reply in this JSON format:
{"explanation": "your answer", "steps": ["step1", "step2"], "highlight": [], "execute": []}

To open app: {"execute": [{"action": "open_app", "app": "notepad"}]}
To type text: {"execute": [{"action": "type", "text": "hello world"}]}
To click: {"execute": [{"action": "click", "coordinates": {"x": 500, "y": 300}}]}
To press key: {"execute": [{"action": "press", "key": "enter"}]}
To hotkey: {"execute": [{"action": "hotkey", "keys": ["ctrl", "s"]}]}

Always reply with valid JSON."""


class FloatingChat:
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("SmartGuide AI")
        self.root.geometry("360x520+50+50")
        self.root.configure(bg="#1a1a2e")
        self.root.attributes("-topmost", True)
        self.root.minsize(300, 400)
        
        self.groq_client = None
        self.bazaar_key = "sk-bl-ySUrU-uRVguB5Sz4miiR0ZeyjXRd3U9qUid79UXdGVYSo6ll"
        self.bazaar_url = "https://bazaarlink.ai/api/v1/chat/completions"
        self.provider = "groq"
        self.rate_limit_time = 0
        self._drag_x = 0
        self._drag_y = 0
        self.minimized = False
        
        self._init_api()
        self._build_ui()
        self._make_draggable()
    
    def _init_api(self):
        try:
            from dotenv import load_dotenv
            env_path = Path(__file__).parent / ".env"
            load_dotenv(env_path)
            key = os.getenv("GROQ_API_KEY", "")
            if key:
                self.groq_client = Groq(api_key=key)
        except:
            pass
    
    def _build_ui(self):
        top = tk.Frame(self.root, bg="#e94560", height=32)
        top.pack(fill=tk.X)
        top.pack_propagate(False)
        
        tk.Label(top, text="  SmartGuide AI", bg="#e94560", fg="white",
                 font=("Segoe UI", 10, "bold"), anchor="w").pack(side=tk.LEFT, fill=tk.X, expand=True)
        
        tk.Button(top, text="─", bg="#e94560", fg="white", font=("Arial", 9),
                  bd=0, cursor="hand2", command=self._minimize, width=3).pack(side=tk.RIGHT)
        tk.Button(top, text="X", bg="#c0392b", fg="white", font=("Arial", 9),
                  bd=0, cursor="hand2", command=self._close, width=3).pack(side=tk.RIGHT)
        
        self.body = tk.Frame(self.root, bg="#1a1a2e")
        self.body.pack(fill=tk.BOTH, expand=True, padx=6, pady=4)
        
        self.chat = scrolledtext.ScrolledText(self.body, bg="#0f0f23", fg="white",
            font=("Consolas", 10), wrap=tk.WORD, state=tk.DISABLED,
            relief=tk.FLAT, bd=0, insertbackground="white", height=18)
        self.chat.pack(fill=tk.BOTH, expand=True, pady=(0, 4))
        self.chat.tag_config("user", foreground="#e94560", font=("Consolas", 10, "bold"))
        self.chat.tag_config("ai", foreground="#00ff88", font=("Consolas", 10))
        self.chat.tag_config("sys", foreground="#888888", font=("Consolas", 9, "italic"))
        self.chat.tag_config("err", foreground="#ff4444", font=("Consolas", 10))
        self.chat.tag_config("step", foreground="#ffcc00", font=("Consolas", 10))
        
        bottom = tk.Frame(self.root, bg="#1a1a2e")
        bottom.pack(fill=tk.X, padx=6, pady=(0, 4))
        
        self.entry = tk.Entry(bottom, bg="#2a2a4a", fg="white",
            font=("Segoe UI", 11), relief=tk.FLAT, insertbackground="white")
        self.entry.pack(side=tk.LEFT, fill=tk.X, expand=True, ipady=7, padx=(0, 4))
        self.entry.bind("<Return>", self._send)
        self.entry.insert(0, "Kuch bhi poochho...")
        self.entry.bind("<FocusIn>", self._on_focus)
        
        tk.Button(bottom, text="Send", bg="#e94560", fg="white",
                  font=("Segoe UI", 10, "bold"), bd=0, cursor="hand2",
                  command=self._send, padx=12).pack(side=tk.RIGHT, ipady=5)
        
        self.status = tk.Label(self.root, text="Ready", bg="#1a1a2e", fg="#555",
                               font=("Segoe UI", 8))
        self.status.pack(pady=(0, 2))
        
        self._msg("SmartGuide AI ready hai!\nKoi bhi software ka naam lo ya sawaal pucho.", "sys")
    
    def _on_focus(self, e):
        if self.entry.get() == "Kuch bhi poochho...":
            self.entry.delete(0, tk.END)
    
    def _minimize(self):
        self.minimized = not self.minimized
        if self.minimized:
            self.body.pack_forget()
            self.root.geometry("360x36")
        else:
            self.body.pack(fill=tk.BOTH, expand=True, padx=6, pady=4)
            self.root.geometry("360x520")
    
    def _close(self):
        self.root.destroy()
    
    def _make_draggable(self):
        def start(e):
            self._drag_x = e.x_root - self.root.winfo_x()
            self._drag_y = e.y_root - self.root.winfo_y()
        def drag(e):
            x = e.x_root - self._drag_x
            y = e.y_root - self._drag_y
            self.root.geometry(f"+{x}+{y}")
        self.root.bind("<Button-1>", start)
        self.root.bind("<B1-Motion>", drag)
    
    def _msg(self, text, tag="ai"):
        self.chat.configure(state=tk.NORMAL)
        self.chat.insert(tk.END, text + "\n\n", tag)
        self.chat.see(tk.END)
        self.chat.configure(state=tk.DISABLED)
    
    def _send(self, e=None):
        q = self.entry.get().strip()
        if not q or q == "Kuch bhi poochho...":
            return
        self.entry.delete(0, tk.END)
        self._msg(f"You: {q}", "user")
        self.status.config(text="Thinking...")
        threading.Thread(target=self._process, args=(q,), daemon=True).start()
    
    def _process(self, query):
        try:
            q_lower = query.lower().strip()
            for p in [r'\bhi+\b', r'\bhey+\b', r'\bhello+\b', r'\bnamaste\b']:
                if re.search(p, q_lower):
                    self.root.after(0, lambda: self._msg(random.choice(GREETINGS), "ai"))
                    self.root.after(0, lambda: self.status.config(text="Ready"))
                    return
            
            resp = self._call_ai(query)
            if resp:
                parsed = self._try_json(resp)
                if parsed:
                    exp = parsed.get("explanation", resp)
                    self.root.after(0, lambda: self._msg(exp, "ai"))
                    
                    steps = parsed.get("steps", [])
                    if steps:
                        for i, s in enumerate(steps):
                            self.root.after(0, lambda s=s, i=i: self._msg(f"Step {i+1}: {s}", "step"))
                    
                    exe = parsed.get("execute", [])
                    if exe:
                        self._run_actions(exe)
                else:
                    self.root.after(0, lambda: self._msg(resp, "ai"))
            else:
                self.root.after(0, lambda: self._msg("API error. Baad mein try karo.", "err"))
        except Exception as ex:
            self.root.after(0, lambda: self._msg(f"Error: {ex}", "err"))
        finally:
            self.root.after(0, lambda: self.status.config(text="Ready"))
    
    def _call_ai(self, query):
        msgs = [{"role": "system", "content": SYSTEM_PROMPT}, {"role": "user", "content": query}]
        
        if self.provider == "groq" and self.groq_client:
            try:
                r = self.groq_client.chat.completions.create(
                    model="llama-3.3-70b-versatile", messages=msgs,
                    temperature=0.3, max_tokens=1024)
                return r.choices[0].message.content
            except Exception as e:
                if "429" in str(e) or "rate" in str(e).lower():
                    self.provider = "bazaar"
                    self.rate_limit_time = time.time()
        
        if self.provider == "bazaar" or not self.groq_client:
            try:
                r = httpx.post(self.bazaar_url,
                    headers={"Authorization": f"Bearer {self.bazaar_key}", "Content-Type": "application/json"},
                    json={"model": "auto:free", "messages": msgs, "temperature": 0.3, "max_tokens": 1024},
                    timeout=30)
                if r.status_code == 200:
                    return r.json()["choices"][0]["message"]["content"]
            except:
                pass
        
        if self.provider == "bazaar" and time.time() - self.rate_limit_time > 1800:
            self.provider = "groq"
        return None
    
    def _try_json(self, text):
        try:
            m = re.search(r'\{[\s\S]*\}', text)
            if m:
                return json.loads(m.group(0))
        except:
            pass
        return None
    
    def _run_actions(self, actions):
        for a in actions:
            act = a.get("action", "")
            try:
                if act == "open_app":
                    app = a.get("app", "").lower()
                    exe = DESKTOP_APPS.get(app, app)
                    subprocess.Popen([exe])
                    self.root.after(0, lambda: self._msg(f"Opening {app}...", "sys"))
                    time.sleep(1.5)
                
                elif act == "type":
                    import pyperclip, pyautogui
                    text = a.get("text", "")
                    old = pyperclip.paste()
                    pyperclip.copy(text)
                    pyautogui.hotkey("ctrl", "v")
                    time.sleep(0.1)
                    pyperclip.copy(old)
                
                elif act == "click":
                    import pyautogui
                    c = a.get("coordinates", {})
                    pyautogui.click(c.get("x", 0), c.get("y", 0))
                
                elif act == "press":
                    import pyautogui
                    pyautogui.press(a.get("key", "enter"))
                
                elif act == "hotkey":
                    import pyautogui
                    keys = a.get("keys", [])
                    if keys:
                        pyautogui.hotkey(*keys)
                
                elif act == "wait":
                    time.sleep(a.get("duration", 1))
            except Exception as e:
                self.root.after(0, lambda: self._msg(f"Action error: {e}", "err"))
    
    def run(self):
        self.root.mainloop()


if __name__ == "__main__":
    app = FloatingChat()
    app.run()
