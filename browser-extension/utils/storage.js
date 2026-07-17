const SmartGuideStorage = {
    async get(keys) {
        return new Promise((resolve) => {
            chrome.storage.local.get(keys, resolve);
        });
    },

    async set(data) {
        return new Promise((resolve) => {
            chrome.storage.local.set(data, resolve);
        });
    },

    async remove(keys) {
        return new Promise((resolve) => {
            chrome.storage.local.remove(keys, resolve);
        });
    },

    async isEnabled() {
        const result = await this.get(["enabled"]);
        return result.enabled !== false;
    },

    async setEnabled(enabled) {
        await this.set({ enabled });
    },

    async getConnectionStatus() {
        const result = await this.get(["connectionStatus"]);
        return result.connectionStatus || "disconnected";
    },

    async setConnectionStatus(status) {
        await this.set({ connectionStatus: status });
    },

    async getSettings() {
        const result = await this.get(["settings"]);
        return result.settings || {
            highlightColor: "#00FF00",
            highlightDuration: 5000,
            autoExecute: false,
            theme: "dark"
        };
    },

    async updateSettings(newSettings) {
        const current = await this.getSettings();
        await this.set({ settings: { ...current, ...newSettings } });
    },

    async cacheResponse(query, response) {
        const result = await this.get(["responseCache"]);
        const cache = result.responseCache || {};
        cache[query] = {
            response,
            timestamp: Date.now()
        };

        const keys = Object.keys(cache);
        if (keys.length > 50) {
            const oldest = keys.sort((a, b) => cache[a].timestamp - cache[b].timestamp)[0];
            delete cache[oldest];
        }

        await this.set({ responseCache: cache });
    },

    async getCachedResponse(query) {
        const result = await this.get(["responseCache"]);
        const cache = result.responseCache || {};
        const cached = cache[query];

        if (cached && Date.now() - cached.timestamp < 3600000) {
            return cached.response;
        }
        return null;
    }
};

window.smartGuideStorage = SmartGuideStorage;
