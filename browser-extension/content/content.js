console.log("[SmartGuide] Content script loaded on:", window.location.href);

function extractPageContext() {
    const context = {
        url: window.location.href,
        title: document.title,
        interactiveElements: [],
        forms: [],
        buttons: [],
        inputs: []
    };

    document.querySelectorAll("button, [role='button'], a.button").forEach((el, i) => {
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
            context.buttons.push({
                index: i,
                text: el.textContent.trim().substring(0, 50),
                x: Math.round(rect.x + rect.width / 2),
                y: Math.round(rect.y + rect.height / 2),
                width: Math.round(rect.width),
                height: Math.round(rect.height),
                tag: el.tagName.toLowerCase()
            });
        }
    });

    document.querySelectorAll("input, textarea, select").forEach((el, i) => {
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
            context.inputs.push({
                index: i,
                type: el.type || el.tagName.toLowerCase(),
                name: el.name || el.id || "",
                placeholder: el.placeholder || "",
                x: Math.round(rect.x + rect.width / 2),
                y: Math.round(rect.y + rect.height / 2),
                width: Math.round(rect.width),
                height: Math.round(rect.height)
            });
        }
    });

    document.querySelectorAll("form").forEach((form, i) => {
        const formData = {
            index: i,
            action: form.action,
            method: form.method,
            fields: []
        };
        form.querySelectorAll("input, textarea, select").forEach(field => {
            formData.fields.push({
                name: field.name,
                type: field.type,
                id: field.id
            });
        });
        context.forms.push(formData);
    });

    return context;
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "get_page_context") {
        sendResponse(extractPageContext());
    } else if (message.type === "ai_response") {
        displayAIResponse(message.data);
    } else if (message.type === "highlight_elements") {
        highlightElements(message.elements);
    }
    return true;
});

function displayAIResponse(data) {
    if (window.smartGuideChat) {
        window.smartGuideChat.showResponse(data);
    }
}

function highlightElements(elements) {
    if (window.smartGuideHighlighter) {
        elements.forEach(el => {
            window.smartGuideHighlighter.highlight(
                el.x, el.y, el.width, el.height,
                el.color, el.label
            );
        });
    }
}

chrome.runtime.sendMessage({ type: "get_connection_status" }, (response) => {
    if (response && response.connected) {
        console.log("[SmartGuide] Desktop app connected");
    }
});
