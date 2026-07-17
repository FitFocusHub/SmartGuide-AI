import pyautogui
import time
from typing import Optional, Tuple

pyautogui.FAILSAFE = True
pyautogui.PAUSE = 0.1

class MouseController:
    def __init__(self):
        self.screen_width, self.screen_height = pyautogui.size()

    def move_to(self, x: int, y: int, duration: float = 0.3) -> None:
        x = max(0, min(x, self.screen_width))
        y = max(0, min(y, self.screen_height))
        pyautogui.moveTo(x, y, duration=duration, tween=pyautogui.easeOutQuad)

    def click(self, x: int, y: int, button: str = "left") -> None:
        self.move_to(x, y)
        pyautogui.click(button=button)

    def double_click(self, x: int, y: int) -> None:
        self.move_to(x, y)
        pyautogui.doubleClick()

    def right_click(self, x: int, y: int) -> None:
        self.move_to(x, y)
        pyautogui.rightClick()

    def drag(self, x1: int, y1: int, x2: int, y2: int, duration: float = 0.5) -> None:
        self.move_to(x1, y1)
        pyautogui.drag(
            x2 - x1, y2 - y1,
            duration=duration,
            tween=pyautogui.easeOutQuad
        )

    def scroll(self, x: int, y: int, clicks: int) -> None:
        self.move_to(x, y)
        pyautogui.scroll(clicks)

    def get_position(self) -> Tuple[int, int]:
        return pyautogui.position()
