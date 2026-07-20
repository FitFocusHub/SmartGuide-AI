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
    const copyCommandBtn = document.getElementById("copy-command");

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
            serverStatus.textContent = "Online";
            serverStatus.style.color = "#00ff88";
            serverBadge.textContent = "Online";
            serverBadge.className = "server-badge online";
            serverOfflinePanel.style.display = "none";
            serverOnlinePanel.style.display = "block";
        } else {
            serverStatus.textContent = "Offline";
            serverStatus.style.color = "#ff4444";
            serverBadge.textContent = "Offline";
            serverBadge.className = "server-badge offline";
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

    copyCommandBtn.addEventListener("click", () => {
        const cmd = document.getElementById("server-command").textContent;
        navigator.clipboard.writeText(cmd).then(() => {
            copyCommandBtn.textContent = "Copied!";
            setTimeout(() => { copyCommandBtn.textContent = "Copy"; }, 2000);
        });
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
        if (hasAny) {
            statusIndicator.className = "status connected";
            statusText.textContent = "Ready";
            keyStatus.textContent = "Set";
            keyStatus.style.color = "#00ff88";
        } else {
            statusIndicator.className = "status disconnected";
            statusText.textContent = "No API Key";
            keyStatus.textContent = "Not Set";
            keyStatus.style.color = "#ff4444";
        }

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
    }
});
