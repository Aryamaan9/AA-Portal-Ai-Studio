import { AIProviderConfig } from '../types';
import { callUniversalLLM } from './llm';

export interface RefineDiaryResult {
  refinedContent: string;
  learnings: string[];
  suggestedTags: string[];
}

export async function refineRawDiaryThought(
  rawContent: string,
  aiConfig?: AIProviderConfig,
  legacyGeminiKey?: string
): Promise<RefineDiaryResult> {
  const effectiveConfig: AIProviderConfig | undefined =
    aiConfig && aiConfig.apiKey?.trim()
      ? aiConfig
      : legacyGeminiKey && legacyGeminiKey.trim().length > 10
      ? { provider: 'gemini', apiKey: legacyGeminiKey.trim(), model: 'gemini-1.5-flash' }
      : undefined;

  if (effectiveConfig) {
    try {
      const prompt = `You are a quiet, world-class personal editor and reflective psychologist helping Aryamaan process his raw diary thoughts.
Raw Entry:
"${rawContent}"

Transform this raw thought into 2 things:
1. "refinedContent": A polished, calm, articulate, grounded 2-4 sentence distillation of what he is realizing. Preserve his authentic voice and emotional essence without fluff or toxic positivity.
2. "learnings": An array of 2-3 concise bullet points capturing the core takeaway, principle, or next mindful action.
3. "suggestedTags": An array of 1-3 relevant tags (e.g. Clarity, Peace, Mindset, Work, Energy, Relationships).

Return strictly JSON matching this schema:
{
  "refinedContent": "...",
  "learnings": ["...", "..."],
  "suggestedTags": ["...", "..."]
}`;

      const responseText = await callUniversalLLM(
        effectiveConfig,
        [
          { role: 'system', content: 'You are a compassionate editor. Output strictly valid JSON only.' },
          { role: 'user', content: prompt }
        ],
        true
      );

      if (responseText) {
        const cleaned = responseText.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
        const parsed = JSON.parse(cleaned);
        return {
          refinedContent: parsed.refinedContent || rawContent,
          learnings: Array.isArray(parsed.learnings) ? parsed.learnings : ['Reflected on personal alignment.'],
          suggestedTags: Array.isArray(parsed.suggestedTags) ? parsed.suggestedTags : ['Reflection']
        };
      }
    } catch (err) {
      console.warn('[DiaryService] LLM call failed, falling back to heuristic engine:', err);
    }
  }

  // Heuristic Fallback (Instant & 100% Offline)
  const sentences = rawContent
    .split(/[.!?\n]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 15);

  const refined =
    sentences.length > 1
      ? `Core Essence: ${sentences.slice(0, 2).join('. ')}. By acknowledging this honestly, clarity begins to restore.`
      : `Core Essence: ${rawContent.trim()}`;

  const learnings = [
    'Acknowledge the feeling without urgency to fix everything immediately.',
    'Focus on the single next honest step with gentleness.'
  ];

  return {
    refinedContent: refined,
    learnings,
    suggestedTags: ['Reflection', 'Presence']
  };
}
