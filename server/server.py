"""
SmartGuide AI - Automation Server
Copyright (c) 2026 FitFocusHub. All Rights Reserved.

WebSocket server for browser automation.
Install dependencies: pip install -r requirements.txt
"""

import asyncio
import json
import sys
import os
import subprocess
import time
from pathlib import Path

try:
    import websockets
except ImportError:
    print("Installing websockets...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "websockets"])
    import websockets

try:
    import pyautogui
except ImportError:
    print("Installing pyautogui...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "pyautogui"])
    import pyautogui

try:
    import pyperclip
except ImportError:
    print("Installing pyperclip...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "pyperclip"])
    import pyperclip

try:
    import psutil
except ImportError:
    print("Installing psutil...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "psutil"])
    import psutil

try:
    import pygetwindow as gw
except ImportError:
    print("Installing pygetwindow...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "pygetwindow"])
    import pygetwindow as gw

# Safety - disable failsafe for automation
pyautogui.FAILSAFE = False
pyautogui.PAUSE = 0.1

HOST = "127.0.0.1"
PORT = 8765

connected_clients = set()

async def handle_client(websocket, path):
    """Handle WebSocket connection from browser extension."""
    connected_clients.add(websocket)
    print(f"[SmartGuide] Client connected. Total: {len(connected_clients)}")

    try:
        async for message in websocket:
            try:
                data = json.loads(message)
                response = await process_command(data)
                await websocket.send(json.dumps(response))
            except json.JSONDecodeError:
                await websocket.send(json.dumps({"error": "Invalid JSON"}))
            except Exception as e:
                await websocket.send(json.dumps({"error": str(e)}))
    except websockets.exceptions.ConnectionClosed:
        pass
    finally:
        connected_clients.discard(websocket)
        print(f"[SmartGuide] Client disconnected. Total: {len(connected_clients)}")


async def process_command(data):
    """Process automation commands."""
    cmd = data.get("type", "")

    if cmd == "ping":
        return {"type": "pong", "status": "ok"}

    elif cmd == "click":
        return handle_click(data)

    elif cmd == "type":
        return handle_type(data)

    elif cmd == "press":
        return handle_press(data)

    elif cmd == "scroll":
        return handle_scroll(data)

    elif cmd == "hotkey":
        return handle_hotkey(data)

    elif cmd == "screenshot":
        return handle_screenshot(data)

    elif cmd == "get_screen_info":
        return get_screen_info()

    elif cmd == "get_active_window":
        return get_active_window()

    elif cmd == "list_windows":
        return list_windows()

    elif cmd == "focus_window":
        return focus_window(data)

    elif cmd == "open_app":
        return open_app(data)

    elif cmd == "close_app":
        return close_app(data)

    elif cmd == "get_system_info":
        return get_system_info()

    elif cmd == "get_clipboard":
        return get_clipboard()

    elif cmd == "set_clipboard":
        return set_clipboard(data)

    elif cmd == "move_mouse":
        return move_mouse(data)

    elif cmd == "drag":
        return handle_drag(data)

    elif cmd == "locate_on_screen":
        return locate_on_screen(data)

    elif cmd == "read_screen":
        return read_screen(data)

    elif cmd == "get_selected_text":
        return get_selected_text()

    else:
        return {"error": f"Unknown command: {cmd}"}

KEY_MAP = {
    "enter": "enter", "return": "enter", "dabao": "enter",
    "space": "space", "spacebar": "space",
    "tab": "tab",
    "escape": "escape", "esc": "escape",
    "backspace": "backspace", "delete": "delete", "del": "delete",
    "up": "up", "uparrow": "up", "uparrow": "up",
    "down": "down", "downarrow": "down",
    "left": "left", "leftarrow": "left",
    "right": "right", "rightarrow": "right",
    "home": "home", "end": "end",
    "pageup": "pageup", "pagedown": "pagedown",
    "f1": "f1", "f2": "f2", "f3": "f3", "f4": "f4",
    "f5": "f5", "f6": "f6", "f7": "f7", "f8": "f8",
    "f9": "f9", "f10": "f10", "f11": "f11", "f12": "f12",
    "capslock": "capslock", "numlock": "numlock", "scrolllock": "scrolllock",
    "insert": "insert", "printscreen": "printscreen",
    "volumeup": "volumeup", "volumedown": "volumedown", "volumemute": "volumemute",
    "playpause": "playpause", "mediaplaypause": "playpause",
    "nexttrack": "nexttrack", "prevtrack": "prevtrack",
    "browserback": "browserback", "browserforward": "browserforward",
    "browserrefresh": "browserrefresh", "browserhome": "browserhome",
}

COPY_PASTE_MAP = {
    "copy": ["ctrl", "c"],
    "paste": ["ctrl", "v"],
    "cut": ["ctrl", "x"],
    "undo": ["ctrl", "z"],
    "redo": ["ctrl", "y"],
    "select all": ["ctrl", "a"],
    "save": ["ctrl", "s"],
    "print": ["ctrl", "p"],
    "find": ["ctrl", "f"],
    "replace": ["ctrl", "h"],
    "new tab": ["ctrl", "t"],
    "close tab": ["ctrl", "w"],
    "new window": ["ctrl", "n"],
    "reopen tab": ["ctrl", "shift", "t"],
    "fullscreen": ["f11"],
    "address bar": ["ctrl", "l"],
    "bookmark": ["ctrl", "d"],
    "history": ["ctrl", "h"],
    "downloads": ["ctrl", "j"],
    "devtools": ["f12"],
    "zoom in": ["ctrl", "="],
    "zoom out": ["ctrl", "-"],
    "zoom reset": ["ctrl", "0"],
    "refresh": ["f5"],
    "reload": ["ctrl", "r"],
    "back": ["alt", "left"],
    "forward": ["alt", "right"],
    "next tab": ["ctrl", "tab"],
    "prev tab": ["ctrl", "shift", "tab"],
}


def handle_click(data):
    """Click at coordinates or on element."""
    try:
        x = data.get("x")
        y = data.get("y")
        button = data.get("button", "left")
        clicks = data.get("clicks", 1)

        if x is not None and y is not None:
            pyautogui.click(x, y, clicks=clicks, button=button)
            return {"status": "success", "action": "click", "x": x, "y": y}
        else:
            return {"error": "Missing x,y coordinates"}
    except Exception as e:
        return {"error": str(e)}


def handle_type(data):
    """Type text."""
    try:
        text = data.get("text", "")
        interval = data.get("interval", 0.02)
        pyautogui.typewrite(text, interval=interval) if text.isascii() else pyautogui.write(text)
        return {"status": "success", "action": "type", "text": text[:50]}
    except Exception as e:
        return {"error": str(e)}


def handle_press(data):
    """Press a key with Hindi support."""
    try:
        key = data.get("key", "").lower().strip()
        
        if key in COPY_PASTE_MAP:
            pyautogui.hotkey(*COPY_PASTE_MAP[key])
            return {"status": "success", "action": "hotkey", "keys": COPY_PASTE_MAP[key]}
        
        if key in KEY_MAP:
            pyautogui.press(KEY_MAP[key])
            return {"status": "success", "action": "press", "key": KEY_MAP[key]}
        
        pyautogui.press(key)
        return {"status": "success", "action": "press", "key": key}
    except Exception as e:
        return {"error": str(e)}


def handle_scroll(data):
    """Scroll at coordinates."""
    try:
        x = data.get("x")
        y = data.get("y")
        amount = data.get("amount", -3)

        if x is not None and y is not None:
            pyautogui.scroll(amount, x=x, y=y)
        else:
            pyautogui.scroll(amount)
        return {"status": "success", "action": "scroll", "amount": amount}
    except Exception as e:
        return {"error": str(e)}


def handle_hotkey(data):
    """Press hotkey combination."""
    try:
        keys = data.get("keys", [])
        if keys:
            pyautogui.hotkey(*keys)
            return {"status": "success", "action": "hotkey", "keys": keys}
        return {"error": "No keys provided"}
    except Exception as e:
        return {"error": str(e)}


def handle_screenshot(data):
    """Take screenshot."""
    try:
        region = data.get("region")
        if region:
            screenshot = pyautogui.screenshot(region=tuple(region))
        else:
            screenshot = pyautogui.screenshot()

        path = os.path.join(os.environ.get("TEMP", "."), "smartguide_screenshot.png")
        screenshot.save(path)
        return {"status": "success", "action": "screenshot", "path": path}
    except Exception as e:
        return {"error": str(e)}


def get_screen_info():
    """Get screen information."""
    try:
        size = pyautogui.size()
        return {
            "status": "success",
            "width": size.width,
            "height": size.height
        }
    except Exception as e:
        return {"error": str(e)}


def get_active_window():
    """Get active window info."""
    try:
        window = gw.getActiveWindow()
        if window:
            return {
                "status": "success",
                "title": window.title,
                "left": window.left,
                "top": window.top,
                "width": window.width,
                "height": window.height
            }
        return {"status": "success", "title": "Unknown", "left": 0, "top": 0, "width": 0, "height": 0}
    except Exception as e:
        return {"error": str(e)}


def list_windows():
    """List all visible windows."""
    try:
        windows = []
        for w in gw.getAllWindows():
            if w.visible and w.title:
                windows.append({
                    "title": w.title,
                    "left": w.left,
                    "top": w.top,
                    "width": w.width,
                    "height": w.height
                })
        return {"status": "success", "windows": windows[:20]}
    except Exception as e:
        return {"error": str(e)}


def focus_window(data):
    """Focus a window by title."""
    try:
        title = data.get("title", "")
        windows = gw.getWindowsWithTitle(title)
        if windows:
            windows[0].activate()
            return {"status": "success", "action": "focus", "title": title}
        return {"error": f"Window not found: {title}"}
    except Exception as e:
        return {"error": str(e)}


def open_app(data):
    """Open an application."""
    try:
        app = data.get("app", "")
        if app.lower() in ["notepad", "calc", "mspaint", "cmd", "powershell"]:
            os.system(f"start {app}")
        elif app.lower() == "chrome":
            os.system("start chrome")
        elif app.lower() == "explorer":
            os.system("start explorer")
        else:
            os.system(f'start "" "{app}"')
        return {"status": "success", "action": "open_app", "app": app}
    except Exception as e:
        return {"error": str(e)}


def close_app(data):
    """Close an application."""
    try:
        app = data.get("app", "")
        os.system(f"taskkill /IM {app}.exe /F")
        return {"status": "success", "action": "close_app", "app": app}
    except Exception as e:
        return {"error": str(e)}


def get_system_info():
    """Get system information."""
    try:
        return {
            "status": "success",
            "cpu": psutil.cpu_percent(interval=0.1),
            "ram": psutil.virtual_memory().percent,
            "battery": psutil.sensors_battery().percent if psutil.sensors_battery() else None,
            "disk": psutil.disk_usage('/').percent
        }
    except Exception as e:
        return {"error": str(e)}


def get_clipboard():
    """Get clipboard content."""
    try:
        text = pyperclip.paste()
        return {"status": "success", "text": text}
    except Exception as e:
        return {"error": str(e)}


def set_clipboard(data):
    """Set clipboard content."""
    try:
        text = data.get("text", "")
        pyperclip.copy(text)
        return {"status": "success", "action": "set_clipboard"}
    except Exception as e:
        return {"error": str(e)}


def move_mouse(data):
    """Move mouse to coordinates."""
    try:
        x = data.get("x", 0)
        y = data.get("y", 0)
        duration = data.get("duration", 0.2)
        pyautogui.moveTo(x, y, duration=duration)
        return {"status": "success", "action": "move_mouse", "x": x, "y": y}
    except Exception as e:
        return {"error": str(e)}


def handle_drag(data):
    """Drag from one point to another."""
    try:
        x1 = data.get("x1", 0)
        y1 = data.get("y1", 0)
        x2 = data.get("x2", 0)
        y2 = data.get("y2", 0)
        duration = data.get("duration", 0.5)
        pyautogui.moveTo(x1, y1)
        pyautogui.drag(x2 - x1, y2 - y1, duration=duration)
        return {"status": "success", "action": "drag"}
    except Exception as e:
        return {"error": str(e)}


def read_screen(data):
    """Read text from screen using OCR."""
    try:
        try:
            import easyocr
            reader = easyocr.Reader(['en', 'hi'])
            region = data.get("region")
            if region:
                screenshot = pyautogui.screenshot(region=tuple(region))
            else:
                screenshot = pyautogui.screenshot()
            
            import numpy as np
            img_array = np.array(screenshot)
            results = reader.readtext(img_array)
            
            texts = []
            for (bbox, text, confidence) in results:
                texts.append({
                    "text": text,
                    "confidence": round(confidence * 100),
                    "x": int(bbox[0][0]),
                    "y": int(bbox[0][1])
                })
            
            return {"status": "success", "action": "read_screen", "texts": texts}
        except ImportError:
            clipboard_text = pyperclip.paste()
            return {"status": "success", "action": "read_screen", "texts": [{"text": clipboard_text, "confidence": 100}], "note": "Install easyocr for better OCR: pip install easyocr"}
    except Exception as e:
        return {"error": str(e)}


def get_selected_text():
    """Get currently selected text."""
    try:
        pyautogui.hotkey("ctrl", "c")
        time.sleep(0.1)
        text = pyperclip.paste()
        return {"status": "success", "action": "get_selected_text", "text": text}
    except Exception as e:
        return {"error": str(e)}


def locate_on_screen(data):
    """Locate an image on screen."""
    try:
        image_path = data.get("image", "")
        if os.path.exists(image_path):
            location = pyautogui.locateOnScreen(image_path)
            if location:
                return {
                    "status": "success",
                    "x": location.left + location.width // 2,
                    "y": location.top + location.height // 2,
                    "width": location.width,
                    "height": location.height
                }
        return {"error": "Image not found on screen"}
    except Exception as e:
        return {"error": str(e)}


async def main():
    """Start the WebSocket server."""
    print("=" * 50)
    print("SmartGuide AI - Automation Server")
    print("Copyright (c) 2026 FitFocusHub")
    print("=" * 50)
    print()
    print(f"Starting server on ws://{HOST}:{PORT}")
    print("Waiting for browser extension to connect...")
    print()
    print("Features:")
    print("  - Mouse click, move, drag")
    print("  - Keyboard type, press, hotkey")
    print("  - Scroll")
    print("  - Window management")
    print("  - App launch/close")
    print("  - System info (CPU, RAM, Battery)")
    print("  - Clipboard access")
    print("  - Screenshot")
    print()
    print("Press Ctrl+C to stop")
    print("-" * 50)

    async with websockets.serve(handle_client, HOST, PORT):
        await asyncio.Future()


if __name__ == "__main__":
    asyncio.run(main())
