import { EntryType, PriorityType } from '../types.js';

export interface ClassifiedMessage {
  primaryType: EntryType | 'todo' | 'goal';
  secondaryTypes?: string[];
  title?: string;
  cleanContent: string;
  author?: string;
  source: 'whatsapp';
  tags: string[];
  moodState?: string;
  todoDueDate?: string;
  todoPriority?: PriorityType;
  goalHorizon?: 'current_season' | 'someday' | 'north_star';
  confidence: number;
}

export async function classifyWhatsAppMessage(
  rawText: string,
  geminiApiKey?: string,
  openrouterApiKey?: string
): Promise<ClassifiedMessage> {
  const text = rawText.trim();

  const prompt = `Analyze this incoming WhatsApp message from Aryamaan to his personal sanctuary life dashboard:
Message: "${text}"

Classify it into one of: 'diary', 'mood', 'quote', 'idea', 'goal', 'todo'.
Extract relevant fields.
Return strictly JSON matching this schema:
{
  "primaryType": "diary" | "mood" | "quote" | "idea" | "goal" | "todo",
  "cleanContent": "Cleaned message text or quote without prefixes",
  "title": "Short title if applicable, or null",
  "author": "Author name if quote, or null",
  "tags": ["1-3 relevant tags like Peace, Ambition, Work, Health, Reflection"],
  "moodState": "e.g. 7/10 or Calm if mood, or null",
  "todoDueDate": "e.g. Tomorrow or specific date if todo, or null",
  "todoPriority": "low" | "medium" | "high",
  "goalHorizon": "current_season" | "someday" | "north_star"
}`;

  // 1. Try OpenRouter BYOK (gives access to DeepSeek, Claude, Llama, Qwen, etc.)
  if (openrouterApiKey && openrouterApiKey.length > 10) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openrouterApiKey.trim()}`,
          'HTTP-Referer': 'https://aryamaan-sanctuary.app',
          'X-Title': 'Aryamaan Sanctuary'
        },
        body: JSON.stringify({
          model: 'deepseek/deepseek-chat',
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' }
        })
      });

      if (response.ok) {
        const data = (await response.json()) as any;
        const output = data.choices?.[0]?.message?.content;
        if (output) {
          const parsed = JSON.parse(output);
          return {
            primaryType: parsed.primaryType || 'diary',
            cleanContent: parsed.cleanContent || text,
            title: parsed.title || undefined,
            author: parsed.author || undefined,
            source: 'whatsapp',
            tags: Array.isArray(parsed.tags) ? parsed.tags : ['WhatsApp'],
            moodState: parsed.moodState || undefined,
            todoDueDate: parsed.todoDueDate || undefined,
            todoPriority: parsed.todoPriority || 'medium',
            goalHorizon: parsed.goalHorizon || 'current_season',
            confidence: 0.96
          };
        }
      }
    } catch (err) {
      console.warn('[Classifier] OpenRouter call failed, trying fallback:', err);
    }
  }

  // 2. Try Gemini AI BYOK
  if (geminiApiKey && geminiApiKey.length > 10) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey.trim()}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json' }
          })
        }
      );

      if (response.ok) {
        const data = (await response.json()) as any;
        const output = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (output) {
          const parsed = JSON.parse(output);
          return {
            primaryType: parsed.primaryType || 'diary',
            cleanContent: parsed.cleanContent || text,
            title: parsed.title || undefined,
            author: parsed.author || undefined,
            source: 'whatsapp',
            tags: Array.isArray(parsed.tags) ? parsed.tags : ['WhatsApp'],
            moodState: parsed.moodState || undefined,
            todoDueDate: parsed.todoDueDate || undefined,
            todoPriority: parsed.todoPriority || 'medium',
            goalHorizon: parsed.goalHorizon || 'current_season',
            confidence: 0.95
          };
        }
      }
    } catch (err) {
      console.warn('[Classifier] Gemini AI classification failed, using heuristic engine:', err);
    }
  }

  // 3. High-Precision Heuristic NLP Fallback (Instant & 100% Offline)
  const lower = text.toLowerCase();

  // Todo
  if (
    lower.startsWith('todo:') ||
    lower.startsWith('task:') ||
    lower.startsWith('remind me to') ||
    lower.startsWith('need to') ||
    lower.startsWith('call ') ||
    lower.startsWith('email ') ||
    lower.startsWith('buy ')
  ) {
    let clean = text.replace(/^(todo:|task:|remind me to|need to)\s*/i, '').trim();
    let dueDate: string | undefined;
    let priority: PriorityType = 'medium';

    if (/tomorrow/i.test(clean)) {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      dueDate = d.toISOString();
    } else if (/tonight|today/i.test(clean)) {
      dueDate = new Date().toISOString();
    }

    if (/urgent|asap|important/i.test(clean)) {
      priority = 'high';
    }

    return {
      primaryType: 'todo',
      title: clean,
      cleanContent: text,
      source: 'whatsapp',
      tags: ['Action', 'WhatsApp'],
      todoDueDate: dueDate,
      todoPriority: priority,
      confidence: 0.9
    };
  }

  // Quotes
  if (
    lower.startsWith('quote:') ||
    lower.startsWith('quote -') ||
    (text.startsWith('"') && text.endsWith('"')) ||
    (/—|-/.test(text) && (lower.includes('marcus') || lower.includes('seneca') || lower.includes('naval') || lower.includes('jobs')))
  ) {
    let clean = text.replace(/^quote:\s*/i, '').replace(/^"|"$/g, '').trim();
    let author = 'Internal Wisdom';

    if (clean.includes('—')) {
      const parts = clean.split('—');
      clean = parts[0].trim();
      author = parts[1].trim();
    } else if (clean.includes(' - ')) {
      const parts = clean.split(' - ');
      clean = parts[0].trim();
      author = parts[1].trim();
    }

    return {
      primaryType: 'quote',
      title: undefined,
      cleanContent: clean,
      author,
      source: 'whatsapp',
      tags: ['Wisdom', 'WhatsApp'],
      confidence: 0.92
    };
  }

  // Mood
  const moodScoreMatch = text.match(/feeling\s*(\d{1,2}\s*\/\s*10|\d{1,2})/i);
  if (moodScoreMatch || lower.startsWith('feeling ') || lower.startsWith('mood:')) {
    const moodState = moodScoreMatch ? moodScoreMatch[1].replace(/\s+/g, '') : undefined;
    return {
      primaryType: 'mood',
      title: undefined,
      cleanContent: text,
      moodState,
      source: 'whatsapp',
      tags: ['Mood', 'Check-in', 'WhatsApp'],
      confidence: 0.88
    };
  }

  // Idea
  if (
    lower.startsWith('idea:') ||
    lower.includes("i've been thinking") ||
    lower.includes('what if we') ||
    lower.includes('maybe i should') ||
    lower.includes('concept:') ||
    lower.includes('startup idea')
  ) {
    const clean = text.replace(/^idea:\s*/i, '').trim();
    return {
      primaryType: 'idea',
      title: clean.length > 50 ? clean.slice(0, 47) + '...' : clean,
      cleanContent: text,
      source: 'whatsapp',
      tags: ['Idea', 'Exploration', 'WhatsApp'],
      confidence: 0.85
    };
  }

  // Goal
  if (
    lower.startsWith('goal:') ||
    lower.startsWith('target:') ||
    lower.includes('my goal for') ||
    lower.includes('by the end of this year') ||
    lower.includes('horizon:')
  ) {
    const clean = text.replace(/^(goal:|target:)\s*/i, '').trim();
    return {
      primaryType: 'goal',
      title: clean,
      cleanContent: text,
      source: 'whatsapp',
      tags: ['Goal', 'Vision', 'WhatsApp'],
      goalHorizon: 'current_season',
      confidence: 0.85
    };
  }

  // Default Diary
  return {
    primaryType: 'diary',
    cleanContent: text,
    source: 'whatsapp',
    tags: ['Daily Journal', 'WhatsApp'],
    confidence: 0.8
  };
}
