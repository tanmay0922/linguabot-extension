// Handle context menu creation on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "linguabot-translate",
    title: "Translate with LinguaBot",
    contexts: ["selection"],
  });
});

// Handle context menu click
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "linguabot-translate") {
    const selectedText = info.selectionText;
    const { targetLanguage, apiKey } = await chrome.storage.local.get([
      "targetLanguage",
      "apiKey",
    ]);

    if (!apiKey) {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => alert("LinguaBot: Please set your API key in the extension settings."),
      });
      return;
    }

    const translation = await callGemini(
      apiKey,
      `Translate the following text to ${targetLanguage || "English"} and only return the translated text, nothing else:\n\n${selectedText}`,
      [],
      `You are a translator. Translate text accurately and naturally to ${targetLanguage || "English"}. Return only the translated text.`
    );

    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (original, translated, lang) => {
        window.postMessage(
          { type: "LINGUABOT_TRANSLATION", original, translated, lang },
          "*"
        );
      },
      args: [selectedText, translation, targetLanguage || "English"],
    });
  }
});

// Handle messages from popup and content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "CHAT") {
    handleChat(request).then(sendResponse);
    return true;
  }

  if (request.type === "QUICK_TRANSLATE") {
    handleQuickTranslate(request).then(sendResponse);
    return true;
  }
});

async function handleChat({ message, history, targetLanguage, apiKey }) {
  const systemPrompt = `You are LinguaBot, a multilingual assistant and language converter.

Rules:
1. Automatically detect the language the user writes in.
2. ALWAYS respond in ${targetLanguage}, no matter what language the user uses.
3. Start your response by briefly mentioning the detected language (e.g. "Detected: Portuguese").
4. Then give your helpful, natural response in ${targetLanguage}.
5. If the user asks for a specific translation, provide it clearly.
6. Be friendly and conversational.`;

  const reply = await callGemini(apiKey, message, history, systemPrompt);
  return { reply };
}

async function handleQuickTranslate({ text, targetLanguage, apiKey }) {
  const systemPrompt = `You are a translator. Translate the given text to ${targetLanguage}. Return only the translated text, no explanations.`;
  const reply = await callGemini(apiKey, text, [], systemPrompt);
  return { reply };
}

async function callGemini(apiKey, message, history, systemPrompt) {
  try {
    const messages = [
      { role: "system", content: systemPrompt },
      ...(history || []),
      { role: "user", content: message },
    ];

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages,
          max_tokens: 1024,
          temperature: 0.7,
        }),
      }
    );

    if (!response.ok) {
      const err = await response.json();
      return `Error: ${err.error?.message || "API call failed"}`;
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "No response received.";
  } catch (err) {
    return `Error: ${err.message}`;
  }
}
