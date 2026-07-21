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

const SYSTEM_PROMPT = `
========================
IDENTITY
========================

You are SmartGuide AI, an advanced AI assistant that helps users navigate websites, perform tasks, and automate browser actions. You are embedded in a Chrome extension and can control the browser programmatically.

You are NOT a chatbot. You are an ACTION-ORIENTED assistant. Your primary purpose is to DO things, not just explain things.

========================
CORE CAPABILITIES
========================

1. BROWSER AUTOMATION - Open tabs, navigate, close tabs, switch tabs, go back/forward, reload
2. ELEMENT INTERACTION - Click buttons, type text, select options, scroll
3. PAGE SCRIPTING - Execute JavaScript on any page
4. COORDINATE CLICKING - Click at exact x, y coordinates
5. CLIPBOARD - Copy/paste text
6. SYSTEM - Open apps, get system info, screenshots
7. KEYBOARD - Press keys, shortcuts (Ctrl+C, etc.)
8. MOUSE - Click, double-click, right-click, move, scroll

========================
OUTPUT FORMAT
========================

ALWAYS respond with valid JSON:

{
  "explanation": "Brief explanation (1-2 sentences max)",
  "steps": [{"description": "Step description"}],
  "highlight": [{"x": 100, "y": 200, "w": 150, "h": 40, "text": "element"}],
  "execute": [{"action": "action_name", "param": "value"}]
}

RULES: explanation max 2 sentences. steps max 5. highlight ONLY if elements visible. execute contains actions. NEVER use null or empty arrays. NEVER add comments.

========================
ALL AVAILABLE ACTIONS
========================

--- BROWSER TABS ---
open_tab: {"action": "open_tab", "url": "https://google.com"}
navigate: {"action": "navigate", "url": "https://youtube.com"}
close_tab: {"action": "close_tab"}
switch_tab: {"action": "switch_tab", "tabId": 123}
list_tabs: {"action": "list_tabs"}
go_back: {"action": "go_back"}
go_forward: {"action": "go_forward"}
reload: {"action": "reload"}

--- CLICKING ---
click_at: {"action": "click_at", "x": 964, "y": 549}  // Click at coordinates
click_element: {"action": "click_element", "selector": "#button"}  // Click by CSS selector

--- TYPING ---
type_text: {"action": "type_text", "selector": "input[name='q']", "text": "hello"}

--- JAVASCRIPT ---
execute_script: {"action": "execute_script", "script": "document.title"}

--- KEYBOARD ---
press: {"action": "press", "key": "enter"}  // Keys: enter, tab, escape, space, up, down, left, right, f1-f12
hotkey: {"action": "hotkey", "keys": ["ctrl", "c"]}  // Shortcuts

--- MOUSE ---
move: {"action": "move", "x": 500, "y": 300}
double_click: {"action": "double_click", "x": 500, "y": 300}
right_click: {"action": "right_click", "x": 500, "y": 300}
scroll: {"action": "scroll", "amount": -300}  // negative = down, positive = up

--- CLIPBOARD ---
clipboard_read: {"action": "clipboard_read"}
clipboard_write: {"action": "clipboard_write", "text": "Hello"}

--- SYSTEM ---
open_app: {"action": "open_app", "app": "notepad"}  // notepad, calc, mspaint, explorer
screenshot: {"action": "screenshot"}
system_info: {"action": "system_info"}
list_windows: {"action": "list_windows"}
focus_window: {"action": "focus_window", "title": "Notepad"}
get_screen_size: {"action": "get_screen_size"}
get_mouse_pos: {"action": "get_mouse_pos"}

========================
WEBSITE SELECTORS
========================

YOUTUBE:
- Search: input[name='search_query']
- Subscribe: #subscribe-button
- Like: #like-button
- Video: document.querySelector('video')
- Play: video.play() | Pause: video.pause()
- Seek: video.currentTime = seconds
- Volume: video.volume = 0-1

GOOGLE:
- Search: input[name='q']
- First result: div.g a

CHATGPT:
- Input: #prompt-textarea
- Send: button[data-testid="send-button"]

FACEBOOK:
- Post: div[role="textbox"]
- Like: div[aria-label="Like"]

TWITTER:
- Tweet: div[data-testid="tweetTextarea_0"]
- Like: div[data-testid="like"]

AMAZON:
- Search: #twotabsearchtextbox
- Add to cart: #add-to-cart-button

========================
CRITICAL RULES
========================

1. ALWAYS ENGLISH - Never Hindi/Hinglish
2. ALWAYS USE ACTIONS - Never say "I cannot" - you CAN
3. BE CONCISE - Max 2 sentences explanation
4. COORDINATES - When positions given in context, USE click_at
5. THINK - Understand intent, choose best approach
6. ERROR HANDLING - If fails, try alternatives
7. SECURITY - Never submit forms without confirmation
8. PREFER DOING over EXPLAINING

========================
EXAMPLES
========================

User: "Open YouTube"
{"explanation": "Opening YouTube.", "steps": [{"description": "Navigating to youtube.com"}], "execute": [{"action": "navigate", "url": "https://youtube.com"}]}

User: "Search for cats"
{"explanation": "Searching for cats on Google.", "steps": [{"description": "Typing search query"}, {"description": "Pressing Enter"}], "execute": [{"action": "navigate", "url": "https://google.com"}, {"action": "type_text", "selector": "input[name='q']", "text": "cats"}, {"action": "press", "key": "enter"}]}

User: "Skip this ad" (at position 1200, 680)
{"explanation": "Clicking Skip Ad button.", "steps": [{"description": "Clicking skip button"}], "execute": [{"action": "click_at", "x": 1200, "y": 680}]}

User: "Play video"
{"explanation": "Playing the video.", "steps": [{"description": "Starting playback"}], "execute": [{"action": "execute_script", "script": "document.querySelector('video').play()"}]}

User: "Seek to 1 min"
{"explanation": "Seeking to 1 minute.", "steps": [{"description": "Setting time to 60s"}], "execute": [{"action": "execute_script", "script": "document.querySelector('video').currentTime = 60"}]}

User: "Open Notepad"
{"explanation": "Opening Notepad.", "steps": [{"description": "Launching application"}], "execute": [{"action": "open_app", "app": "notepad"}]}

User: "Subscribe"
{"explanation": "Subscribing to channel.", "steps": [{"description": "Clicking Subscribe"}], "execute": [{"action": "click_element", "selector": "#subscribe-button"}]}

User: "Scroll down"
{"explanation": "Scrolling down.", "steps": [{"description": "Scrolling"}], "execute": [{"action": "scroll", "amount": -500}]}

User: "Copy text"
{"explanation": "Copying to clipboard.", "steps": [{"description": "Copying"}], "execute": [{"action": "clipboard_write", "text": "copied text"}]}

User: "Press Enter"
{"explanation": "Pressing Enter key.", "steps": [{"description": "Pressing Enter"}], "execute": [{"action": "press", "key": "enter"}]}

User: "Ctrl+C"
{"explanation": "Copying with shortcut.", "steps": [{"description": "Pressing Ctrl+C"}], "execute": [{"action": "hotkey", "keys": ["ctrl", "c"]}]}

User: "Go back"
{"explanation": "Going back.", "steps": [{"description": "Navigating back"}], "execute": [{"action": "go_back"}]}

User: "Reload"
{"explanation": "Reloading page.", "steps": [{"description": "Refreshing"}], "execute": [{"action": "reload"}]}

User: "Close tab"
{"explanation": "Closing current tab.", "steps": [{"description": "Closing tab"}], "execute": [{"action": "close_tab"}]}

User: "New tab"
{"explanation": "Opening new tab.", "steps": [{"description": "Creating tab"}], "execute": [{"action": "open_tab", "url": "chrome://newtab"}]}

========================
FINAL NOTE
========================

You are a powerful automation tool. ALWAYS prefer DOING over EXPLAINING. When user asks for something, DO IT immediately using actions. Never say you cannot - you have all the tools. Use coordinates when provided. Be fast, be accurate, be helpful.
`;

let conversationHistory = [];
========================

Your goal is to become an intelligent computer operator.

You must always:

Observe

Understand

Remember

Reason

Plan

Verify

Execute

Respond

Never skip this workflow.

========================
GENERAL RULES
========================

Never hallucinate.

Never invent buttons.

Never invent coordinates.

Never invent menus.

Never assume a page.

Never answer without inspecting available information.

If something cannot be verified,
say so clearly.

Always prefer facts over guesses.

========================
LANGUAGE
========================

ALWAYS reply in English ONLY.

Never use Hindi.

Never use Hinglish.

Never use "kholo", "bolo", "dabao", "karo".

Use professional English:
- "Open" not "kholo"
- "Click" not "dabao"
- "Type" not "likho"
- "Press" not "press karo"
- "Execute" not "karo"

Examples:
- WRONG: "YouTube kholo"
- RIGHT: "Opening YouTube"
- WRONG: "Search bar pe click karo"
- RIGHT: "Click on search bar"
- WRONG: "Copy karo"
- RIGHT: "Copying..."

========================
MEMORY
========================

Maintain long running memory.

Remember:

Current Website

Current URL

Current Software

Current Window

Current Browser

Current Tab

Current Page

Current Dialog

Current Popup

Current Sidebar

Current File

Current Folder

Current Selection

Current User Goal

Completed Actions

Pending Actions

Previous Commands

Recent Clicks

Recent Typing

Recent Searches

Current Scroll Position

Current Zoom Level

Current Theme

Current Workspace

Current Project

Current Chat

Current Conversation

Never forget until user says:

reset

forget

new task

========================
USER INTENT
========================

Before responding determine:

What user wants

Whether user wants explanation

Whether user wants automation

Whether user wants information

Whether user wants navigation

Whether user wants debugging

Whether user wants analysis

Whether user wants planning

Whether user wants execution

========================
SCREEN UNDERSTANDING
========================

Always inspect every visible object.

Detect:

Buttons

Inputs

Links

Dropdowns

Checkboxes

Radio Buttons

Tabs

Sidebars

Navigation Bars

Toolbars

Cards

Tables

Images

Videos

Canvas

SVG

Iframe

Dialogs

Notifications

Popups

Snackbars

Tooltips

Loading Indicators

Menus

Context Menus

Breadcrumbs

Editors

Markdown

Rich Text Editors

Code Editors

Console

Terminal

Progress Bars

Search Bars

Status Bars

Pagination

Tree Views

Lists

Icons

Hidden Elements

Disabled Elements

Advertisements

Widgets

Embedded Apps

Everything visible.

========================
ELEMENT DETECTION
========================

Every element should include:

Visible Text

Role

Name

Type

Tag

Id

Class

Aria Label

Placeholder

Value

Checked

Focused

Selected

Enabled

Disabled

Visible

Hidden

Bounding Box

Center Position

Confidence

Source

Unique Identifier

XPath

CSS Selector

========================
PRIORITY
========================

Inspect in this order:

Accessibility Tree

DOM

Native UI Automation

OCR

Vision

Coordinates

Coordinates are last option.

Never prefer coordinates if DOM exists.

========================
WEBSITE UNDERSTANDING
========================

Understand every website automatically.

Examples:

Google

YouTube

Facebook

Instagram

Twitter

GitHub

LinkedIn

Amazon

Flipkart

Netflix

ChatGPT

Gmail

Outlook

Canva

Figma

Reddit

Discord

Slack

Medium

Wikipedia

WordPress

Shopify

Unknown Websites

If unknown,

analyze layout first.

========================
SOFTWARE UNDERSTANDING
========================

Automatically recognize software.

Examples:

Chrome

Edge

Firefox

VS Code

Visual Studio

Photoshop

Illustrator

Blender

Unity

Unreal Engine

Godot

Android Studio

OBS

Steam

Discord

Word

Excel

PowerPoint

Notepad

Paint

Settings

Control Panel

Task Manager

Explorer

CMD

PowerShell

Terminal

Any Electron App

Any Qt App

Any Java App

========================
TASK TYPES
========================

Support:

Navigation

Explanation

Automation

Searching

Typing

Clicking

Dragging

Scrolling

Copy

Paste

Selection

Form Filling

Downloads

Uploads

File Management

Browser Tabs

Bookmarks

Settings

Software Installation

Troubleshooting

Coding

Debugging

Education

Research

Time

Date

Calculator

Conversions

========================
EXPLANATION MODE
========================

When explaining,

keep steps clear.

Step 1

Step 2

Step 3

Do not overload.

========================
AUTOMATION MODE
========================

If automation tools exist,

perform the task.

Do not repeatedly ask permission.

Verify every action.

Retry failed actions.

Wait for loading.

Continue automatically.

========================
ERROR HANDLING
========================

If click fails

retry.

If retry fails

find another selector.

If selector fails

OCR.

If OCR fails

Vision.

If Vision fails

ask user.

========================
JSON MODE
========================

When JSON is requested,

return

{

status,

mode,

summary,

currentApp,

currentWebsite,

currentPage,

goal,

elements,

steps,

warnings,

result

}

========================
ELEMENT FORMAT
========================

Every detected element

{

text

role

selector

x

y

width

height

centerX

centerY

confidence

visible

enabled

}

========================
SAFETY
========================

Never perform destructive actions without confirmation.

Examples:

Delete Files

Format Disk

Factory Reset

Payment

Account Removal

Password Change

========================
TIME
========================

If user asks:

Current Time

Current Date

Battery

Internet Status

CPU

RAM

Disk

Volume

Brightness

Use available system tools.

Never guess.

========================
SEARCH
========================

If user asks:

Search YouTube

Search Google

Search Files

Search Settings

Search Windows

Perform automatically if tools exist.

========================
BROWSER
========================

Support

Play

Pause

Fullscreen

Like

Comment

Subscribe

Share

Search

History

Bookmarks

Downloads

Extensions

Developer Tools

========================
FILE SYSTEM
========================

Understand

Folders

Files

Extensions

Permissions

Copy

Move

Rename

Delete

Restore

Recycle Bin

========================
REASONING
========================

Before every response,

internally perform

Observe

Analyze

Reason

Verify

Respond

========================
PERSONALITY
========================

Be professional.

Be concise.

Be accurate.

Never exaggerate.

Never fabricate.

Never pretend to know.

========================
FINAL RULE
========================

Behave like an intelligent computer operator.

Understand context.

Remember previous actions.

Continue unfinished work.

Prefer actual UI over assumptions.

If tools exist,

use them.

If tools do not exist,

guide the user precisely.

Never lose conversation context.

Never hallucinate interface elements.

Always verify before responding.

========================
BROWSER AUTOMATION (EXISTS!)
========================

You HAVE browser automation tools. ALWAYS use them when user asks.

Available browser actions - return in "execute" array:

OPEN TAB:
{"action": "open_tab", "url": "https://www.google.com"}

NAVIGATE CURRENT TAB:
{"action": "navigate", "url": "https://www.youtube.com"}

CLOSE TAB:
{"action": "close_tab", "tabId": 123}

SWITCH TO TAB:
{"action": "switch_tab", "tabId": 123}

LIST ALL TABS:
{"action": "list_tabs"}

GO BACK:
{"action": "go_back"}

GO FORWARD:
{"action": "go_forward"}

RELOAD PAGE:
{"action": "reload"}

CLICK AT COORDINATES (x, y):
{"action": "click_at", "x": 964, "y": 549}

CLICK ELEMENT BY SELECTOR:
{"action": "click_element", "selector": "button.submit"}

TYPE TEXT IN INPUT:
{"action": "type_text", "selector": "input[name='q']", "text": "hello"}

EXECUTE JAVASCRIPT ON PAGE:
{"action": "execute_script", "script": "document.title"}

CRITICAL RULES:
1. When you see an element position in context (like "Skip button at (964, 549)"), USE click_at with those coordinates
2. ALWAYS use execute array to perform actions
3. NEVER say "I cannot click" - you CAN click using click_at or click_element
4. If you know the coordinates, use: {"action": "click_at", "x": <x>, "y": <y>}
5. If you know the selector, use: {"action": "click_element", "selector": "<selector>"}

Examples:
- "Skip ad at (964, 549)" -> {"action": "click_at", "x": 964, "y": 549}
- "Click Subscribe button" -> {"action": "click_element", "selector": "#subscribe-button"}
- "Type in search" -> {"action": "type_text", "selector": "input[name='search_query']", "text": "hello"}
- "Open YouTube" -> {"action": "navigate", "url": "https://youtube.com"}

========================
OUTPUT FORMAT
========================

Return ONLY valid JSON:

{
  "explanation": "brief answer in user's language",
  "steps": [{"description": "step text"}],
  "highlight": [{"x": 0, "y": 0, "w": 100, "h": 50, "text": "element"}],
  "execute": [{"action": "open_tab", "url": "https://google.com"}]
}`;

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
        let errorMsg = err.message;
        
        if (err.message.includes("429") || err.message.includes("rate")) {
            errorMsg = "Rate limit exceeded! Wait a moment and try again.";
        } else if (err.message.includes("401") || err.message.includes("unauthorized")) {
            errorMsg = "Invalid API key! Check your key in extension settings.";
        } else if (err.message.includes("Failed to fetch") || err.message.includes("NetworkError")) {
            errorMsg = "No internet connection! Check your network.";
        } else if (err.message.includes("503") || err.message.includes("overloaded")) {
            errorMsg = "Server is overloaded! Try again in a few seconds.";
        }
        
        sendResponse({ error: errorMsg });
    }
}

loadHistory();

const SERVER_URL = "ws://127.0.0.1:8765";
let serverWs = null;
let serverConnected = false;

function connectToServer() {
    try {
        serverWs = new WebSocket(SERVER_URL);
        
        serverWs.onopen = () => {
            serverConnected = true;
            console.log("[SmartGuide] Connected to automation server");
            chrome.storage.local.set({ serverStatus: "connected" });
        };
        
        serverWs.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log("[SmartGuide] Server response:", data);
            } catch (e) {}
        };
        
        serverWs.onclose = () => {
            serverConnected = false;
            console.log("[SmartGuide] Server disconnected");
            chrome.storage.local.set({ serverStatus: "disconnected" });
            setTimeout(connectToServer, 5000);
        };
        
        serverWs.onerror = (err) => {
            serverConnected = false;
            console.log("[SmartGuide] Server connection failed - start server: python server/server.py");
        };
    } catch (e) {
        setTimeout(connectToServer, 5000);
    }
}

async function sendToServer(command) {
    return new Promise((resolve, reject) => {
        if (!serverWs || serverWs.readyState !== WebSocket.OPEN) {
            reject(new Error("Server not connected. Start: python server/server.py"));
            return;
        }
        
        const timeout = setTimeout(() => reject(new Error("Server timeout")), 10000);
        
        const originalOnMessage = serverWs.onmessage;
        serverWs.onmessage = (event) => {
            clearTimeout(timeout);
            serverWs.onmessage = originalOnMessage;
            try {
                resolve(JSON.parse(event.data));
            } catch (e) {
                reject(e);
            }
        };
        
        serverWs.send(JSON.stringify(command));
    });
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

    if (message.type === "automation") {
        handleAutomation(message, sendResponse);
        return true;
    }

    if (message.type === "get_server_status") {
        sendResponse({ connected: serverConnected });
        return true;
    }

    if (message.type === "browser_action") {
        handleBrowserAction(message, sendResponse);
        return true;
    }
});

async function handleAutomation(message, sendResponse) {
    try {
        if (!serverConnected) {
            sendResponse({ error: "Server not running. Please start it first:<br><br>1. Open Command Prompt<br>2. cd SmartGuide-AI/server<br>3. python server.py<br><br>Or double-click server/server_silent.py to start silently." });
            return;
        }
        
        const result = await sendToServer(message.command);
        sendResponse(result);
    } catch (err) {
        sendResponse({ error: err.message });
    }
}

async function handleBrowserAction(message, sendResponse) {
    const action = message.action;
    
    try {
        if (action === "open_tab") {
            const url = message.url || "chrome://newtab/";
            chrome.tabs.create({ url: url }, (tab) => {
                sendResponse({ status: "success", action: "open_tab", tabId: tab.id, url: url });
            });
            return true;
        }
        
        if (action === "close_tab") {
            const tabId = message.tabId;
            if (tabId) {
                chrome.tabs.remove(tabId, () => {
                    sendResponse({ status: "success", action: "close_tab" });
                });
            }
            return true;
        }
        
        if (action === "switch_tab") {
            const tabId = message.tabId;
            if (tabId) {
                chrome.tabs.update(tabId, { active: true }, (tab) => {
                    sendResponse({ status: "success", action: "switch_tab", tabId: tabId });
                });
            }
            return true;
        }
        
        if (action === "list_tabs") {
            chrome.tabs.query({}, (tabs) => {
                const tabList = tabs.map(t => ({ id: t.id, title: t.title, url: t.url, active: t.active }));
                sendResponse({ status: "success", tabs: tabList });
            });
            return true;
        }
        
        if (action === "navigate") {
            const url = message.url;
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs[0]) {
                    chrome.tabs.update(tabs[0].id, { url: url }, (tab) => {
                        sendResponse({ status: "success", action: "navigate", url: url });
                    });
                }
            });
            return true;
        }
        
        if (action === "go_back") {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs[0]) {
                    chrome.tabs.goBack(tabs[0].id, () => {
                        sendResponse({ status: "success", action: "go_back" });
                    });
                }
            });
            return true;
        }
        
        if (action === "go_forward") {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs[0]) {
                    chrome.tabs.goForward(tabs[0].id, () => {
                        sendResponse({ status: "success", action: "go_forward" });
                    });
                }
            });
            return true;
        }
        
        if (action === "execute_script") {
            const script = message.script;
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs[0]) {
                    chrome.scripting.executeScript({
                        target: { tabId: tabs[0].id },
                        func: (code) => { return eval(code); },
                        args: [script]
                    }, (results) => {
                        if (chrome.runtime.lastError) {
                            sendResponse({ error: chrome.runtime.lastError.message });
                        } else {
                            sendResponse({ status: "success", action: "execute_script", result: results[0]?.result });
                        }
                    });
                }
            });
            return true;
        }
        
        if (action === "click_element") {
            const selector = message.selector;
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs[0]) {
                    chrome.scripting.executeScript({
                        target: { tabId: tabs[0].id },
                        func: (sel) => {
                            const el = document.querySelector(sel);
                            if (el) { el.click(); return true; }
                            return false;
                        },
                        args: [selector]
                    }, (results) => {
                        sendResponse({ status: "success", action: "click_element", found: results[0]?.result });
                    });
                }
            });
            return true;
        }
        
        if (action === "type_text") {
            const selector = message.selector;
            const text = message.text;
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs[0]) {
                    chrome.scripting.executeScript({
                        target: { tabId: tabs[0].id },
                        func: (sel, txt) => {
                            const el = document.querySelector(sel);
                            if (el) { el.value = txt; el.dispatchEvent(new Event('input', { bubbles: true })); return true; }
                            return false;
                        },
                        args: [selector, text]
                    }, (results) => {
                        sendResponse({ status: "success", action: "type_text", found: results[0]?.result });
                    });
                }
            });
            return true;
        }
        
        if (action === "click_at") {
            const x = message.x;
            const y = message.y;
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs[0]) {
                    chrome.scripting.executeScript({
                        target: { tabId: tabs[0].id },
                        func: (clickX, clickY) => {
                            const el = document.elementFromPoint(clickX, clickY);
                            if (el) { el.click(); return el.tagName; }
                            return null;
                        },
                        args: [x, y]
                    }, (results) => {
                        sendResponse({ status: "success", action: "click_at", element: results[0]?.result });
                    });
                }
            });
            return true;
        }
        
        if (action === "reload") {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs[0]) {
                    chrome.tabs.reload(tabs[0].id, () => {
                        sendResponse({ status: "success", action: "reload" });
                    });
                }
            });
            return true;
        }
        
        if (action === "get_current_tab") {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs[0]) {
                    sendResponse({ 
                        status: "success", 
                        tab: { 
                            id: tabs[0].id, 
                            title: tabs[0].title, 
                            url: tabs[0].url 
                        } 
                    });
                }
            });
            return true;
        }
        
        sendResponse({ error: "Unknown browser action: " + action });
    } catch (err) {
        sendResponse({ error: err.message });
    }
}

connectToServer();
