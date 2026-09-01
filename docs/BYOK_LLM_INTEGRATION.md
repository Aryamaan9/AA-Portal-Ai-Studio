# Universal Bring Your Own Key (BYOK) AI Integration Guide

Your **Aryamaan Sanctuary** supports **every major and open-source AI model on earth** using standard, zero-lock-in BYOK (Bring Your Own Key).

---

## 🌟 The Best & Easiest Way: OpenRouter (Recommended)

Instead of managing 10 different accounts, **OpenRouter** gives you 1 unified API key that can call **200+ models**, including:
* **DeepSeek R1 / V3** (`deepseek/deepseek-chat`, `deepseek/deepseek-r1`)
* **Claude 3.5 Sonnet** (`anthropic/claude-3.5-sonnet`)
* **Llama 3.3 70B** (`meta-llama/llama-3.3-70b-instruct`)
* **Qwen 2.5 72B** (`qwen/qwen-2.5-72b-instruct`)
* **Gemini 2.0 Flash** (`google/gemini-2.0-flash-exp:free`)

### Setup:
1. Get a key at [openrouter.ai/keys](https://openrouter.ai/keys).
2. In Dashboard &rarr; **Settings &rarr; AI Models & BYOK**:
   - Provider: **OpenRouter**
   - API Key: Paste your `sk-or-v1-...` key
   - Model ID: Choose `deepseek/deepseek-chat` or any model you prefer.
3. Click **Test Connection** &rarr; **Save Settings**.

---

## 🇨🇳 Direct Chinese AI Providers (Kimi, GLM, DeepSeek)

### 1. Moonshot AI / Kimi
* **Get Key**: [platform.moonshot.cn](https://platform.moonshot.cn/console/api-keys)
* **In Settings**:
  * Provider: **Moonshot AI / Kimi**
  * Model ID: `moonshot-v1-auto` (or `moonshot-v1-8k`, `moonshot-v1-32k`, `moonshot-v1-128k`)

### 2. Zhipu AI / GLM (GLM-4 / GLM-5.2)
* **Get Key**: [open.bigmodel.cn](https://open.bigmodel.cn/usercenter/apikeys)
* **In Settings**:
  * Provider: **Zhipu AI / GLM**
  * Model ID: `glm-4-plus` or `glm-4-flash`

### 3. DeepSeek Official
* **Get Key**: [platform.deepseek.com](https://platform.deepseek.com/api_keys)
* **In Settings**:
  * Provider: **DeepSeek Official**
  * Model ID: `deepseek-chat` (or `deepseek-reasoner` for DeepSeek R1)

---

## ⚡ High-Speed & Enterprise Providers

### 1. NVIDIA NIM (build.nvidia.com)
* **Get Key**: [build.nvidia.com](https://build.nvidia.com)
* **In Settings**:
  * Provider: **NVIDIA NIM**
  * Model ID: `meta/llama-3.1-70b-instruct` or `deepseek-ai/deepseek-r1`

### 2. Groq (Fastest Inference Speed)
* **Get Key**: [console.groq.com/keys](https://console.groq.com/keys)
* **In Settings**:
  * Provider: **Groq**
  * Model ID: `llama-3.3-70b-versatile`

### 3. Google Gemini
* **Get Free Key**: [aistudio.google.com](https://aistudio.google.com/app/apikey)
* **In Settings**:
  * Provider: **Google Gemini**
  * Model ID: `gemini-1.5-flash` or `gemini-2.0-flash-exp`

### 4. OpenAI
* **Get Key**: [platform.openai.com](https://platform.openai.com/api-keys)
* **In Settings**:
  * Provider: **OpenAI**
  * Model ID: `gpt-4o-mini`, `gpt-4o`, `o3-mini`

---

## 🔌 Custom Proxies, Kilocode & Local Ollama

If you run a local model via **Ollama**, a custom server, or a proxy like **Kilocode**:
1. Select **Custom / Proxy / Local (Ollama)**.
2. Base URL: e.g. `http://localhost:11434/v1` or `https://your-kilocode-proxy.com/v1`.
3. Model ID: e.g. `llama3.2`, `mistral`, or your custom proxy model ID.
4. API Key: Enter your token (or leave empty if local Ollama).
5. Click **Test Connection**.

---

## 🔒 Privacy Guarantee
All your API keys are stored **100% locally in your browser's private storage**. They are never transmitted to any third-party analytics or external server.
