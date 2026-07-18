document.addEventListener("DOMContentLoaded", () => {
    const enableToggle = document.getElementById("enable-toggle");
    const statusIndicator = document.getElementById("status-indicator");
    const statusText = document.getElementById("status-text");
    const apiKeyInput = document.getElementById("api-key");
    const saveKeyBtn = document.getElementById("save-key");
    const toggleVisibilityBtn = document.getElementById("toggle-visibility");
    const keyStatus = document.getElementById("key-status");

    chrome.storage.local.get(["enabled", "apiKey"], (result) => {
        enableToggle.checked = result.enabled !== false;
        if (result.apiKey) {
            apiKeyInput.value = result.apiKey;
            updateKeyStatus(true);
        }
    });

    enableToggle.addEventListener("change", () => {
        const enabled = enableToggle.checked;
        chrome.storage.local.set({ enabled });
    });

    saveKeyBtn.addEventListener("click", () => {
        const key = apiKeyInput.value.trim();
        if (!key) {
            alert("Please enter a valid API key");
            return;
        }
        chrome.storage.local.set({ apiKey: key }, () => {
            updateKeyStatus(true);
            saveKeyBtn.textContent = "Saved!";
            setTimeout(() => { saveKeyBtn.textContent = "Save API Key"; }, 2000);
        });
    });

    toggleVisibilityBtn.addEventListener("click", () => {
        const type = apiKeyInput.type === "password" ? "text" : "password";
        apiKeyInput.type = type;
    });

    function updateKeyStatus(hasKey) {
        if (hasKey) {
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
    }
});
