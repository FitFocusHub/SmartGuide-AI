import sys
from typing import Optional, Dict, List, Tuple

if sys.platform == "win32":
    import pygetwindow as gw
elif sys.platform == "darwin":
    import subprocess
else:
    import subprocess

class WindowManager:
    def get_active_window(self) -> Optional[Dict]:
        if sys.platform == "win32":
            return self._get_active_windows()
        elif sys.platform == "darwin":
            return self._get_active_mac()
        else:
            return self._get_active_linux()

    def _get_active_windows(self) -> Optional[Dict]:
        try:
            import pygetwindow as gw
            active = gw.getActiveWindow()
            if active:
                return {
                    "title": active.title,
                    "left": active.left,
                    "top": active.top,
                    "width": active.width,
                    "height": active.height,
                    "process": self._get_window_process(active.title)
                }
        except Exception:
            return None
        return None

    def _get_active_mac(self) -> Optional[Dict]:
        try:
            script = '''
            tell application "System Events"
                set frontApp to name of first application process whose frontmost is true
                set frontWindow to position of front window of first application process whose frontmost is true
                set windowSize to size of front window of first application process whose frontmost is true
                return {frontApp, item 1 of frontWindow, item 2 of frontWindow, item 1 of windowSize, item 2 of windowSize}
            end tell
            '''
            result = subprocess.run(
                ["osascript", "-e", script],
                capture_output=True, text=True
            )
            parts = result.stdout.strip().split(", ")
            if len(parts) >= 5:
                return {
                    "title": parts[0],
                    "left": int(parts[1]),
                    "top": int(parts[2]),
                    "width": int(parts[3]),
                    "height": int(parts[4]),
                    "process": parts[0]
                }
        except Exception:
            return None
        return None

    def _get_active_linux(self) -> Optional[Dict]:
        try:
            result = subprocess.run(
                ["xdotool", "getactivewindow", "getwindowname"],
                capture_output=True, text=True
            )
            title = result.stdout.strip()
            return {
                "title": title,
                "left": 0,
                "top": 0,
                "width": 1920,
                "height": 1080,
                "process": title
            }
        except Exception:
            return None

    def _get_window_process(self, title: str) -> str:
        if sys.platform == "win32":
            try:
                import pygetwindow as gw
                windows = gw.getWindowsWithTitle(title)
                if windows:
                    return title.split(" - ")[-1] if " - " in title else title
            except Exception:
                pass
        return title

    def list_windows(self) -> List[Dict]:
        if sys.platform == "win32":
            return self._list_windows_win()
        return []

    def _list_windows_win(self) -> List[Dict]:
        try:
            import pygetwindow as gw
            windows = []
            for w in gw.getAllWindows():
                if w.title:
                    windows.append({
                        "title": w.title,
                        "left": w.left,
                        "top": w.top,
                        "width": w.width,
                        "height": w.height
                    })
            return windows
        except Exception:
            return []

    def focus_window(self, title: str) -> bool:
        if sys.platform == "win32":
            return self._focus_win(title)
        return False

    def _focus_win(self, title: str) -> bool:
        try:
            import pygetwindow as gw
            windows = gw.getWindowsWithTitle(title)
            if windows:
                windows[0].activate()
                return True
        except Exception:
            return False
        return False
