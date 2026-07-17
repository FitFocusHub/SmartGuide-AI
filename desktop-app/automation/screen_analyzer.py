import pyautogui
import cv2
import numpy as np
from PIL import Image
from typing import Optional, Tuple, Dict, List
from pathlib import Path

class ScreenAnalyzer:
    def __init__(self):
        self.screenshot_dir = Path(__file__).parent.parent / "screenshots"
        self.screenshot_dir.mkdir(exist_ok=True)

    def capture_full_screen(self) -> np.ndarray:
        screenshot = pyautogui.screenshot()
        return cv2.cvtColor(np.array(screenshot), cv2.COLOR_RGB2BGR)

    def capture_region(self, x: int, y: int, w: int, h: int) -> np.ndarray:
        screenshot = pyautogui.screenshot(region=(x, y, w, h))
        return cv2.cvtColor(np.array(screenshot), cv2.COLOR_RGB2BGR)

    def save_screenshot(self, image: np.ndarray, name: str = "screen") -> str:
        timestamp = Path(name).stem
        filepath = self.screenshot_dir / f"{name}.png"
        cv2.imwrite(str(filepath), image)
        return str(filepath)

    def find_template(
        self,
        screen: np.ndarray,
        template_path: str,
        confidence: float = 0.8
    ) -> Optional[Dict]:
        template = cv2.imread(template_path)
        if template is None:
            return None

        result = cv2.matchTemplate(screen, template, cv2.TM_CCOEFF_NORMED)
        min_val, max_val, min_loc, max_loc = cv2.minMaxLoc(result)

        if max_val >= confidence:
            h, w = template.shape[:2]
            return {
                "x": max_loc[0] + w // 2,
                "y": max_loc[1] + h // 2,
                "confidence": float(max_val),
                "width": w,
                "height": h
            }
        return None

    def extract_text_region(
        self,
        screen: np.ndarray,
        x: int,
        y: int,
        w: int,
        h: int
    ) -> str:
        try:
            import pytesseract
            region = screen[y:y+h, x:x+w]
            gray = cv2.cvtColor(region, cv2.COLOR_BGR2GRAY)
            _, binary = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
            text = pytesseract.image_to_string(binary)
            return text.strip()
        except ImportError:
            return ""

    def detect_buttons(self, screen: np.ndarray) -> List[Dict]:
        gray = cv2.cvtColor(screen, cv2.COLOR_BGR2GRAY)
        edges = cv2.Canny(gray, 50, 150)
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        buttons = []
        for contour in contours:
            x, y, w, h = cv2.boundingRect(contour)
            aspect_ratio = w / float(h)
            area = w * h

            if 50 < area < 50000 and 0.2 < aspect_ratio < 5.0:
                buttons.append({
                    "x": x + w // 2,
                    "y": y + h // 2,
                    "width": w,
                    "height": h
                })
        return buttons
