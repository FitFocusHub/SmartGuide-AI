import sys
import asyncio
import subprocess
import time
from pathlib import Path
from dotenv import load_dotenv
import pyperclip

load_dotenv()
print("SmartGuide AI starting...", flush=True)

from utils.config import Config
config = Config()

import websockets
import json

connected_clients = set()

DESKTOP_APPS = {
    # Basic Windows Apps
    "notepad": "notepad.exe",
    "calculator": "calc.exe",
    "paint": "mspaint.exe",
    "snipping tool": "SnippingTool.exe",
    "voice recorder": "SoundRecorder.exe",
    "camera": "microsoft.windows.camera:",
    
    # Microsoft Office
    "excel": "excel.exe",
    "word": "winword.exe",
    "powerpoint": "powerpnt.exe",
    "outlook": "outlook.exe",
    "access": "msaccess.exe",
    
    # Browsers
    "chrome": "chrome.exe",
    "firefox": "firefox.exe",
    "edge": "msedge.exe",
    "brave": "brave.exe",
    "opera": "opera.exe",
    
    # System
    "cmd": "cmd.exe",
    "command prompt": "cmd.exe",
    "terminal": "cmd.exe",
    "powershell": "powershell.exe",
    "explorer": "explorer.exe",
    "task manager": "taskmgr.exe",
    "control panel": "control.exe",
    "settings": "ms-settings:",
    
    # Creative Apps
    "capcut": "CapCut.exe",
    "canva": "https://www.canva.com",
    "figma": "figma.exe",
    "photoshop": "photoshop.exe",
    "premiere": "premiere.exe",
    "after effects": "afterfx.exe",
    "blender": "blender.exe",
    
    # Communication
    "whatsapp": "WhatsApp.exe",
    "telegram": "Telegram.exe",
    "discord": "Discord.exe",
    "zoom": "Zoom.exe",
    "teams": "ms-teams.exe",
    "skype": "Skype.exe",
    
    # Development
    "vscode": "code.exe",
    "visual studio": "devenv.exe",
    "pycharm": "pycharm64.exe",
    "intellij": "idea64.exe",
    "sublime": "sublime_text.exe",
    "notepad++": "notepad++.exe",
    "git bash": "git-bash.exe",
    "postman": "Postman.exe",
    
    # Media
    "vlc": "vlc.exe",
    "spotify": "Spotify.exe",
    "obs": "obs64.exe",
    "audacity": "audacity.exe",
    
    # Gaming
    "steam": "steam.exe",
    "epic games": "EpicGamesLauncher.exe",
    
    # Utilities
    "7zip": "7zFM.exe",
    "winrar": "WinRAR.exe",
    "obsidian": "Obsidian.exe",
    "notion": "Notion.exe",
    "slack": "Slack.exe",
}

# App aliases for better matching
APP_ALIASES = {
    "ms word": "word",
    "microsoft word": "word",
    "ms excel": "excel",
    "microsoft excel": "excel",
    "ms powerpoint": "powerpoint",
    "microsoft powerpoint": "powerpoint",
    "google chrome": "chrome",
    "mozilla firefox": "firefox",
    "microsoft edge": "edge",
    "whatsapp desktop": "whatsapp",
    "visual studio code": "vscode",
    "code editor": "vscode",
    "video editor": "capcut",
    "photo editor": "photoshop",
    "screen recorder": "obs",
}

def open_app(app_name):
    app_lower = app_name.lower().strip()
    # Check aliases
    app_lower = APP_ALIASES.get(app_lower, app_lower)
    exe = DESKTOP_APPS.get(app_lower)
    try:
        if exe:
            if exe.startswith("http"):
                import webbrowser
                webbrowser.open(exe)
            elif exe.endswith(":"):
                subprocess.Popen(f"start {exe}", shell=True)
            else:
                subprocess.Popen([exe])
        else:
            subprocess.Popen(f"start {app_name}", shell=True)
        return True, f"{app_name} open ho raha hai!"
    except Exception as e:
        return False, f"Error: {str(e)}"

async def handle_client(websocket):
    client_id = id(websocket)
    connected_clients.add(websocket)
    print(f"Client connected: {client_id}", flush=True)
    
    try:
        async for message in websocket:
            data = json.loads(message)
            msg_type = data.get("type", "")
            
            if msg_type == "ping":
                await websocket.send(json.dumps({"type": "pong"}))
                
            elif msg_type == "query":
                query = data.get("query", "")
                context = data.get("context", {})
                software = data.get("software", "general")
                elements = context.get("elements", [])
                print(f"\n=== QUERY ===", flush=True)
                print(f"Query: {query[:80]}", flush=True)
                print(f"Elements count: {len(elements)}", flush=True)
                if elements:
                    for i, el in enumerate(elements[:5]):
                        print(f"  {i+1}. {el.get('text','')[:30]} @ ({el.get('x')},{el.get('y')})", flush=True)
                print(f"=============\n", flush=True)
                
                # Check open app requests
                query_lower = query.lower()
                open_requested = False
                app_to_open = None
                
                for app_name in DESKTOP_APPS:
                    if app_name in query_lower:
                        open_requested = True
                        app_to_open = app_name
                        break
                
                if open_requested and app_to_open:
                    # Check if also need to type
                    type_text = None
                    if "likho" in query_lower or "type" in query_lower:
                        # Extract text after "likho" or "type"
                        import re
                        match = re.search(r'(?:likho|type)\s+(.+)', query, re.IGNORECASE)
                        if match:
                            type_text = match.group(1).strip()
                    
                    success, msg = open_app(app_to_open)
                    
                    # Build response with execute actions
                    execute_actions = [{"action": "open_app", "app": app_to_open, "description": f"{app_to_open} khol rahe hain"}]
                    
                    if type_text:
                        # Add delay and type action
                        execute_actions.append({"action": "wait", "duration": 1.5, "description": "App ka wait kar rahe hain"})
                        execute_actions.append({"action": "type", "text": type_text, "description": f"'{type_text}' type kar rahe hain"})
                    
                    await websocket.send(json.dumps({
                        "type": "response",
                        "explanation": msg + (f" Aur '{type_text}' type karenge." if type_text else ""),
                        "steps": [],
                        "highlight": [],
                        "execute": execute_actions,
                        "confidence": 1.0
                    }))
                else:
                    # Normal AI query
                    from ai.groq_handler import GroqHandler
                    groq = GroqHandler(config.groq_api_key, config.cerebras_api_key)
                    response = await groq.send_query(query=query, context=context, software=software)
                    await websocket.send(json.dumps({"type": "response", **response}))
                
                print(f"Response sent!", flush=True)
                
            elif msg_type == "execute":
                action = data.get("action", "")
                print(f"\n=== EXECUTE ACTION ===", flush=True)
                print(f"Action: {action}", flush=True)
                print(f"Full data: {json.dumps(data)}", flush=True)
                print(f"=====================\n", flush=True)
                
                try:
                    import pyautogui
                    pyautogui.FAILSAFE = False
                    
                    if action == "click":
                        coords = data.get("coordinates", {})
                        x, y = coords.get("x", 0), coords.get("y", 0)
                        pyautogui.click(x, y)
                        print(f"Clicked ({x},{y})", flush=True)
                        
                    elif action == "double_click":
                        coords = data.get("coordinates", {})
                        x, y = coords.get("x", 0), coords.get("y", 0)
                        pyautogui.doubleClick(x, y)
                        
                    elif action == "type":
                        text = data.get("text", "")
                        old_clip = pyperclip.paste()
                        pyperclip.copy(text)
                        pyautogui.hotkey("ctrl", "v")
                        time.sleep(0.1)
                        pyperclip.copy(old_clip)
                        print(f"Typed: {text}", flush=True)
                        
                    elif action == "press":
                        key = data.get("key", "enter")
                        pyautogui.press(key)
                        print(f"Pressed: {key}", flush=True)
                        
                    elif action == "hotkey":
                        keys = data.get("keys", [])
                        # Single key repeated = press sequentially (for YouTube seek)
                        if len(keys) > 2 and len(set(keys)) == 1:
                            for k in keys:
                                pyautogui.press(k)
                                time.sleep(0.05)
                        else:
                            pyautogui.hotkey(*keys)
                        print(f"Hotkey: {keys}", flush=True)
                        
                    elif action == "key_press":
                        key = data.get("key", "l")
                        count = data.get("count", 1)
                        for _ in range(count):
                            pyautogui.press(key)
                            time.sleep(0.05)
                        print(f"Key press: {key} x{count}", flush=True)
                        
                    elif action == "open_app":
                        app = data.get("app", "")
                        success, msg = open_app(app)
                        print(f"Opened: {app}", flush=True)
                        
                    elif action == "wait":
                        duration = data.get("duration", 1)
                        time.sleep(duration)
                        print(f"Waited {duration}s", flush=True)
                        
                    await websocket.send(json.dumps({"type": "execution_success", "action": action}))
                except Exception as e:
                    print(f"Execute error: {e}", flush=True)
                    await websocket.send(json.dumps({"type": "execution_error", "message": str(e)}))
                    
    except websockets.exceptions.ConnectionClosed:
        print(f"Client {client_id} disconnected", flush=True)
    except Exception as e:
        print(f"Error: {e}", flush=True)
    finally:
        connected_clients.discard(websocket)

async def main():
    print(f"Starting server on ws://127.0.0.1:{config.server_port}", flush=True)
    async with websockets.serve(handle_client, "127.0.0.1", config.server_port, ping_interval=20, ping_timeout=20):
        print("Server RUNNING!", flush=True)
        await asyncio.Future()

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\nStopped.")
