# Universal Bring Your Own Key (BYOK) AI Integration Guide

Your **Aryamaan Sanctuary** supports **every major and open-source AI model on earth** using standard, zero-lock-in BYOK (Bring Your Own Key).

You can store keys for multiple providers simultaneously (e.g. OpenRouter, Kilo Gateway, and Google Gemini). All keys are saved locally in your browser so you can switch between them with a single click.

---

## 🌟 The Top 3 Primary Providers (Reliable & Instant)

### 1. OpenRouter (Recommended: 200+ Models in 1 Key)
* **Website**: [openrouter.ai/keys](https://openrouter.ai/keys)
* **Base URL**: `https://openrouter.ai/api/v1`
* **Latest Recommended Models**:
  * `deepseek/deepseek-chat` (DeepSeek V3 — exceptional reasoning and cost)
  * `anthropic/claude-3.7-sonnet` (Hybrid reasoning & writing)
  * `deepseek/deepseek-r1` (Full reasoning mode)
  * `google/gemini-2.5-flash` (Next-gen speed & multimodal)
  * `openai/gpt-4o` / `openai/gpt-4o-mini`
  * `meta-llama/llama-3.3-70b-instruct`

### 2. Kilo Gateway (Kilocode / 500+ Models)
* **Website**: [kilo.ai](https://kilo.ai)
* **Base URL**: `https://api.kilo.ai/api/gateway`
* **Latest Recommended Models**:
  * `deepseek/deepseek-chat`
  * `anthropic/claude-3.7-sonnet`
  * `deepseek/deepseek-r1`
  * `google/gemini-2.5-flash`
  * `openai/gpt-4o`
  * `openai/gpt-4o-mini`
  * `meta-llama/llama-3.3-70b-instruct`

### 3. Google Gemini (Official Free / Paid Tier API)
* **Website**: [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
* **Base URL**: `https://generativelanguage.googleapis.com/v1beta`
* **Latest Recommended Models**:
  * `gemini-2.0-flash` (Flagship production model — sub-second multimodal inference, 1M context)
  * `gemini-1.5-flash` (Stable standard for high-throughput reflections)
  * `gemini-2.0-flash-lite` (Ultra-fast and cost efficient)
  * `gemini-1.5-pro` (Deep reasoning and analysis)

---

## 🔑 Multi-Key Persistence & Instant Switching

You no longer need to re-enter your keys when trying different providers:
1. Open **Settings &rarr; AI Models & BYOK**.
2. Click **OpenRouter**, enter your key and select a model.
3. Click **Kilo Gateway**, enter your Kilo key and select a model.
4. Click **Google Gemini**, enter your Gemini key and select a model.
5. Notice the **`● Key Saved`** green status indicator on each configured card.
6. Click **Test [Provider]** on any provider to verify connectivity.
7. Whichever provider card is currently selected as **Active** will be used by the Sanctuary for Companion reflections, Diary distillations, and Screenshot quote extractions.
8. Click **Save Settings**. All your keys remain saved in local storage.

---

## ⚡ Additional Supported Providers

* **DeepSeek Official**: `deepseek-chat`, `deepseek-reasoner` ([platform.deepseek.com](https://platform.deepseek.com/api_keys))
* **Groq**: `llama-3.3-70b-versatile`, `deepseek-r1-distill-llama-70b` ([console.groq.com/keys](https://console.groq.com/keys))
* **OpenAI**: `gpt-4o`, `gpt-4o-mini`, `o3-mini`, `o1` ([platform.openai.com/api-keys](https://platform.openai.com/api-keys))
* **Moonshot AI / Kimi**: `moonshot-v1-auto` ([platform.moonshot.cn](https://platform.moonshot.cn/console/api-keys))
* **Zhipu AI / GLM**: `glm-4-plus`, `glm-4-flash` ([open.bigmodel.cn](https://open.bigmodel.cn/usercenter/apikeys))
* **NVIDIA NIM**: `meta/llama-3.1-70b-instruct`, `deepseek-ai/deepseek-r1` ([build.nvidia.com](https://build.nvidia.com))
* **Local Ollama / Custom Proxy**: `http://localhost:11434/v1` or any custom OpenAI-compatible server.

---

## 🔒 Privacy & Local Security Guarantee
All your API keys are stored **100% locally in your browser's private storage**. They are never transmitted to any third-party telemetry, analytics, or external server.
