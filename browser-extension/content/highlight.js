console.log("[SmartGuide] Highlight module loaded");

window.smartGuideHighlighter = {
    highlights: [],

    highlight(x, y, w, h, color = "#00FF00", label = "") {
        const overlay = document.createElement("div");
        overlay.className = "smartguide-highlight";
        overlay.style.cssText = `
            position: fixed;
            left: ${x - w / 2}px;
            top: ${y - h / 2}px;
            width: ${w}px;
            height: ${h}px;
            border: 3px solid ${color};
            background: ${color}22;
            border-radius: 5px;
            pointer-events: none;
            z-index: 999999;
            animation: smartguide-pulse 1.5s ease-in-out infinite;
            box-shadow: 0 0 10px ${color}88;
        `;

        if (label) {
            const tooltip = document.createElement("div");
            tooltip.className = "smartguide-tooltip";
            tooltip.textContent = label;
            tooltip.style.cssText = `
                position: absolute;
                top: -30px;
                left: 0;
                background: #1a1a2e;
                color: white;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
                white-space: nowrap;
                border: 1px solid ${color};
            `;
            overlay.appendChild(tooltip);
        }

        document.body.appendChild(overlay);
        this.highlights.push(overlay);

        setTimeout(() => {
            this.remove(overlay);
        }, 5000);

        return overlay;
    },

    remove(overlay) {
        if (overlay && overlay.parentNode) {
            overlay.style.animation = "smartguide-fadeout 0.3s ease-out";
            setTimeout(() => {
                overlay.remove();
            }, 300);
        }
        this.highlights = this.highlights.filter(h => h !== overlay);
    },

    clearAll() {
        this.highlights.forEach(overlay => {
            if (overlay.parentNode) {
                overlay.remove();
            }
        });
        this.highlights = [];
    }
};

const style = document.createElement("style");
style.textContent = `
    @keyframes smartguide-pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.6; }
    }
    @keyframes smartguide-fadeout {
        from { opacity: 1; }
        to { opacity: 0; }
    }
`;
document.head.appendChild(style);
