# 🌐 LinguaBot - Language Converter Extension

A free Chrome browser extension that lets you chat in any language and get responses in your chosen language. Powered by Groq AI (free tier).

---

## Features

- **Auto Language Detection** - Type in any language, LinguaBot detects it automatically
- **25+ Languages** - English, Hindi, Portuguese, Spanish, French, Japanese, Arabic and more
- **Voice Input** - Click the mic button and speak instead of typing
- **Floating Translate Button** - Highlight any text on any website and translate it instantly
- **Right-Click Translate** - Select text → right-click → "Translate with LinguaBot"
- **Translate Page** - Translate the content of any webpage with one click
- **Translation History** - All your past translations saved and accessible anytime
- **Copy Button** - One-click copy on every translation
- **Dark / Light Mode** - Switch themes to match your preference
- **100% Free** - Uses Groq API free tier (14,400 requests/day)

---

## Screenshots

> Popup Chat | History Tab | Floating Translate Button

---

## Installation

### Step 1 - Download the Extension

```bash
git clone https://github.com/tanmay0922/linguabot-extension.git
```

Or click **Code → Download ZIP** and extract it.

### Step 2 - Load in Chrome

1. Open Chrome and go to `chrome://extensions`
2. Enable **Developer mode** (top right toggle)
3. Click **Load unpacked**
4. Select the `linguabot-extension` folder
5. LinguaBot appears in your toolbar

### Step 3 - Get Your Free API Key

1. Go to [console.groq.com](https://console.groq.com)
2. Sign up with your Google account (free)
3. Click **API Keys** → **Create API Key**
4. Copy the key (starts with `gsk_...`)

### Step 4 - Add API Key to Extension

1. Click the LinguaBot icon in Chrome toolbar
2. Click **⚙️ Settings**
3. Paste your Groq API key
4. Select your preferred response language
5. Click **Save Settings**

You're ready to go!

---

## How to Use

### Chat
1. Click the LinguaBot icon in your toolbar
2. Type in any language in the chat box
3. Select your response language from the dropdown
4. Press **Enter** to send

### Voice Input
1. Click the **🎤 mic button**
2. Speak in any language
3. Your speech is converted to text automatically
4. Press **Enter** to translate

### Translate Selected Text
1. Go to any website
2. **Highlight any text** with your mouse
3. Click the **🌐 Translate** button that appears
4. See the translation instantly

### Right-Click Translate
1. Highlight any text on any website
2. Right-click → **"Translate with LinguaBot"**
3. Translation appears near the selected text

### Translate Entire Page
1. Go to any webpage
2. Click the LinguaBot icon
3. Click the **📄 page button** in the header
4. The page content is translated and shown in chat

---

## Supported Languages

| | | | |
|---|---|---|---|
| English | Portuguese | Spanish | French |
| German | Italian | Hindi | Arabic |
| Chinese | Japanese | Korean | Russian |
| Dutch | Turkish | Polish | Swedish |
| Bengali | Urdu | Indonesian | Thai |
| Vietnamese | Greek | Hebrew | Swahili |

---

## Tech Stack

| Part | Technology |
|------|-----------|
| Extension | Chrome Manifest V3 |
| Frontend | HTML, CSS, Vanilla JS |
| AI Model | Llama 3.3 70B via Groq API |
| Storage | Chrome Local Storage |
| Voice | Web Speech API |

---

## API Usage & Cost

This extension uses the **Groq API free tier**:

| Metric | Free Limit |
|--------|-----------|
| Requests per day | 14,400 |
| Tokens per minute | 500,000 |
| Cost | $0 |

Get your free API key at [console.groq.com](https://console.groq.com)

---

## Privacy

- Your API key is stored **locally in your browser only**
- No data is sent to any third-party server except the Groq API for translation
- Translation history is stored **locally** in Chrome storage only
- No accounts, no tracking, no data collection

---

## Contributing

Pull requests are welcome! Feel free to open issues for bugs or feature requests.

1. Fork the repo
2. Create your branch (`git checkout -b feature/new-feature`)
3. Commit your changes
4. Push and open a Pull Request

---

## License

MIT License - free to use, modify and distribute.

---

Made with by Tanmay Upadhyay
