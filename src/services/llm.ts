import { AIProviderConfig, LLMProviderType } from '../types';

export interface ProviderPreset {
  id: LLMProviderType;
  name: string;
  defaultBaseUrl: string;
  defaultModel: string;
  modelSuggestions: string[];
  placeholderKey: string;
  docsUrl: string;
}

export const PROVIDER_PRESETS: Record<LLMProviderType, ProviderPreset> = {
  openrouter: {
    id: 'openrouter',
    name: 'OpenRouter (200+ Models in 1 key)',
    defaultBaseUrl: 'https://openrouter.ai/api/v1',
    defaultModel: 'deepseek/deepseek-chat',
    modelSuggestions: [
      'deepseek/deepseek-chat',
      'anthropic/claude-3.7-sonnet',
      'deepseek/deepseek-r1',
      'google/gemini-2.0-flash-001',
      'openai/gpt-4o',
      'openai/gpt-4o-mini',
      'meta-llama/llama-3.3-70b-instruct'
    ],
    placeholderKey: 'sk-or-v1-...',
    docsUrl: 'https://openrouter.ai/keys'
  },
  kilo: {
    id: 'kilo',
    name: 'Kilo Gateway (Kilocode / 500+ Models)',
    defaultBaseUrl: 'https://api.kilo.ai/api/gateway',
    defaultModel: 'deepseek/deepseek-chat',
    modelSuggestions: [
      'deepseek/deepseek-chat',
      'anthropic/claude-3.7-sonnet',
      'deepseek/deepseek-r1',
      'google/gemini-2.0-flash',
      'openai/gpt-4o',
      'openai/gpt-4o-mini',
      'meta-llama/llama-3.3-70b-instruct'
    ],
    placeholderKey: 'kilo_live_... or your Kilo API key',
    docsUrl: 'https://kilo.ai'
  },
  gemini: {
    id: 'gemini',
    name: 'Google Gemini (Official API)',
    defaultBaseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    defaultModel: 'gemini-2.0-flash',
    modelSuggestions: [
      'gemini-2.0-flash',
      'gemini-1.5-flash',
      'gemini-2.0-flash-lite',
      'gemini-1.5-pro'
    ],
    placeholderKey: 'AIzaSy...',
    docsUrl: 'https://aistudio.google.com/app/apikey'
  },
  deepseek: {
    id: 'deepseek',
    name: 'DeepSeek Official',
    defaultBaseUrl: 'https://api.deepseek.com/v1',
    defaultModel: 'deepseek-chat',
    modelSuggestions: ['deepseek-chat', 'deepseek-reasoner'],
    placeholderKey: 'sk-...',
    docsUrl: 'https://platform.deepseek.com/api_keys'
  },
  moonshot: {
    id: 'moonshot',
    name: 'Moonshot AI / Kimi',
    defaultBaseUrl: 'https://api.moonshot.cn/v1',
    defaultModel: 'moonshot-v1-auto',
    modelSuggestions: ['moonshot-v1-auto', 'moonshot-v1-8k', 'moonshot-v1-32k', 'moonshot-v1-128k'],
    placeholderKey: 'sk-...',
    docsUrl: 'https://platform.moonshot.cn/console/api-keys'
  },
  zhipu: {
    id: 'zhipu',
    name: 'Zhipu AI / GLM',
    defaultBaseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    defaultModel: 'glm-4-plus',
    modelSuggestions: ['glm-4-plus', 'glm-4-flash', 'glm-4-air', 'glm-4-long'],
    placeholderKey: 'your-api-key.id',
    docsUrl: 'https://open.bigmodel.cn/usercenter/apikeys'
  },
  nvidia: {
    id: 'nvidia',
    name: 'NVIDIA NIM',
    defaultBaseUrl: 'https://integrate.api.nvidia.com/v1',
    defaultModel: 'meta/llama-3.1-70b-instruct',
    modelSuggestions: [
      'meta/llama-3.1-70b-instruct',
      'deepseek-ai/deepseek-r1',
      'nvidia/nemotron-4-340b-instruct'
    ],
    placeholderKey: 'nvapi-...',
    docsUrl: 'https://build.nvidia.com'
  },
  groq: {
    id: 'groq',
    name: 'Groq (Ultra-Fast Inference)',
    defaultBaseUrl: 'https://api.groq.com/openai/v1',
    defaultModel: 'llama-3.3-70b-versatile',
    modelSuggestions: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'deepseek-r1-distill-llama-70b'],
    placeholderKey: 'gsk_...',
    docsUrl: 'https://console.groq.com/keys'
  },
  openai: {
    id: 'openai',
    name: 'OpenAI',
    defaultBaseUrl: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4o-mini',
    modelSuggestions: ['gpt-4o-mini', 'gpt-4o', 'o3-mini', 'o1'],
    placeholderKey: 'sk-proj-...',
    docsUrl: 'https://platform.openai.com/api-keys'
  },
  custom: {
    id: 'custom',
    name: 'Custom / Proxy / Local (Ollama)',
    defaultBaseUrl: 'http://localhost:11434/v1',
    defaultModel: 'llama3.2',
    modelSuggestions: ['llama3.2', 'deepseek-r1', 'mistral', 'custom-model'],
    placeholderKey: 'Optional or provider key...',
    docsUrl: 'https://ollama.com'
  }
};

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function callUniversalLLM(
  config: AIProviderConfig,
  messages: ChatMessage[],
  jsonMode: boolean = false
): Promise<string> {
  const preset = PROVIDER_PRESETS[config.provider] || PROVIDER_PRESETS.openrouter;
  const baseUrl = (config.baseUrl || preset.defaultBaseUrl).replace(/\/+$/, '');
  const model = config.model || preset.defaultModel;

  // 1. Special case: Native Google Gemini API endpoint
  if (config.provider === 'gemini') {
    let cleanModel = (config.model || preset.defaultModel).replace(/^models\//, '');
    if (cleanModel.startsWith('gemini-2.5')) {
      cleanModel = 'gemini-2.0-flash';
    }

    const promptText = messages
      .map((m) => `${m.role === 'system' ? '[System Note]' : m.role}: ${m.content}`)
      .join('\n\n');

    let url = `${baseUrl}/models/${cleanModel}:generateContent?key=${config.apiKey.trim()}`;
    let response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptText }] }],
        generationConfig: jsonMode ? { responseMimeType: 'application/json' } : undefined
      })
    });

    // Auto-fallback if model returned 404 (e.g. if user entered an unreleased/deprecated model)
    if (!response.ok && response.status === 404 && cleanModel !== 'gemini-2.0-flash') {
      cleanModel = 'gemini-2.0-flash';
      url = `${baseUrl}/models/${cleanModel}:generateContent?key=${config.apiKey.trim()}`;
      response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }],
          generationConfig: jsonMode ? { responseMimeType: 'application/json' } : undefined
        })
      });
    }

    // Secondary fallback to gemini-1.5-flash if 2.0-flash is also not found
    if (!response.ok && response.status === 404 && cleanModel !== 'gemini-1.5-flash') {
      cleanModel = 'gemini-1.5-flash';
      url = `${baseUrl}/models/${cleanModel}:generateContent?key=${config.apiKey.trim()}`;
      response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }],
          generationConfig: jsonMode ? { responseMimeType: 'application/json' } : undefined
        })
      });
    }

    if (!response.ok) {
      const errText = await response.text();
      let message = errText;
      try {
        const parsed = JSON.parse(errText);
        message = parsed.error?.message || errText;
      } catch {}
      if (response.status === 400 && (message.includes('API_KEY_INVALID') || message.includes('API key not valid'))) {
        throw new Error('Google Gemini: Invalid API Key. Please verify your Gemini key at aistudio.google.com.');
      }
      if (response.status === 404) {
        throw new Error(`Google Gemini (404): Model "${cleanModel}" not found. Please choose gemini-2.0-flash or gemini-1.5-flash.`);
      }
      throw new Error(`Google Gemini Error (${response.status}): ${message}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }

  // 2. Standard OpenAI-Compatible Endpoint (OpenRouter, Kilo, DeepSeek, Moonshot, GLM, NVIDIA, Groq, OpenAI, Custom)
  const endpoint = `${baseUrl}/chat/completions`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${config.apiKey.trim()}`
  };

  // OpenRouter attribution headers
  if (config.provider === 'openrouter') {
    headers['HTTP-Referer'] = 'https://aryamaan-sanctuary.app';
    headers['X-Title'] = 'Aryamaan Sanctuary';
  }

  const payload: any = {
    model,
    messages,
    temperature: 0.7
  };

  if (
    jsonMode &&
    (config.provider === 'openai' ||
      config.provider === 'openrouter' ||
      config.provider === 'kilo' ||
      config.provider === 'groq' ||
      config.provider === 'deepseek')
  ) {
    payload.response_format = { type: 'json_object' };
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errText = await response.text();
    let detail = errText;
    try {
      const parsed = JSON.parse(errText);
      detail = parsed.error?.message || parsed.message || errText;
    } catch {}
    if (response.status === 401 || response.status === 403) {
      throw new Error(`${preset.name}: Authentication failed (401/403). Please verify your API key.`);
    }
    if (response.status === 404) {
      throw new Error(`${preset.name}: Model "${model}" or endpoint not found (404). Check model ID.`);
    }
    if (response.status === 429) {
      throw new Error(`${preset.name}: Rate limit or quota exceeded (429).`);
    }
    throw new Error(`${preset.name} Error (${response.status}): ${detail}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

export interface ExtractedQuoteData {
  text: string;
  author: string;
  tags: string[];
  notes: string;
}

export async function extractQuoteFromImage(
  config: AIProviderConfig,
  base64Data: string,
  mimeType: string = 'image/jpeg'
): Promise<ExtractedQuoteData> {
  const cleanBase64 = base64Data.replace(/^data:image\/[a-zA-Z+]+;base64,/, '');

  const systemPrompt = `You are a precision quote extraction engine for a personal wisdom sanctuary.
Your task: Analyze the provided screenshot (which may be from Instagram, Twitter/X, a book photo, or an article).
CRITICAL: IGNORE all surrounding social media & device UI:
- No comments, like buttons, hearts, reply counts, or follower counts.
- No Instagram/Twitter handles, timestamps, usernames (unless it is clearly the actual philosopher/author).
- No phone status bar (battery percentage, wifi, clock).
- No ads or sponsored labels.

Extract ONLY the meaningful philosophical quote, stoic reflection, or core wisdom.
Return a STRICT JSON object in this exact schema:
{
  "text": "The exact quote text, cleanly formatted with proper punctuation and no surrounding clutter",
  "author": "The author or thinker (e.g. Marcus Aurelius, Epictetus, Naval Ravikant). If unknown, infer or use 'Unknown'",
  "tags": ["2-4 short wisdom tags, e.g. Stoicism, Discipline, Mindset"],
  "notes": "A brief 1-sentence essence or context note"
}`;

  // 1. Google Gemini Native Multimodal
  if (config.provider === 'gemini') {
    const preset = PROVIDER_PRESETS.gemini;
    const baseUrl = (config.baseUrl || preset.defaultBaseUrl).replace(/\/+$/, '');
    let cleanModel = (config.model || 'gemini-2.0-flash').replace(/^models\//, '');
    if (cleanModel.startsWith('gemini-2.5')) {
      cleanModel = 'gemini-2.0-flash';
    }
    const url = `${baseUrl}/models/${cleanModel}:generateContent?key=${config.apiKey.trim()}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: systemPrompt },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: cleanBase64
                }
              }
            ]
          }
        ],
        generationConfig: { responseMimeType: 'application/json' }
      })
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Gemini Vision Error (${response.status}): ${err}`);
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    return parseQuoteJson(rawText);
  }

  // 2. OpenAI / OpenRouter / Kilo Multimodal
  const preset = PROVIDER_PRESETS[config.provider] || PROVIDER_PRESETS.openrouter;
  const baseUrl = (config.baseUrl || preset.defaultBaseUrl).replace(/\/+$/, '');
  const model =
    config.model ||
    (config.provider === 'openai'
      ? 'gpt-4o-mini'
      : config.provider === 'openrouter'
      ? 'google/gemini-2.0-flash-001'
      : 'deepseek/deepseek-chat');
  const endpoint = `${baseUrl}/chat/completions`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${config.apiKey.trim()}`
  };

  if (config.provider === 'openrouter') {
    headers['HTTP-Referer'] = 'https://aryamaan-sanctuary.app';
    headers['X-Title'] = 'Aryamaan Sanctuary';
  }

  const imageUrl = `data:${mimeType};base64,${cleanBase64}`;

  const payload: any = {
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Please extract the quote and author from this screenshot following the requested JSON schema.' },
          {
            type: 'image_url',
            image_url: { url: imageUrl }
          }
        ]
      }
    ],
    temperature: 0.2
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`${preset.name} Vision Error (${response.status}): ${err}`);
  }

  const data = await response.json();
  const rawText = data.choices?.[0]?.message?.content || '{}';
  return parseQuoteJson(rawText);
}

function parseQuoteJson(rawText: string): ExtractedQuoteData {
  try {
    const cleaned = rawText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    const parsed = JSON.parse(cleaned);
    return {
      text: parsed.text || '',
      author: parsed.author || 'Unknown',
      tags: Array.isArray(parsed.tags) ? parsed.tags : ['Wisdom'],
      notes: parsed.notes || ''
    };
  } catch (e) {
    return {
      text: rawText.trim(),
      author: 'Unknown',
      tags: ['Wisdom'],
      notes: 'Extracted from screenshot'
    };
  }
}
