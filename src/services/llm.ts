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
    name: 'OpenRouter (Recommended - 200+ Models)',
    defaultBaseUrl: 'https://openrouter.ai/api/v1',
    defaultModel: 'deepseek/deepseek-chat',
    modelSuggestions: [
      'deepseek/deepseek-chat',
      'anthropic/claude-3.5-sonnet',
      'meta-llama/llama-3.3-70b-instruct',
      'google/gemini-2.0-flash-exp:free',
      'openai/gpt-4o-mini'
    ],
    placeholderKey: 'sk-or-v1-...',
    docsUrl: 'https://openrouter.ai/keys'
  },
  gemini: {
    id: 'gemini',
    name: 'Google Gemini',
    defaultBaseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    defaultModel: 'gemini-1.5-flash',
    modelSuggestions: ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash-exp'],
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
    modelSuggestions: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768'],
    placeholderKey: 'gsk_...',
    docsUrl: 'https://console.groq.com/keys'
  },
  openai: {
    id: 'openai',
    name: 'OpenAI',
    defaultBaseUrl: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4o-mini',
    modelSuggestions: ['gpt-4o-mini', 'gpt-4o', 'o1-mini', 'o3-mini'],
    placeholderKey: 'sk-proj-...',
    docsUrl: 'https://platform.openai.com/api-keys'
  },
  custom: {
    id: 'custom',
    name: 'Custom / Proxy / Kilocode / Local (Ollama)',
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
    const promptText = messages
      .map((m) => `${m.role === 'system' ? '[System Note]' : m.role}: ${m.content}`)
      .join('\n\n');

    const url = `${baseUrl}/models/${model}:generateContent?key=${config.apiKey.trim()}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptText }] }],
        generationConfig: jsonMode ? { responseMimeType: 'application/json' } : undefined
      })
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Gemini API Error (${response.status}): ${err}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }

  // 2. Standard OpenAI-Compatible Endpoint (OpenRouter, DeepSeek, Moonshot, GLM, NVIDIA, Groq, OpenAI, Custom)
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

  if (jsonMode && (config.provider === 'openai' || config.provider === 'openrouter' || config.provider === 'groq' || config.provider === 'deepseek')) {
    payload.response_format = { type: 'json_object' };
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`${preset.name} Error (${response.status}): ${err}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}
