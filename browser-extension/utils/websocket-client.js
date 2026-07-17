const WS_URL = "ws://127.0.0.1:8765";
const RECONNECT_BASE_DELAY = 1000;
const MAX_RECONNECT_DELAY = 30000;

class WebSocketClient {
    constructor() {
        this.ws = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.messageQueue = [];
        this.listeners = {};
        this.reconnectTimer = null;
    }

    connect() {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) return;

        try {
            this.ws = new WebSocket(WS_URL);

            this.ws.onopen = () => {
                console.log("[WS] Connected");
                this.isConnected = true;
                this.reconnectAttempts = 0;
                this.emit("connected");
                this.flushQueue();
            };

            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.emit("message", data);
                } catch (e) {
                    console.error("[WS] Parse error:", e);
                }
            };

            this.ws.onclose = () => {
                console.log("[WS] Disconnected");
                this.isConnected = false;
                this.emit("disconnected");
                this.scheduleReconnect();
            };

            this.ws.onerror = (error) => {
                console.error("[WS] Error:", error);
            };
        } catch (e) {
            console.error("[WS] Connection failed:", e);
            this.scheduleReconnect();
        }
    }

    disconnect() {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
        }
        if (this.ws) {
            this.ws.close();
        }
    }

    send(message) {
        if (this.isConnected && this.ws) {
            this.ws.send(JSON.stringify(message));
        } else {
            this.messageQueue.push(message);
            this.connect();
        }
    }

    flushQueue() {
        while (this.messageQueue.length > 0) {
            const msg = this.messageQueue.shift();
            this.send(msg);
        }
    }

    scheduleReconnect() {
        const delay = Math.min(
            RECONNECT_BASE_DELAY * Math.pow(2, this.reconnectAttempts),
            MAX_RECONNECT_DELAY
        );
        this.reconnectAttempts++;
        this.reconnectTimer = setTimeout(() => this.connect(), delay);
    }

    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    off(event, callback) {
        if (this.listeners[event]) {
            this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
        }
    }

    emit(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(cb => cb(data));
        }
    }
}

window.smartGuideWS = new WebSocketClient();
