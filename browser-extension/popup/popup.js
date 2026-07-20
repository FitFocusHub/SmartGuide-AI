/**
 * SmartGuide AI - Popup
 * Copyright (c) 2026 FitFocusHub. All Rights Reserved.
 */
document.addEventListener("DOMContentLoaded", () => {
    const enableToggle = document.getElementById("enable-toggle");
    const statusIndicator = document.getElementById("status-indicator");
    const statusText = document.getElementById("status-text");
    const apiKeyInput = document.getElementById("api-key");
    const backupKeyInput = document.getElementById("backup-key");
    const saveKeyBtn = document.getElementById("save-key");
    const toggleVisibilityBtn = document.getElementById("toggle-visibility");
    const toggleVisibilityBackupBtn = document.getElementById("toggle-visibility-backup");
    const keyStatus = document.getElementById("key-status");
    const activeApi = document.getElementById("active-api");
    const serverStatus = document.getElementById("server-status");
    const serverBadge = document.getElementById("server-badge");
    const startServerBtn = document.getElementById("start-server-btn");
    const serverInstructions = document.getElementById("server-instructions");
    const serverOfflinePanel = document.getElementById("server-offline-panel");
    const serverOnlinePanel = document.getElementById("server-online-panel");
    const serverStatusBox = document.getElementById("server-status-box");
    const serverStatusIcon = document.getElementById("server-status-icon");
    const serverStatusTitle = document.getElementById("server-status-title");
    const serverStatusDesc = document.getElementById("server-status-desc");

    chrome.storage.local.get(["enabled", "apiKey", "backupApiKey", "activeApi", "serverStatus"], (result) => {
        enableToggle.checked = result.enabled !== false;
        if (result.apiKey) apiKeyInput.value = result.apiKey;
        if (result.backupApiKey) backupKeyInput.value = result.backupApiKey;
        updateStatus(result.apiKey, result.backupApiKey, result.activeApi);
        updateServerUI(result.serverStatus);
    });

    chrome.storage.onChanged.addListener((changes) => {
        if (changes.serverStatus) {
            updateServerUI(changes.serverStatus.newValue);
        }
    });

    function updateServerUI(status) {
        const isOnline = status === "connected";
        
        if (isOnline) {
            serverStatusBox.className = "server-status-box connected";
            serverStatusIcon.textContent = "\u2713";
            serverStatusTitle.textContent = "Server Connected";
            serverStatusDesc.textContent = "Automation ready - typing, clicking, apps work!";
            serverOfflinePanel.style.display = "none";
            serverOnlinePanel.style.display = "block";
        } else {
            serverStatusBox.className = "server-status-box disconnected";
            serverStatusIcon.textContent = "X";
            serverStatusTitle.textContent = "Server Disconnected";
            serverStatusDesc.textContent = "Start server for automation";
            serverOfflinePanel.style.display = "block";
            serverOnlinePanel.style.display = "none";
        }
    }

    startServerBtn.addEventListener("click", () => {
        if (serverInstructions.style.display === "none") {
            serverInstructions.style.display = "block";
            startServerBtn.textContent = "Hide Instructions";
        } else {
            serverInstructions.style.display = "none";
            startServerBtn.textContent = "Start Server";
        }
    });

    enableToggle.addEventListener("change", () => {
        chrome.storage.local.set({ enabled: enableToggle.checked });
    });

    saveKeyBtn.addEventListener("click", () => {
        const key = apiKeyInput.value.trim();
        const backupKey = backupKeyInput.value.trim();

        if (!key && !backupKey) {
            alert("Please enter at least one API key");
            return;
        }

        chrome.storage.local.set({
            apiKey: key,
            backupApiKey: backupKey
        }, () => {
            updateStatus(key, backupKey, null);
            saveKeyBtn.textContent = "Saved!";
            setTimeout(() => { saveKeyBtn.textContent = "Save API Keys"; }, 2000);
        });
    });

    toggleVisibilityBtn.addEventListener("click", () => {
        apiKeyInput.type = apiKeyInput.type === "password" ? "text" : "password";
    });

    toggleVisibilityBackupBtn.addEventListener("click", () => {
        backupKeyInput.type = backupKeyInput.type === "password" ? "text" : "password";
    });

    function updateStatus(key, backupKey, active) {
        const hasAny = key || backupKey;
        
        if (!hasAny) {
            statusIndicator.className = "status disconnected";
            statusText.textContent = "No API Key";
            keyStatus.textContent = "Not Set";
            keyStatus.style.color = "#ff4444";
            activeApi.textContent = "None";
            activeApi.style.color = "#888";
            return;
        }

        // API key exists - check if internet works
        fetch("https://api.groq.com/openai/v1/models", {
            method: "HEAD",
            mode: "no-cors"
        }).then(() => {
            // Internet OK
            statusIndicator.className = "status connected";
            statusText.textContent = "Ready";
            keyStatus.textContent = "Set";
            keyStatus.style.color = "#00ff88";
            
            if (active === "groq") {
                activeApi.textContent = "Groq";
                activeApi.style.color = "#00ff88";
            } else if (active === "bazaarlink") {
                activeApi.textContent = "BazaarLink (Fallback)";
                activeApi.style.color = "#ffa500";
            } else {
                activeApi.textContent = key ? "Groq" : (backupKey ? "BazaarLink" : "None");
                activeApi.style.color = "#888";
            }
        }).catch(() => {
            // No internet
            statusIndicator.className = "status disconnected";
            statusText.textContent = "No Internet";
            keyStatus.textContent = "Set (No Net)";
            keyStatus.style.color = "#ffa500";
            activeApi.textContent = "Offline";
            activeApi.style.color = "#ffa500";
        });
    }
});
