import asyncio
import json
import logging
from typing import Set, Dict, Any, Optional
import websockets
from websockets.server import serve

logger = logging.getLogger("websocket")

class WebSocketServer:
    def __init__(self, host: str, port: int):
        self.host = host
        self.port = port
        self.clients: Set = set()
        self.server = None

    async def start(self):
        self.server = await serve(
            self._handle_client,
            self.host,
            self.port
        )
        logger.info(f"WebSocket server running on ws://{self.host}:{self.port}")
        logger.info("Browser extension se connect karein...")
        await self.server.wait_closed()

    async def _handle_client(self, websocket):
        self.clients.add(websocket)
        client_id = id(websocket)
        logger.info(f"Client connected: {client_id}")

        try:
            async for message in websocket:
                await self._process_message(websocket, message)
        except websockets.exceptions.ConnectionClosed:
            logger.info(f"Client disconnected: {client_id}")
        finally:
            self.clients.discard(websocket)

    async def _process_message(self, websocket, raw_message: str):
        try:
            message = json.loads(raw_message)
            msg_type = message.get("type", "")

            if msg_type == "query":
                await self._handle_query(websocket, message)
            elif msg_type == "execute":
                await self._handle_execute(websocket, message)
            elif msg_type == "ping":
                await websocket.send(json.dumps({"type": "pong"}))

        except json.JSONDecodeError:
            await websocket.send(json.dumps({
                "type": "error",
                "message": "Invalid JSON"
            }))
        except Exception as e:
            logger.error(f"Error: {e}")
            await websocket.send(json.dumps({
                "type": "error",
                "message": str(e)
            }))

    async def _handle_query(self, websocket, message: Dict):
        from ai.groq_handler import GroqHandler
        from utils.config import Config

        config = Config()
        groq = GroqHandler(config.groq_api_key)

        response = await groq.send_query(
            query=message.get("query", ""),
            context=message.get("context"),
            software=message.get("software", "general")
        )

        await websocket.send(json.dumps({
            "type": "response",
            **response
        }))

    async def _handle_execute(self, websocket, message: Dict):
        action = message.get("action", "")
        coords = message.get("coordinates", {})
        x, y = coords.get("x", 0), coords.get("y", 0)

        try:
            import pyautogui

            if action == "click":
                pyautogui.click(x, y)
            elif action == "double_click":
                pyautogui.doubleClick(x, y)
            elif action == "right_click":
                pyautogui.rightClick(x, y)
            elif action == "type":
                pyautogui.typewrite(message.get("text", ""), interval=0.03)
            elif action == "press":
                pyautogui.press(message.get("key", "enter"))
            elif action == "hotkey":
                keys = message.get("keys", [])
                pyautogui.hotkey(*keys)
            elif action == "scroll":
                pyautogui.scroll(message.get("clicks", 3))

            await websocket.send(json.dumps({
                "type": "execution_success",
                "action": action
            }))

        except Exception as e:
            await websocket.send(json.dumps({
                "type": "execution_error",
                "message": str(e)
            }))

    def stop(self):
        if self.server:
            self.server.close()
