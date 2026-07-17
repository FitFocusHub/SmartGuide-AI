import winreg
import sys
import os
from pathlib import Path


class AutoStartup:
    """Adds/removes app from Windows startup."""

    REG_PATH = r"Software\Microsoft\Windows\CurrentVersion\Run"
    APP_NAME = "SmartGuideAI"

    @classmethod
    def get_exe_path(cls):
        if getattr(sys, 'frozen', False):
            return sys.executable
        return str(Path(__file__).parent / "smartguide_service.py")

    @classmethod
    def enable_startup(cls):
        try:
            exe_path = cls.get_exe_path()
            if exe_path.endswith(".py"):
                exe_path = f'pythonw.exe "{exe_path}"'

            key = winreg.OpenKey(winreg.HKEY_CURRENT_USER, cls.REG_PATH, 0,
                                 winreg.KEY_SET_VALUE)
            winreg.SetValueEx(key, cls.APP_NAME, 0, winreg.REG_SZ, f'"{exe_path}"')
            winreg.CloseKey(key)
            print(f"Auto-start enabled: {exe_path}")
            return True
        except Exception as e:
            print(f"Error enabling auto-start: {e}")
            return False

    @classmethod
    def disable_startup(cls):
        try:
            key = winreg.OpenKey(winreg.HKEY_CURRENT_USER, cls.REG_PATH, 0,
                                 winreg.KEY_SET_VALUE)
            winreg.DeleteValue(key, cls.APP_NAME, 0)
            winreg.CloseKey(key)
            print("Auto-start disabled")
            return True
        except FileNotFoundError:
            return True
        except Exception as e:
            print(f"Error disabling auto-start: {e}")
            return False

    @classmethod
    def is_enabled(cls):
        try:
            key = winreg.OpenKey(winreg.HKEY_CURRENT_USER, cls.REG_PATH, 0,
                                 winreg.KEY_READ)
            try:
                winreg.QueryValueEx(key, cls.APP_NAME)
                winreg.CloseKey(key)
                return True
            except FileNotFoundError:
                winreg.CloseKey(key)
                return False
        except:
            return False


if __name__ == "__main__":
    if len(sys.argv) > 1:
        if sys.argv[1] == "enable":
            AutoStartup.enable_startup()
        elif sys.argv[1] == "disable":
            AutoStartup.disable_startup()
        elif sys.argv[1] == "status":
            print(f"Auto-start: {'Enabled' if AutoStartup.is_enabled() else 'Disabled'}")
    else:
        print("Usage: python auto_start.py [enable|disable|status]")
