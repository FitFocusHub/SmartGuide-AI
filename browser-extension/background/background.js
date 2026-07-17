const WS_URL = "ws://127.0.0.1:8765";
const RECONNECT_DELAY = 3000;
const MAX_RECONNECT_ATTEMPTS = 10;

let ws = null;
let reconnectAttempts = 0;
let messageQueue = [];
let isConnected = false;

function connect() {
    if (ws && ws.readyState === WebSocket.OPEN) return;

    ws = new WebSocket(WS_URL);

    ws.onopen = () => {
        console.log("[SmartGuide] Connected to desktop app");
        isConnected = true;
        reconnectAttempts = 0;
        chrome.storage.local.set({ connectionStatus: "connected" });

        while (messageQueue.length > 0) {
            const msg = messageQueue.shift();
            ws.send(JSON.stringify(msg));
        }
    };

    ws.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            handleMessage(data);
        } catch (e) {
            console.error("[SmartGuide] Parse error:", e);
        }
    };

    ws.onclose = () => {
        console.log("[SmartGuide] Disconnected from desktop app");
        isConnected = false;
        chrome.storage.local.set({ connectionStatus: "disconnected" });
        attemptReconnect();
    };

    ws.onerror = (error) => {
        console.error("[SmartGuide] WebSocket error:", error);
    };
}

function attemptReconnect() {
    if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
        console.log("[SmartGuide] Max reconnection attempts reached");
        return;
    }
    reconnectAttempts++;
    setTimeout(connect, RECONNECT_DELAY);
}

function sendMessage(message) {
    if (isConnected && ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
    } else {
        messageQueue.push(message);
        connect();
    }
}

function handleMessage(data) {
    switch (data.type) {
        case "response":
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs[0]) {
                    chrome.tabs.sendMessage(tabs[0].id, {
                        type: "ai_response",
                        data: data
                    });
                }
            });
            break;
        case "pong":
            break;
        case "execution_success":
            chrome.storage.local.set({ lastExecution: { success: true, action: data.action } });
            break;
        case "execution_error":
            chrome.storage.local.set({ lastExecution: { success: false, error: data.message } });
            break;
    }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "send_query") {
        sendMessage({
            type: "query",
            query: message.query,
            context: message.context,
            software: message.software || "general",
            timestamp: Date.now()
        });
        sendResponse({ status: "sent" });
    } else if (message.type === "get_connection_status") {
        sendResponse({ connected: isConnected });
    } else if (message.type === "execute_action") {
        sendMessage({
            type: "execute",
            action: message.action,
            coordinates: message.coordinates,
            text: message.text,
            key: message.key,
            keys: message.keys
        });
        sendResponse({ status: "executing" });
    }
    return true;
});

chrome.storage.local.get(["enabled"], (result) => {
    if (result.enabled !== false) {
        connect();
    }
});

setInterval(() => {
    if (isConnected) {
        sendMessage({ type: "ping" });
    }
}, 30000);
