import tkinter as tk
from typing import List, Dict

class HighlightOverlay:
    def __init__(self):
        self.root = tk.Tk()
        self.root.withdraw()
        self.root.overrideredirect(True)
        self.root.attributes("-topmost", True)
        self.root.attributes("-transparentcolor", "black")
        self.root.geometry("1x1+0+0")
        self.highlights: List[Dict] = []
        self.canvas = None

    def _ensure_canvas(self):
        if self.canvas is None:
            screen_w = self.root.winfo_screenwidth()
            screen_h = self.root.winfo_screenheight()
            self.root.geometry(f"{screen_w}x{screen_h}+0+0")
            self.canvas = tk.Canvas(
                self.root,
                width=screen_w,
                height=screen_h,
                bg="black",
                highlightthickness=0
            )
            self.canvas.pack()
            self.root.deiconify()

    def highlight_region(
        self,
        x: int,
        y: int,
        w: int,
        h: int,
        color: str = "#00FF00",
        label: str = "",
        duration: int = 5000
    ):
        self._ensure_canvas()

        rect = self.canvas.create_rectangle(
            x, y, x + w, y + h,
            outline=color,
            width=3,
            fill=""
        )

        text_id = None
        if label:
            text_id = self.canvas.create_text(
                x, y - 15,
                text=label,
                fill="white",
                font=("Arial", 10, "bold"),
                anchor="w"
            )

        highlight = {
            "rect": rect,
            "text": text_id,
            "x": x, "y": y, "w": w, "h": h
        }
        self.highlights.append(highlight)

        if duration > 0:
            self.root.after(duration, lambda: self._remove_highlight(highlight))

    def _remove_highlight(self, highlight):
        if highlight in self.highlights:
            self.canvas.delete(highlight["rect"])
            if highlight["text"]:
                self.canvas.delete(highlight["text"])
            self.highlights.remove(highlight)

        if not self.highlights:
            self.root.withdraw()
            self.canvas = None

    def clear_highlights(self):
        for h in self.highlights[:]:
            self._remove_highlight(h)
        self.highlights.clear()
        self.root.withdraw()
        self.canvas = None

    def close(self):
        self.root.destroy()
