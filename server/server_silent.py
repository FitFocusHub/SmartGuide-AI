"""
SmartGuide AI - Silent Background Server
Copyright (c) 2026 FitFocusHub. All Rights Reserved.

This server runs silently in the background.
No console window visible to user.
Starts automatically with Windows.
"""

import asyncio
import json
import sys
import os
import subprocess
import time
import ctypes
import winreg
from pathlib import Path

# Hide console window
def hide_console():
    try:
        hwnd = ctypes.windll.kernel32.GetConsoleWindow()
        if hwnd:
            ctypes.windll.user32.ShowWindow(hwnd, 0)  # SW_HIDE
    except:
        pass

hide_console()

try:
    import websockets
except ImportError:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "websockets", "-q"])
    import websockets

try:
    import pyautogui
except ImportError:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "pyautogui", "-q"])
    import pyautogui

try:
    import pyperclip
except ImportError:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "pyperclip", "-q"])
    import pyperclip

try:
    import psutil
except ImportError:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "psutil", "-q"])
    import psutil

try:
    import pygetwindow as gw
except ImportError:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "pygetwindow", "-q"])
    import pygetwindow as gw

pyautogui.FAILSAFE = False
pyautogui.PAUSE = 0.1

HOST = "127.0.0.1"
PORT = 8765

connected_clients = set()

AUTO_START_REG_KEY = r"Software\Microsoft\Windows\CurrentVersion\Run"
APP_NAME = "SmartGuideAI"
APP_PATH = os.path.abspath(sys.argv[0])

def add_to_autostart():
    """Add program to Windows startup."""
    try:
        key = winreg.OpenKey(winreg.HKEY_CURRENT_USER, AUTO_START_REG_KEY, 0, winreg.KEY_SET_VALUE)
        winreg.SetValueEx(key, APP_NAME, 0, winreg.REG_SZ, f'"{APP_PATH}"')
        winreg.CloseKey(key)
        return True
    except:
        return False

def remove_from_autostart():
    """Remove program from Windows startup."""
    try:
        key = winreg.OpenKey(winreg.HKEY_CURRENT_USER, AUTO_START_REG_KEY, 0, winreg.KEY_SET_VALUE)
        winreg.DeleteValue(key, APP_NAME)
        winreg.CloseKey(key)
        return True
    except:
        return False

async def handle_client(websocket, path):
    connected_clients.add(websocket)
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

async def process_command(data):
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
    else:
        return {"error": f"Unknown command: {cmd}"}

def handle_click(data):
    try:
        x, y = data.get("x"), data.get("y")
        button = data.get("button", "left")
        clicks = data.get("clicks", 1)
        if x is not None and y is not None:
            pyautogui.click(x, y, clicks=clicks, button=button)
            return {"status": "success", "action": "click", "x": x, "y": y}
        return {"error": "Missing coordinates"}
    except Exception as e:
        return {"error": str(e)}

def handle_type(data):
    try:
        text = data.get("text", "")
        interval = data.get("interval", 0.02)
        if text.isascii():
            pyautogui.typewrite(text, interval=interval)
        else:
            for char in text:
                pyperclip.copy(char)
                pyautogui.hotkey("ctrl", "v")
                time.sleep(0.02)
        return {"status": "success", "action": "type", "text": text[:50]}
    except Exception as e:
        return {"error": str(e)}

def handle_press(data):
    try:
        key = data.get("key", "")
        pyautogui.press(key)
        return {"status": "success", "action": "press", "key": key}
    except Exception as e:
        return {"error": str(e)}

def handle_scroll(data):
    try:
        x, y = data.get("x"), data.get("y")
        amount = data.get("amount", -3)
        if x is not None and y is not None:
            pyautogui.scroll(amount, x=x, y=y)
        else:
            pyautogui.scroll(amount)
        return {"status": "success", "action": "scroll", "amount": amount}
    except Exception as e:
        return {"error": str(e)}

def handle_hotkey(data):
    try:
        keys = data.get("keys", [])
        if keys:
            pyautogui.hotkey(*keys)
            return {"status": "success", "action": "hotkey", "keys": keys}
        return {"error": "No keys provided"}
    except Exception as e:
        return {"error": str(e)}

def handle_screenshot(data):
    try:
        region = data.get("region")
        screenshot = pyautogui.screenshot(region=tuple(region) if region else None)
        path = os.path.join(os.environ.get("TEMP", "."), "smartguide_screenshot.png")
        screenshot.save(path)
        return {"status": "success", "action": "screenshot", "path": path}
    except Exception as e:
        return {"error": str(e)}

def get_screen_info():
    try:
        size = pyautogui.size()
        return {"status": "success", "width": size.width, "height": size.height}
    except Exception as e:
        return {"error": str(e)}

def get_active_window():
    try:
        window = gw.getActiveWindow()
        if window:
            return {"status": "success", "title": window.title, "left": window.left, "top": window.top, "width": window.width, "height": window.height}
        return {"status": "success", "title": "Unknown"}
    except Exception as e:
        return {"error": str(e)}

def list_windows():
    try:
        windows = [{"title": w.title, "left": w.left, "top": w.top, "width": w.width, "height": w.height} for w in gw.getAllWindows() if w.visible and w.title][:20]
        return {"status": "success", "windows": windows}
    except Exception as e:
        return {"error": str(e)}

def focus_window(data):
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
    try:
        app = data.get("app", "")
        os.system(f"start {app}")
        return {"status": "success", "action": "open_app", "app": app}
    except Exception as e:
        return {"error": str(e)}

def close_app(data):
    try:
        app = data.get("app", "")
        os.system(f"taskkill /IM {app}.exe /F")
        return {"status": "success", "action": "close_app", "app": app}
    except Exception as e:
        return {"error": str(e)}

def get_system_info():
    try:
        battery = psutil.sensors_battery()
        return {"status": "success", "cpu": psutil.cpu_percent(interval=0.1), "ram": psutil.virtual_memory().percent, "battery": battery.percent if battery else None, "disk": psutil.disk_usage('/').percent}
    except Exception as e:
        return {"error": str(e)}

def get_clipboard():
    try:
        return {"status": "success", "text": pyperclip.paste()}
    except Exception as e:
        return {"error": str(e)}

def set_clipboard(data):
    try:
        pyperclip.copy(data.get("text", ""))
        return {"status": "success", "action": "set_clipboard"}
    except Exception as e:
        return {"error": str(e)}

def move_mouse(data):
    try:
        x, y = data.get("x", 0), data.get("y", 0)
        duration = data.get("duration", 0.2)
        pyautogui.moveTo(x, y, duration=duration)
        return {"status": "success", "action": "move_mouse", "x": x, "y": y}
    except Exception as e:
        return {"error": str(e)}

def handle_drag(data):
    try:
        x1, y1, x2, y2 = data.get("x1", 0), data.get("y1", 0), data.get("x2", 0), data.get("y2", 0)
        duration = data.get("duration", 0.5)
        pyautogui.moveTo(x1, y1)
        pyautogui.drag(x2 - x1, y2 - y1, duration=duration)
        return {"status": "success", "action": "drag"}
    except Exception as e:
        return {"error": str(e)}

async def main():
    add_to_autostart()
    async with websockets.serve(handle_client, HOST, PORT):
        await asyncio.Future()

if __name__ == "__main__":
    asyncio.run(main())
