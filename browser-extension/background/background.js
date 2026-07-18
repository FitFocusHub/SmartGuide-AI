const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

const SYSTEM_PROMPT = `You are SmartGuide AI, a helpful website navigation assistant. You help users understand and use any website.

IMPORTANT RULES:
1. ALWAYS respond in the SAME LANGUAGE the user writes in
2. If user writes in Hindi (Hinglish/Devanagari), respond in Hindi
3. If user writes in English, respond in English
4. Keep responses SHORT and STEP-BY-STEP (max 5 steps)
5. For YouTube: explain play, pause, subscribe, like, comment, search, volume, fullscreen
6. For social media: explain posting, liking, commenting, sharing, following
7. For shopping: explain search, filter, add to cart, buy, reviews
8. For Google: explain search, filters, images, advanced search

ELEMENT FORMAT:
When telling where to click, use this format:
CLICK: "[element text]" at (x, y)

RESPONSE FORMAT:
Always return JSON with these fields:
- explanation: brief text answer (in user's language)
- steps: array of step objects with "description" field
- highlight: array of elements to highlight with {x, y, w, h, text} (only if needed)

Example:
{
  "explanation": "YouTube pe subscribe karne ke liye...",
  "steps": [{"description": "Channel page pe jao"}, {"description": "Subscribe button dabao"}],
  "highlight": [{"x": 400, "y": 300, "w": 120, "h": 40, "text": "Subscribe"}]
}`;

async function callGroqAPI(messages, apiKey) {
    const response = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: GROQ_MODEL,
            messages: messages,
            temperature: 0.7,
            max_tokens: 1024
        })
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error?.message || `API error ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
}

function parseAIResponse(text) {
    try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) return JSON.parse(jsonMatch[0]);
    } catch (e) {}

    return {
        explanation: text,
        steps: [],
        highlight: []
    };
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "query") {
        handleQuery(message, sendResponse);
        return true;
    }
});

async function handleQuery(message, sendResponse) {
    try {
        const result = await chrome.storage.local.get(["apiKey"]);
        const apiKey = result.apiKey;

        if (!apiKey) {
            sendResponse({
                error: "API key not set! Click the extension icon and add your Groq API key."
            });
            return;
        }

        const contextStr = message.context
            ? `\nPage: ${message.context.title}\nURL: ${message.context.url}\nElements: ${JSON.stringify(message.context.elements?.slice(0, 15) || [])}`
            : "";

        const messages = [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: `${message.query}${contextStr}` }
        ];

        const reply = await callGroqAPI(messages, apiKey);
        const parsed = parseAIResponse(reply);

        sendResponse(parsed);
    } catch (err) {
        console.error("[SmartGuide] API error:", err);
        sendResponse({
            error: `Error: ${err.message}`
        });
    }
}
