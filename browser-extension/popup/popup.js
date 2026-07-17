document.addEventListener("DOMContentLoaded", () => {
    const enableToggle = document.getElementById("enable-toggle");
    const statusIndicator = document.getElementById("status-indicator");
    const statusText = document.getElementById("status-text");
    const serverStatus = document.getElementById("server-status");
    const connectBtn = document.getElementById("connect-btn");

    chrome.storage.local.get(["enabled", "connectionStatus"], (result) => {
        enableToggle.checked = result.enabled !== false;
        updateStatus(result.connectionStatus || "disconnected");
    });

    enableToggle.addEventListener("change", () => {
        const enabled = enableToggle.checked;
        chrome.storage.local.set({ enabled });

        if (enabled) {
            chrome.runtime.sendMessage({ type: "connect" });
        } else {
            chrome.runtime.sendMessage({ type: "disconnect" });
        }
    });

    connectBtn.addEventListener("click", () => {
        chrome.runtime.sendMessage({ type: "connect" }, (response) => {
            if (response && response.status === "connected") {
                updateStatus("connected");
            }
        });
    });

    function updateStatus(status) {
        statusIndicator.className = "status " + status;
        statusText.textContent = status === "connected" ? "Connected" : "Disconnected";
        serverStatus.textContent = status === "connected" ? "Running" : "Not Connected";
        connectBtn.textContent = status === "connected" ? "Disconnect" : "Connect";
    }

    setInterval(() => {
        chrome.runtime.sendMessage({ type: "get_connection_status" }, (response) => {
            if (response) {
                updateStatus(response.connected ? "connected" : "disconnected");
            }
        });
    }, 2000);
});
