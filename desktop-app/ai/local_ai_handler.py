import httpx
import json
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger("local_ai")

class LocalAIHandler:
    def __init__(self, host: str = "http://localhost:11434"):
        self.host = host
        self.model = "llama3.2"

    async def send_query(
        self,
        query: str,
        context: Optional[Dict] = None
    ) -> Dict[str, Any]:
        prompt = f"User Query: {query}"
        if context:
            prompt += f"\nContext: {json.dumps(context)}"

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{self.host}/api/generate",
                    json={
                        "model": self.model,
                        "prompt": prompt,
                        "stream": False,
                        "format": "json"
                    }
                )
                data = response.json()
                return self._parse_response(data.get("response", ""))

        except Exception as e:
            logger.error(f"Ollama error: {e}")
            return {"error": str(e), "steps": [], "confidence": 0.0}

    def _parse_response(self, text: str) -> Dict[str, Any]:
        try:
            data = json.loads(text)
            return {
                "steps": data.get("steps", []),
                "highlight": data.get("highlight", []),
                "explanation": data.get("explanation", ""),
                "confidence": data.get("confidence", 0.3)
            }
        except json.JSONDecodeError:
            return {
                "steps": [],
                "highlight": [],
                "explanation": text,
                "confidence": 0.2
            }

    def is_available(self) -> bool:
        try:
            response = httpx.get(f"{self.host}/api/tags", timeout=5.0)
            return response.status_code == 200
        except Exception:
            return False
