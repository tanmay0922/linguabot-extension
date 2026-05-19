const LANGUAGES = [
  "English","Portuguese","Spanish","French","German","Italian",
  "Hindi","Arabic","Chinese (Simplified)","Japanese","Korean",
  "Russian","Dutch","Turkish","Polish","Swedish","Bengali",
  "Urdu","Indonesian","Thai","Vietnamese","Greek","Hebrew","Swahili",
];

let conversationHistory = [];
let isLoading = false;
let isRecording = false;
let recognition = null;

const messagesEl  = document.getElementById("messages");
const inputEl     = document.getElementById("userInput");
const sendBtn     = document.getElementById("sendBtn");
const voiceBtn    = document.getElementById("voiceBtn");
const langSelect  = document.getElementById("langSelect");
const noKeyBanner = document.getElementById("noKeyBanner");
const themeBtn    = document.getElementById("themeBtn");

// ── Populate language dropdown ──
LANGUAGES.forEach((lang) => {
  const opt = document.createElement("option");
  opt.value = lang;
  opt.textContent = lang;
  langSelect.appendChild(opt);
});

// ── Load saved settings ──
chrome.storage.local.get(["targetLanguage", "apiKey", "theme"], (data) => {
  langSelect.value = data.targetLanguage || "English";
  applyTheme(data.theme || "dark");
  if (!data.apiKey) noKeyBanner.classList.add("visible");
});

// ── Save language on change ──
langSelect.addEventListener("change", () => {
  chrome.storage.local.set({ targetLanguage: langSelect.value });
});

// ── Theme toggle ──
function applyTheme(theme) {
  document.body.classList.remove("dark", "light");
  document.body.classList.add(theme);
  themeBtn.textContent = theme === "dark" ? "☀️" : "🌙";
}

themeBtn.addEventListener("click", () => {
  const isDark = document.body.classList.contains("dark");
  const newTheme = isDark ? "light" : "dark";
  applyTheme(newTheme);
  chrome.storage.local.set({ theme: newTheme });
});

// ── Settings & banner ──
document.getElementById("settingsBtn").addEventListener("click", () => {
  chrome.runtime.openOptionsPage();
});
document.getElementById("goSettings").addEventListener("click", () => {
  chrome.runtime.openOptionsPage();
});

// ── Tabs ──
document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach((c) => c.classList.remove("active"));
    tab.classList.add("active");
    document.getElementById(tab.dataset.tab + "Tab").classList.add("active");
    if (tab.dataset.tab === "history") loadHistory();
  });
});

// ── Clear chat ──
document.getElementById("clearBtn").addEventListener("click", () => {
  conversationHistory = [];
  messagesEl.innerHTML = `
    <div class="welcome">
      <div class="welcome-icon">🌍</div>
      <p>Type in <strong>any language</strong>.</p>
      <p>I'll reply in your chosen language.</p>
    </div>`;
});

// ── Clear history ──
document.getElementById("clearHistoryBtn").addEventListener("click", () => {
  chrome.storage.local.set({ translationHistory: [] }, loadHistory);
});

// ── Translate Page button ──
document.getElementById("translatePageBtn").addEventListener("click", async () => {
  const { apiKey, targetLanguage } = await chrome.storage.local.get(["apiKey", "targetLanguage"]);
  if (!apiKey) { noKeyBanner.classList.add("visible"); return; }

  // Switch to chat tab
  document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
  document.querySelectorAll(".tab-content").forEach((c) => c.classList.remove("active"));
  document.querySelector('[data-tab="chat"]').classList.add("active");
  document.getElementById("chatTab").classList.add("active");

  const welcome = messagesEl.querySelector(".welcome");
  if (welcome) welcome.remove();

  appendMessage("user", "📄 Translate the content of this page");
  const loadingId = "loading-" + Date.now();
  appendMessage("bot", "Reading page content...", loadingId, true);

  // Get active tab text via content script
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.tabs.sendMessage(tab.id, { type: "GET_PAGE_TEXT" }, async (response) => {
    const pageText = response?.text?.slice(0, 3000) || "Could not read page content.";

    const result = await chrome.runtime.sendMessage({
      type: "CHAT",
      message: `Translate the following webpage content to ${targetLanguage || "English"}. Keep it readable and well-structured:\n\n${pageText}`,
      history: [],
      targetLanguage: targetLanguage || "English",
      apiKey,
    });

    document.getElementById(loadingId)?.remove();
    const reply = result?.reply || "Could not translate page.";
    appendMessage("bot", reply);
    saveToHistory("Page translation", reply, targetLanguage || "English");
  });
});

// ── Send message ──
inputEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
});
sendBtn.addEventListener("click", sendMessage);

async function sendMessage() {
  const text = inputEl.value.trim();
  if (!text || isLoading) return;

  const { apiKey, targetLanguage } = await chrome.storage.local.get(["apiKey", "targetLanguage"]);
  if (!apiKey) { noKeyBanner.classList.add("visible"); return; }

  const welcome = messagesEl.querySelector(".welcome");
  if (welcome) welcome.remove();

  appendMessage("user", text);
  inputEl.value = "";
  autoResize();

  const loadingId = "loading-" + Date.now();
  appendMessage("bot", "Translating...", loadingId, true);

  isLoading = true;
  sendBtn.disabled = true;

  const response = await chrome.runtime.sendMessage({
    type: "CHAT",
    message: text,
    history: conversationHistory,
    targetLanguage: targetLanguage || "English",
    apiKey,
  });

  document.getElementById(loadingId)?.remove();
  isLoading = false;
  sendBtn.disabled = false;

  const reply = response?.reply || "Something went wrong. Please try again.";
  appendMessage("bot", reply);

  conversationHistory.push({ role: "user", content: text });
  conversationHistory.push({ role: "assistant", content: reply });
  if (conversationHistory.length > 20) conversationHistory = conversationHistory.slice(-20);

  saveToHistory(text, reply, targetLanguage || "English");
}

// ── Append message bubble ──
function appendMessage(role, text, id = null, loading = false) {
  const wrapper = document.createElement("div");
  wrapper.className = `message ${role}`;
  if (id) wrapper.id = id;

  const bubble = document.createElement("div");
  bubble.className = `bubble${loading ? " loading" : ""}`;
  bubble.innerHTML = escapeHtml(text);

  wrapper.appendChild(bubble);

  if (role === "bot" && !loading) {
    const footer = document.createElement("div");
    footer.className = "bubble-footer";

    const time = document.createElement("span");
    time.className = "timestamp";
    time.textContent = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const copyBtn = document.createElement("button");
    copyBtn.className = "copy-btn";
    copyBtn.title = "Copy";
    copyBtn.textContent = "📋 Copy";
    copyBtn.addEventListener("click", () => {
      navigator.clipboard.writeText(text).then(() => {
        copyBtn.textContent = "✅ Copied!";
        setTimeout(() => (copyBtn.textContent = "📋 Copy"), 2000);
      });
    });

    footer.appendChild(time);
    footer.appendChild(copyBtn);
    wrapper.appendChild(footer);
  } else if (role === "user") {
    const time = document.createElement("div");
    time.className = "timestamp";
    time.textContent = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    wrapper.appendChild(time);
  }

  messagesEl.appendChild(wrapper);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

// ── Voice input ──
voiceBtn.addEventListener("click", () => {
  if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
    alert("Voice input not supported in this browser.");
    return;
  }

  if (isRecording) {
    recognition?.stop();
    return;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = "";

  recognition.onstart = () => {
    isRecording = true;
    voiceBtn.classList.add("recording");
    voiceBtn.title = "Recording... click to stop";
  };

  recognition.onresult = (e) => {
    const transcript = e.results[0][0].transcript;
    inputEl.value = transcript;
    autoResize();
  };

  recognition.onerror = (e) => {
    console.error("Speech error:", e.error);
    if (e.error === "not-allowed") alert("Microphone access denied. Please allow microphone access.");
  };

  recognition.onend = () => {
    isRecording = false;
    voiceBtn.classList.remove("recording");
    voiceBtn.title = "Voice input";
  };

  recognition.start();
});

// ── Translation history ──
function saveToHistory(input, output, lang) {
  chrome.storage.local.get(["translationHistory"], (data) => {
    const history = data.translationHistory || [];
    history.unshift({
      id: Date.now(),
      input: input.slice(0, 100),
      output: output.slice(0, 300),
      lang,
      time: new Date().toLocaleString(),
    });
    // Keep last 50 items
    const trimmed = history.slice(0, 50);
    chrome.storage.local.set({ translationHistory: trimmed });
  });
}

function loadHistory() {
  const listEl = document.getElementById("historyList");
  chrome.storage.local.get(["translationHistory"], (data) => {
    const history = data.translationHistory || [];
    if (history.length === 0) {
      listEl.innerHTML = `<div class="empty-history">No history yet.<br/>Start chatting!</div>`;
      return;
    }
    listEl.innerHTML = history.map((item) => `
      <div class="history-item">
        <div class="history-meta">${item.time} · → ${item.lang}</div>
        <div class="history-input">💬 ${escapeHtml(item.input)}</div>
        <div class="history-output">${escapeHtml(item.output)}</div>
      </div>
    `).join("");
  });
}

// ── Helpers ──
function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/\n/g, "<br>");
}

inputEl.addEventListener("input", autoResize);
function autoResize() {
  inputEl.style.height = "auto";
  inputEl.style.height = Math.min(inputEl.scrollHeight, 90) + "px";
}
