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

    chrome.storage.local.get(["enabled", "apiKey", "backupApiKey", "activeApi"], (result) => {
        enableToggle.checked = result.enabled !== false;
        if (result.apiKey) apiKeyInput.value = result.apiKey;
        if (result.backupApiKey) backupKeyInput.value = result.backupApiKey;
        updateStatus(result.apiKey, result.backupApiKey, result.activeApi);
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
