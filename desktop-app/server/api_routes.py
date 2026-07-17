from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any

app = FastAPI(title="SmartGuide AI", version="1.0.0")

class QueryRequest(BaseModel):
    query: str
    context: Optional[Dict] = None
    software: str = "general"

class ExecuteRequest(BaseModel):
    action: str
    coordinates: Optional[Dict] = None
    text: Optional[str] = None
    key: Optional[str] = None
    keys: Optional[list] = None
    clicks: Optional[int] = None

@app.get("/api/status")
async def status():
    return {"status": "running", "version": "1.0.0"}

@app.post("/api/query")
async def query(request: QueryRequest):
    from ai.groq_handler import GroqHandler
    from automation.screen_analyzer import ScreenAnalyzer
    from utils.config import Config

    config = Config()
    if not config.groq_api_key:
        raise HTTPException(status_code=500, detail="API key not configured")

    analyzer = ScreenAnalyzer()
    groq = GroqHandler(config.groq_api_key)

    screenshot = analyzer.capture_full_screen()
    screenshot_path = analyzer.save_screenshot(screenshot, "api_query")

    import base64
    with open(screenshot_path, "rb") as f:
        img_b64 = base64.b64encode(f.read()).decode()

    response = await groq.send_query(
        query=request.query,
        screenshot_b64=img_b64,
        context=request.context,
        software=request.software
    )
    return response

@app.post("/api/execute")
async def execute(request: ExecuteRequest):
    from automation.mouse_controller import MouseController
    from automation.keyboard_controller import KeyboardController

    mouse = MouseController()
    keyboard = KeyboardController()

    coords = request.coordinates or {}
    x, y = coords.get("x", 0), coords.get("y", 0)

    try:
        if request.action == "click":
            mouse.click(x, y)
        elif request.action == "double_click":
            mouse.double_click(x, y)
        elif request.action == "right_click":
            mouse.right_click(x, y)
        elif request.action == "type":
            keyboard.type_text(request.text or "")
        elif request.action == "press":
            keyboard.press_key(request.key or "enter")
        elif request.action == "hotkey" and request.keys:
            keyboard.hotkey(*request.keys)
        elif request.action == "scroll":
            mouse.scroll(x, y, request.clicks or 3)

        return {"status": "success", "action": request.action}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/screenshot")
async def screenshot():
    from automation.screen_analyzer import ScreenAnalyzer
    analyzer = ScreenAnalyzer()
    screen = analyzer.capture_full_screen()
    path = analyzer.save_screenshot(screen, "api_screenshot")
    return {"path": path}
