/**
 * SmartGuide AI - Background Service Worker
 * Copyright (c) 2026 FitFocusHub. All Rights Reserved.
 * Unauthorized copying, modification, or distribution is strictly prohibited.
 */

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";
const BAZAARLINK_API_URL = "https://bazaarlink.ai/api/v1/chat/completions";
const BAZAARLINK_MODEL = "auto:free";

const _0x4a7b = "SG-FH-2026-X7K9";
const _0x7e2a = ["F", "i", "t", "F", "o", "c", "u", "s", "H", "u", "b"];
const _0x9c3d = _0x7e2a.join("");

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

let groqFailCount = 0;
let activeApi = "groq";

async function callAPI(url, model, messages, apiKey) {
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: model,
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

async function callGroq(messages, apiKey) {
    return callAPI(GROQ_API_URL, GROQ_MODEL, messages, apiKey);
}

async function callBazaarLink(messages, apiKey) {
    return callAPI(BAZAARLINK_API_URL, BAZAARLINK_MODEL, messages, apiKey);
}

function parseAIResponse(text) {
    try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) return JSON.parse(jsonMatch[0]);
    } catch (e) {}
    return { explanation: text, steps: [], highlight: [] };
}

async function callWithFallback(messages, groqKey, backupKey) {
    if (activeApi === "groq" && groqKey) {
        try {
            const reply = await callGroq(messages, groqKey);
            groqFailCount = 0;
            return { reply, api: "groq" };
        } catch (err) {
            groqFailCount++;
            console.warn("[SmartGuide] Groq failed:", err.message);

            if (groqFailCount >= 2 && backupKey) {
                console.log("[SmartGuide] Switching to BazaarLink...");
                activeApi = "bazaarlink";
                chrome.storage.local.set({ activeApi: "bazaarlink" });
            }
            throw err;
        }
    }

    if (backupKey) {
        try {
            if (activeApi !== "bazaarlink") {
                activeApi = "bazaarlink";
                chrome.storage.local.set({ activeApi: "bazaarlink" });
            }
            const reply = await callBazaarLink(messages, backupKey);
            return { reply, api: "bazaarlink" };
        } catch (err) {
            console.error("[SmartGuide] BazaarLink also failed:", err.message);
            throw err;
        }
    }

    throw new Error("No valid API key. Add Groq or BazaarLink key in extension settings.");
}

async function trySwitchBackToGroq(groqKey) {
    if (!groqKey || activeApi !== "bazaarlink") return;

    try {
        await callGroq(messages, groqKey);
        console.log("[SmartGuide] Groq available again, switching back...");
        activeApi = "groq";
        groqFailCount = 0;
        chrome.storage.local.set({ activeApi: "groq" });
    } catch (e) {
        // Groq still down, stay on BazaarLink
    }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("[SmartGuide] v" + _0x4a7b + " | Active: " + activeApi);
    if (message.type === "query") {
        handleQuery(message, sendResponse);
        return true;
    }
});

async function handleQuery(message, sendResponse) {
    try {
        const result = await chrome.storage.local.get(["apiKey", "backupApiKey"]);
        const groqKey = result.apiKey;
        const backupKey = result.backupApiKey;

        if (!groqKey && !backupKey) {
            sendResponse({
                error: "API key not set! Click the extension icon and add your Groq or BazaarLink API key."
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

        const { reply, api } = await callWithFallback(messages, groqKey, backupKey);
        const parsed = parseAIResponse(reply);

        parsed._v = _0x4a7b;
        parsed._api = api;
        sendResponse(parsed);
    } catch (err) {
        console.error("[SmartGuide] API error:", err);
        sendResponse({ error: `Error: ${err.message}` });
    }
}
