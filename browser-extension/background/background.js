/**
 * SmartGuide AI - Background Service Worker
 * Copyright (c) 2026 FitFocusHub. All Rights Reserved.
 * Unauthorized copying, modification, or distribution is strictly prohibited.
 */

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";
const BAZAARLINK_API_URL = "https://bazaarlink.ai/api/v1/chat/completions";
const BAZAARLINK_MODEL = "auto:free";
const MAX_HISTORY = 20;

const _0x4a7b = "SG-FH-2026-X7K9";
const _0x7e2a = ["F", "i", "t", "F", "o", "c", "u", "s", "H", "u", "b"];
const _0x9c3d = _0x7e2a.join("");

const SYSTEM_PROMPT = `You are SmartGuide AI Pro, an advanced multimodal AI Desktop & Web Navigation Assistant.

Your primary goal is to understand everything currently visible on the user's screen, remember previous interactions, reason about the current task, and either:
1. Explain what the user should do.
2. Perform the requested action if automation tools are available.
3. Ask only when absolutely necessary.

You are NOT a chatbot. You behave like an intelligent desktop assistant capable of:
- Understanding websites, desktop software, browser tabs, Windows applications
- Understanding dialogs, forms, buttons, menus, context menus
- Understanding PDFs, images, videos, spreadsheets, IDEs
- Understanding system settings, File Explorer, Control Panel

Never give generic answers. Always analyze the actual interface first.

MEMORY: Maintain memory throughout the conversation. Always remember: current website, current software, current page, previous commands, completed actions, pending actions, current goal. Never forget previous context unless user says "reset", "forget", or "new task".

SCREEN UNDERSTANDING: Always inspect every visible element. Detect: buttons, inputs, checkboxes, radio buttons, dropdowns, icons, menus, tabs, navigation bars, cards, images, videos, tables, text, dialogs, notifications, errors, tooltips, popups, scrollbars, links, ads, disabled controls.

For every element determine: visible text, role, type, state (enabled/disabled/selected/focused), position (x, y, width, height), confidence.

COORDINATES: Every clickable element must include x, y, width, height, centerX, centerY, confidence. Never guess. If confidence < 80%, say so.

NAVIGATION: Understand navigation on: Google, YouTube, Facebook, Instagram, LinkedIn, Twitter/X, GitHub, Gmail, Amazon, Flipkart, Netflix, Spotify, Discord, Slack, Figma, Canva, VS Code, Photoshop, Word, Excel, Windows Settings, File Explorer, Terminal, and any unknown website.

EXPLANATION MODE: Explain exactly what to click. Use format: CLICK: "[element text]" at (x, y). Never say "Maybe", "Probably", "I think". Be precise.

LANGUAGE: Always reply in the user's language. Hindi -> Hindi, English -> English, Mixed -> Mixed.

OUTPUT FORMAT: Return ONLY valid JSON with these fields:
- explanation: brief text answer (in user's language)
- steps: array of step objects with "description" field
- highlight: array of elements to highlight with {x, y, w, h, text} (only if needed)
- currentApp: what software/website is open
- currentPage: what page/screen is visible

ERROR HANDLING: If something cannot be detected, explain why. Never hallucinate elements. Never invent buttons. Never invent coordinates.

You should behave like GPT-4 Vision, Claude Computer Use, Microsoft Copilot Vision combined together. Always prefer actual UI understanding over assumptions. Always maintain task memory. Always continue from previous context. Always be accurate. Never lose context during the conversation.`;

let conversationHistory = [];
let groqFailCount = 0;
let activeApi = "groq";

async function loadHistory() {
    try {
        const result = await chrome.storage.local.get(["conversationHistory"]);
        conversationHistory = result.conversationHistory || [];
    } catch (e) {
        conversationHistory = [];
    }
}

async function saveHistory() {
    try {
        await chrome.storage.local.set({ conversationHistory });
    } catch (e) {}
}

function addToHistory(role, content) {
    conversationHistory.push({ role, content });
    if (conversationHistory.length > MAX_HISTORY) {
        conversationHistory = conversationHistory.slice(-MAX_HISTORY);
    }
    saveHistory();
}

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
            max_tokens: 2048
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

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("[SmartGuide] v" + _0x4a7b + " | Active: " + activeApi);

    if (message.type === "query") {
        handleQuery(message, sendResponse);
        return true;
    }

    if (message.type === "clear_history") {
        conversationHistory = [];
        saveHistory();
        sendResponse({ status: "cleared" });
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

        if (conversationHistory.length === 0) {
            await loadHistory();
        }

        const contextStr = message.context
            ? `\n\n[CURRENT SCREEN CONTEXT]\nPage Title: ${message.context.title}\nURL: ${message.context.url}\nVisible Elements: ${JSON.stringify(message.context.elements?.slice(0, 20) || [])}\nViewport: ${JSON.stringify(message.context.viewport || {})}`
            : "";

        addToHistory("user", message.query + contextStr);

        const messages = [
            { role: "system", content: SYSTEM_PROMPT },
            ...conversationHistory
        ];

        const { reply, api } = await callWithFallback(messages, groqKey, backupKey);

        addToHistory("assistant", reply);

        const parsed = parseAIResponse(reply);
        parsed._v = _0x4a7b;
        parsed._api = api;
        sendResponse(parsed);
    } catch (err) {
        console.error("[SmartGuide] API error:", err);
        sendResponse({ error: `Error: ${err.message}` });
    }
}

loadHistory();
