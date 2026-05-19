// Handle GET_PAGE_TEXT message from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "GET_PAGE_TEXT") {
    const text = document.body.innerText.replace(/\s+/g, " ").trim();
    sendResponse({ text });
  }
});

let floatBtn = null;
let tooltip = null;
let selectedText = "";

// Listen for translation result from background (via context menu)
window.addEventListener("message", (event) => {
  if (event.data?.type === "LINGUABOT_TRANSLATION") {
    showTooltip(event.data.translated, event.data.lang, lastRect);
  }
});

let lastRect = null;

document.addEventListener("mouseup", (e) => {
  setTimeout(() => {
    const selection = window.getSelection();
    const text = selection?.toString().trim();

    if (text && text.length > 1) {
      selectedText = text;
      const range = selection.getRangeAt(0);
      lastRect = range.getBoundingClientRect();
      showFloatBtn(lastRect);
    } else {
      hideAll();
    }
  }, 10);
});

document.addEventListener("mousedown", (e) => {
  if (
    e.target?.id !== "linguabot-float-btn" &&
    !e.target?.closest("#linguabot-tooltip")
  ) {
    hideAll();
  }
});

function showFloatBtn(rect) {
  removeElement("linguabot-float-btn");

  floatBtn = document.createElement("button");
  floatBtn.id = "linguabot-float-btn";
  floatBtn.innerHTML = `🌐 Translate`;

  const top = window.scrollY + rect.bottom + 8;
  const left = window.scrollX + rect.left;

  floatBtn.style.top = `${top}px`;
  floatBtn.style.left = `${left}px`;

  floatBtn.addEventListener("click", async (e) => {
    e.stopPropagation();
    removeElement("linguabot-float-btn");
    await translateSelected(rect);
  });

  document.body.appendChild(floatBtn);
}

async function translateSelected(rect) {
  showLoadingTooltip(rect);

  const { targetLanguage, apiKey } = await chrome.storage.local.get([
    "targetLanguage",
    "apiKey",
  ]);

  if (!apiKey) {
    showTooltip("Please set your API key in LinguaBot settings.", "Error", rect);
    return;
  }

  const response = await chrome.runtime.sendMessage({
    type: "QUICK_TRANSLATE",
    text: selectedText,
    targetLanguage: targetLanguage || "English",
    apiKey,
  });

  showTooltip(response.reply, targetLanguage || "English", rect);
}

function showLoadingTooltip(rect) {
  removeElement("linguabot-tooltip");

  tooltip = document.createElement("div");
  tooltip.id = "linguabot-tooltip";

  const top = window.scrollY + rect.bottom + 8;
  const left = window.scrollX + rect.left;

  tooltip.style.top = `${top}px`;
  tooltip.style.left = `${left}px`;

  tooltip.innerHTML = `
    <div class="lb-header">
      <span>LinguaBot</span>
    </div>
    <div class="lb-loading">
      <div class="lb-spinner"></div>
      Translating...
    </div>
  `;

  document.body.appendChild(tooltip);
}

function showTooltip(text, lang, rect) {
  removeElement("linguabot-tooltip");

  tooltip = document.createElement("div");
  tooltip.id = "linguabot-tooltip";

  const top = window.scrollY + (rect?.bottom || 100) + 8;
  const left = window.scrollX + (rect?.left || 100);

  tooltip.style.top = `${top}px`;
  tooltip.style.left = `${left}px`;

  tooltip.innerHTML = `
    <div class="lb-header">
      <span>LinguaBot → ${lang}</span>
      <span class="lb-close" id="lb-close-btn">✕</span>
    </div>
    <div class="lb-text">${escapeHtml(text)}</div>
  `;

  document.body.appendChild(tooltip);

  document.getElementById("lb-close-btn")?.addEventListener("click", hideAll);
}

function hideAll() {
  removeElement("linguabot-float-btn");
  removeElement("linguabot-tooltip");
}

function removeElement(id) {
  document.getElementById(id)?.remove();
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/\n/g, "<br>");
}
