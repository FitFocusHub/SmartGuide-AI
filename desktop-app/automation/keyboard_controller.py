import pyautogui
import time
from typing import List

pyautogui.FAILSAFE = True
pyautogui.PAUSE = 0.05

class KeyboardController:
    def type_text(self, text: str, interval: float = 0.03) -> None:
        pyautogui.typewrite(text, interval=interval)

    def press_key(self, key: str) -> None:
        pyautogui.press(key)

    def hotkey(self, *keys: str) -> None:
        pyautogui.hotkey(*keys)

    def hold_key(self, key: str, duration: float = 0.5) -> None:
        pyautogui.keyDown(key)
        time.sleep(duration)
        pyautogui.keyUp(key)

    def type_with_delay(self, text: str, char_delay: float = 0.05) -> None:
        for char in text:
            pyautogui.press(char) if len(char) == 1 else pyautogui.press(char)
            time.sleep(char_delay)

    def press_and_release(self, keys: List[str], pause: float = 0.1) -> None:
        for key in keys:
            pyautogui.press(key)
            time.sleep(pause)
