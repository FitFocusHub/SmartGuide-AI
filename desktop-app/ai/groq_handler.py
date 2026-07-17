from groq import Groq
from typing import Optional, Dict, Any
import json
import re
import time
import logging
import random
import httpx
from .prompt_templates import PromptTemplates

logger = logging.getLogger("groq")

GREETING_PATTERNS = [
    r'\bhi+\b', r'\bhey+\b', r'\bhello+\b', r'\bhoi+\b', r'\bhaan+\b',
    r'\bnamaste\b', r'\bgood morning\b', r'\bgood evening\b',
    r'\bhow are you\b', r'\bkya hal\b', r'\bwhat.*up\b',
    r'\bsup\b', r'\byo+\b', r'\bhiya+\b', r'\bgreetings\b',
]

GREETING_RESPONSES = [
    "Namaste! Kya madad chahun?",
    "Hey! Batao kya karna hai?",
    "Haan bolo, kya help chahiye?",
    "Welcome! SmartGuide ready hai, bolo kya karun?",
    "Hi there! Kya kaam hai?",
    "Namaskar! Aaj kya karna hai?",
    "Hey! Main hoon tumhara guide, bolo!",
    "Haan ji, bolo bolo!",
    "Kya haal hai? Batao kya karun!",
    "Ready hoon! Command do!",
    "Bolo bolo, kya chahiye?",
    "Hey! SmartGuide AI hazir hai!",
    "Namaste! Kya seekhna hai aaj?",
    "Hi! Batao konsa kaam karna hai?",
    "Haan, main sun raha hoon. Bolo!",
]

class GroqHandler:
    def __init__(self, groq_key: str, cerebras_key: str = ""):
        self.groq_key = groq_key
        self.client = Groq(api_key=groq_key)
        self.model = "llama-3.3-70b-versatile"
        self.templates = PromptTemplates()
        
        # BazaarLink config
        self.bazaar_key = "sk-bl-ySUrU-uRVguB5Sz4miiR0ZeyjXRd3U9qUid79UXdGVYSo6ll"
        self.bazaar_url = "https://bazaarlink.ai/api/v1/chat/completions"
        self.bazaar_model = "auto:free"
        
        self.active_provider = "groq"
        self.groq_rate_limited_at = 0
        self.groq_reset_interval = 1800  # 30 min

    def _is_greeting(self, text: str) -> bool:
        text_lower = text.lower().strip()
        for pattern in GREETING_PATTERNS:
            if re.search(pattern, text_lower):
                return True
        return False

    def _parse_response(self, text: str, context: Optional[Dict] = None) -> Dict[str, Any]:
        try:
            text = text.strip()
            json_match = re.search(r'\{[\s\S]*\}', text)
            if json_match:
                data = json.loads(json_match.group(0))
                return {
                    "explanation": data.get("explanation", ""),
                    "steps": data.get("steps", []),
                    "highlight": data.get("highlight", []),
                    "execute": data.get("execute", []),
                    "confidence": data.get("confidence", 0.7)
                }
            return {"explanation": text, "steps": [], "highlight": [], "execute": [], "confidence": 0.5}
        except:
            return {"explanation": text[:300] if len(text) > 300 else text, "steps": [], "highlight": [], "execute": [], "confidence": 0.3}

    def _call_bazaar(self, messages):
        """Call BazaarLink API"""
        try:
            response = httpx.post(
                self.bazaar_url,
                headers={
                    "Authorization": f"Bearer {self.bazaar_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": self.bazaar_model,
                    "messages": messages,
                    "temperature": 0.3,
                    "max_tokens": 2048
                },
                timeout=30
            )
            if response.status_code == 200:
                data = response.json()
                content = data["choices"][0]["message"]["content"]
                # Handle empty content with reasoning
                if not content.strip():
                    content = data["choices"][0]["message"].get("reasoning_content", "")
                return content
            else:
                logger.error(f"Bazaar error: {response.status_code} - {response.text[:200]}")
                return None
        except Exception as e:
            logger.error(f"Bazaar error: {e}")
            return None

    async def send_query(
        self,
        query: str,
        context: Optional[Dict] = None,
        software: str = "general"
    ) -> Dict[str, Any]:
        if self._is_greeting(query):
            greeting = random.choice(GREETING_RESPONSES)
            return {
                "explanation": greeting,
                "steps": [],
                "highlight": [],
                "execute": [],
                "confidence": 1.0
            }

        system_prompt = self.templates.get_template(software)
        
        user_msg = query
        if context and context.get("elements"):
            elements_text = "\n\nPAGE ELEMENTS (use these EXACT coordinates):\n"
            for i, el in enumerate(context["elements"]):
                elements_text += f"{i+1}. \"{el.get('text', '')}\" - x:{el.get('x')}, y:{el.get('y')}, w:{el.get('w')}, h:{el.get('h')}, tag:{el.get('tag')}\n"
            user_msg += elements_text

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_msg}
        ]

        # Check if Groq has reset
        if self.active_provider == "bazaar" and self.groq_rate_limited_at > 0:
            time_since_limit = time.time() - self.groq_rate_limited_at
            if time_since_limit > self.groq_reset_interval:
                logger.info(f"Trying Groq again after {int(time_since_limit)}s...")
                self.active_provider = "groq"
                self.groq_rate_limited_at = 0

        # Try Groq first
        if self.active_provider == "groq":
            try:
                response = self.client.chat.completions.create(
                    model=self.model,
                    messages=messages,
                    temperature=0.3,
                    max_tokens=2048
                )
                result_text = response.choices[0].message.content
                logger.info(f"Groq OK: {result_text[:100]}")
                return self._parse_response(result_text, context)
            except Exception as e:
                error_str = str(e)
                logger.warning(f"Groq error: {error_str[:200]}")
                
                if "429" in error_str or "rate" in error_str.lower() or "limit" in error_str.lower():
                    logger.info("Groq rate limit! Switching to BazaarLink...")
                    self.active_provider = "bazaar"
                    self.groq_rate_limited_at = time.time()
                else:
                    return {"error": str(e), "explanation": "Error aa gaya", "steps": [], "highlight": [], "execute": [], "confidence": 0}

        # Try BazaarLink
        if self.active_provider == "bazaar":
            result_text = self._call_bazaar(messages)
            if result_text:
                logger.info(f"Bazaar OK: {result_text[:100]}")
                return self._parse_response(result_text, context)
            else:
                return {"error": "Dono providers kaam nahi kar rahe", "explanation": "Thodi der baad try karo", "steps": [], "highlight": [], "execute": [], "confidence": 0}
        
        return {"error": "No provider available", "explanation": "API available nahi hai", "steps": [], "highlight": [], "execute": [], "confidence": 0}
