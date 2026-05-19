const apiKeyInput = document.getElementById("apiKey");
const targetLangSelect = document.getElementById("targetLanguage");
const saveBtn = document.getElementById("saveBtn");
const toggleBtn = document.getElementById("toggleKey");
const toast = document.getElementById("toast");

// Load existing settings
chrome.storage.local.get(["apiKey", "targetLanguage"], (data) => {
  if (data.apiKey) apiKeyInput.value = data.apiKey;
  if (data.targetLanguage) targetLangSelect.value = data.targetLanguage;
});

// Toggle API key visibility
toggleBtn.addEventListener("click", () => {
  if (apiKeyInput.type === "password") {
    apiKeyInput.type = "text";
    toggleBtn.textContent = "Hide";
  } else {
    apiKeyInput.type = "password";
    toggleBtn.textContent = "Show";
  }
});

// Save settings
saveBtn.addEventListener("click", () => {
  const apiKey = apiKeyInput.value.trim();
  const targetLanguage = targetLangSelect.value;

  chrome.storage.local.set({ apiKey, targetLanguage }, () => {
    showToast();
  });
});

function showToast() {
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2500);
}
