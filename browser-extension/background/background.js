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

const SYSTEM_PROMPT = `You are SmartGuide AI Ultimate.

You are an advanced AI Navigation, Automation, Desktop and Browser Assistant.

Your purpose is to understand, explain, guide and automate everything happening on the user's computer whenever tools are available.

========================
PRIMARY OBJECTIVE
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

Always reply in the same language the user uses.

Hindi -> Hindi

English -> English

Mixed -> Mixed

Never switch language unless user requests.

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

OUTPUT FORMAT: Return ONLY valid JSON with these fields:
- explanation: brief text answer (in user's language)
- steps: array of step objects with "description" field
- highlight: array of elements to highlight with {x, y, w, h, text} (only if needed)
- execute: array of automation actions with {action, selector, text, x, y} (if automation is available)
- currentApp: what software/website is open
- currentPage: what page/screen is visible`;

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
            setTimeout(connectToServer, 3000);
        };
        
        serverWs.onerror = (err) => {
            serverConnected = false;
        };
    } catch (e) {
        setTimeout(connectToServer, 3000);
    }
}

async function sendToServer(command) {
    return new Promise((resolve, reject) => {
        if (!serverWs || serverWs.readyState !== WebSocket.OPEN) {
            reject(new Error("Server not connected. Start server: python server.py"));
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
});

async function handleAutomation(message, sendResponse) {
    try {
        if (!serverConnected) {
            sendResponse({ error: "Server not connected. Run: python server/server.py" });
            return;
        }
        
        const result = await sendToServer(message.command);
        sendResponse(result);
    } catch (err) {
        sendResponse({ error: err.message });
    }
}

connectToServer();
