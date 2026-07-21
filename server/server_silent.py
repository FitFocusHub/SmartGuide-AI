"""
SmartGuide AI - Silent Server
Copyright (c) 2026 FitFocusHub. All Rights Reserved.

Runs as a background service without showing terminal window.
Auto-starts with Windows.
"""

import asyncio
import json
import sys
import os
import subprocess
import time
import logging
from pathlib import Path

# Hide console window on Windows
if sys.platform == "win32":
    import ctypes
    kernel32 = ctypes.windll.kernel32
    kernel32.FreeConsole()

# Setup logging
log_dir = Path(os.environ.get("APPDATA", "")) / "SmartGuide AI" / "logs"
log_dir.mkdir(parents=True, exist_ok=True)
log_file = log_dir / "server.log"

logging.basicConfig(
    filename=str(log_file),
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("SmartGuide")

# Install dependencies if missing
def install_deps():
    deps = ["websockets", "pyautogui", "pyperclip", "psutil", "Pillow"]
    for dep in deps:
        try:
            __import__(dep.lower().replace("-", "_"))
        except ImportError:
            logger.info(f"Installing {dep}...")
            subprocess.check_call(
                [sys.executable, "-m", "pip", "install", dep],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL
            )

install_deps()

import websockets
import pyautogui
import pyperclip
import psutil

try:
    import pygetwindow as gw
except ImportError:
    gw = None

HOST = "127.0.0.1"
PORT = 8765

pyautogui.FAILSAFE = False
pyautogui.PAUSE = 0.1

async def handle_client(websocket):
    logger.info("Client connected")
    try:
        async for message in websocket:
            try:
                data = json.loads(message)
                result = await execute_command(data)
                await websocket.send(json.dumps(result))
            except Exception as e:
                logger.error(f"Command error: {e}")
                await websocket.send(json.dumps({"error": str(e)}))
    except websockets.exceptions.ConnectionClosed:
        logger.info("Client disconnected")

async def execute_command(cmd):
    action = cmd.get("action", "")
    
    try:
        if action == "click":
            x, y = cmd.get("x", 0), cmd.get("y", 0)
            pyautogui.click(x, y)
            return {"status": "success", "action": "click"}
        
        elif action == "double_click":
            x, y = cmd.get("x", 0), cmd.get("y", 0)
            pyautogui.doubleClick(x, y)
            return {"status": "success", "action": "double_click"}
        
        elif action == "right_click":
            x, y = cmd.get("x", 0), cmd.get("y", 0)
            pyautogui.rightClick(x, y)
            return {"status": "success", "action": "right_click"}
        
        elif action == "move":
            x, y = cmd.get("x", 0), cmd.get("y", 0)
            pyautogui.moveTo(x, y)
            return {"status": "success", "action": "move"}
        
        elif action == "drag":
            x1, y1 = cmd.get("x1", 0), cmd.get("y1", 0)
            x2, y2 = cmd.get("x2", 0), cmd.get("y2", 0)
            pyautogui.moveTo(x1, y1)
            pyautogui.drag(x2 - x1, y2 - y1, duration=0.5)
            return {"status": "success", "action": "drag"}
        
        elif action == "scroll":
            amount = cmd.get("amount", 0)
            pyautogui.scroll(amount)
            return {"status": "success", "action": "scroll"}
        
        elif action == "type":
            text = cmd.get("text", "")
            pyautogui.typewrite(text, interval=0.05)
            return {"status": "success", "action": "type"}
        
        elif action == "press":
            key = cmd.get("key", "")
            pyautogui.press(key)
            return {"status": "success", "action": "press"}
        
        elif action == "hotkey":
            keys = cmd.get("keys", [])
            pyautogui.hotkey(*keys)
            return {"status": "success", "action": "hotkey"}
        
        elif action == "screenshot":
            screenshot = pyautogui.screenshot()
            import io
            buffer = io.BytesIO()
            screenshot.save(buffer, format="PNG")
            import base64
            img_str = base64.b64encode(buffer.getvalue()).decode()
            return {"status": "success", "action": "screenshot", "image": img_str}
        
        elif action == "clipboard_read":
            return {"status": "success", "action": "clipboard_read", "text": pyperclip.paste()}
        
        elif action == "clipboard_write":
            text = cmd.get("text", "")
            pyperclip.copy(text)
            return {"status": "success", "action": "clipboard_write"}
        
        elif action == "open_app":
            app = cmd.get("app", "")
            os.startfile(app)
            return {"status": "success", "action": "open_app"}
        
        elif action == "list_windows":
            if gw:
                windows = gw.getAllWindows()
                return {"status": "success", "action": "list_windows", 
                        "windows": [{"title": w.title, "id": w._hWnd} for w in windows if w.title]}
            return {"status": "success", "action": "list_windows", "windows": []}
        
        elif action == "focus_window":
            title = cmd.get("title", "")
            if gw:
                windows = gw.getWindowsWithTitle(title)
                if windows:
                    windows[0].activate()
                    return {"status": "success", "action": "focus_window"}
            return {"error": "Window not found"}
        
        elif action == "get_screen_size":
            size = pyautogui.size()
            return {"status": "success", "action": "get_screen_size", 
                    "width": size.width, "height": size.height}
        
        elif action == "get_mouse_pos":
            pos = pyautogui.position()
            return {"status": "success", "action": "get_mouse_pos",
                    "x": pos.x, "y": pos.y}
        
        elif action == "system_info":
            import platform
            return {"status": "success", "action": "system_info",
                    "cpu": psutil.cpu_percent(),
                    "memory": psutil.virtual_memory().percent,
                    "platform": platform.system()}
        
        else:
            return {"error": f"Unknown action: {action}"}
    
    except Exception as e:
        logger.error(f"Execution error: {e}")
        return {"error": str(e)}

async def main():
    logger.info("=" * 50)
    logger.info("SmartGuide AI - Silent Server Starting")
    logger.info(f"Server: ws://{HOST}:{PORT}")
    logger.info("=" * 50)
    
    async with websockets.serve(handle_client, HOST, PORT):
        logger.info("Server running. Waiting for connections...")
        await asyncio.Future()

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except Exception as e:
        logger.critical(f"Server crashed: {e}")
