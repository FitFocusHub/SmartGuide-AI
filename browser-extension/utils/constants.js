const CONSTANTS = {
    WS_URL: "ws://127.0.0.1:8765",
    SERVER_PORT: 8765,
    RECONNECT_DELAY: 3000,
    MAX_RECONNECT_ATTEMPTS: 10,
    HEARTBEAT_INTERVAL: 30000,
    HIGHLIGHT_DURATION: 5000,
    CACHE_TTL: 3600000,
    MAX_CACHE_SIZE: 50,
    DEFAULT_HIGHLIGHT_COLOR: "#00FF00",
    CHAT_WIDTH: 380,
    CHAT_HEIGHT: 520,
    BUBBLE_SIZE: 56,
    ANIMATION_DURATION: 300,

    KEYBOARD_SHORTCUTS: {
        TOGGLE_CHAT: {
            key: "s",
            ctrlKey: true,
            shiftKey: true
        }
    },

    MESSAGE_TYPES: {
        QUERY: "query",
        RESPONSE: "response",
        EXECUTE: "execute",
        HIGHLIGHT: "highlight",
        CLEAR_HIGHLIGHTS: "clear_highlights",
        PING: "ping",
        PONG: "pong",
        ERROR: "error"
    },

    ACTIONS: {
        CLICK: "click",
        DOUBLE_CLICK: "double_click",
        RIGHT_CLICK: "right_click",
        TYPE: "type",
        PRESS: "press",
        HOTKEY: "hotkey",
        SCROLL: "scroll"
    },

    SOFTWARE_DETECTORS: {
        excel: ["sheets.google", "excel", "onlinesheet", "spreadsheet"],
        photoshop: ["photopea", "photoshop", "pixlr"],
        after_effects: ["aftereffects", "ae"],
        vscode: ["vscode", "github.dev"],
        browser: ["chrome", "firefox", "edge"]
    }
};

window.smartGuideConstants = CONSTANTS;
