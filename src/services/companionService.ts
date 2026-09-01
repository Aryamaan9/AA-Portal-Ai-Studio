import { Quote, DiaryEntry, CompanionMessage, AIProviderConfig } from '../types';
import { callUniversalLLM } from './llm';

export interface CompanionReplyResult {
  message: string;
  matchedQuotes: Quote[];
  suggestedDiaryEntry?: {
    raw: string;
    refined: string;
    learnings: string[];
    tags: string[];
  };
  suggestedQuote?: {
    text: string;
    author: string;
    notes?: string;
    tags: string[];
  };
}

export async function askCompanion(
  userText: string,
  chatHistory: CompanionMessage[],
  quotesVault: Quote[],
  diaryEntries: DiaryEntry[],
  aiConfig?: AIProviderConfig,
  legacyGeminiKey?: string
): Promise<CompanionReplyResult> {
  // 1. Identify relevant quotes from vault
  const lower = userText.toLowerCase();
  const matchedQuotes = quotesVault
    .filter((q) => {
      const matchText = q.text.toLowerCase().includes(lower) || lower.includes(q.author.toLowerCase());
      const matchTag = q.tags.some((t) => lower.includes(t.toLowerCase()));
      return matchText || matchTag || q.isPinned;
    })
    .slice(0, 2);

  // 2. Format Context
  const vaultSummary = quotesVault.slice(0, 8).map((q) => `"${q.text}" — ${q.author} (Note: ${q.notes || 'None'})`).join('\n');
  const recentDiarySummary = diaryEntries.slice(0, 5).map((d) => `Date: ${d.date}, Refined: ${d.refinedContent || d.rawContent}`).join('\n');

  const effectiveConfig: AIProviderConfig | undefined =
    aiConfig && aiConfig.apiKey?.trim()
      ? aiConfig
      : legacyGeminiKey && legacyGeminiKey.trim().length > 10
      ? { provider: 'gemini', apiKey: legacyGeminiKey.trim(), model: 'gemini-1.5-flash' }
      : undefined;

  if (effectiveConfig) {
    try {
      const systemPrompt = `You are a quiet, deeply empathetic, world-class personal companion, somatic therapist, and Stoic philosopher speaking privately to Aryamaan.
He is a high-performing, sensitive, thoughtful person seeking clarity, perspective, and comfort.

Aryamaan's Saved Wisdom Vault:
${vaultSummary || '(Vault is currently clean)'}

Recent Diary Context:
${recentDiarySummary || '(No previous diary entries)'}

Rules for your response:
1. Speak gently, without corporate jargon, bullet dumps, or toxic positivity. Validate how he feels, offer a nervous-system grounding reframe, and ask 1 quiet clarifying question.
2. When appropriate, cite or echo one of his own saved quotes from above to remind him of what he already knows.
3. If Aryamaan expresses a clear personal realization or meaningful lesson, provide a structured option to save it to his 3-section diary or quotes vault.

Return strictly JSON with this schema:
{
  "reply": "Your calming, thoughtful conversational response to Aryamaan",
  "suggestedDiary": {
    "raw": "Original summary of his feeling",
    "refined": "Distilled wisdom",
    "learnings": ["Key takeaway 1", "Key takeaway 2"],
    "tags": ["Peace", "Clarity"]
  } // or null if not a distinct breakthrough,
  "suggestedQuote": {
    "text": "Extracted quote text",
    "author": "Author or Aryamaan",
    "notes": "Context note",
    "tags": ["Wisdom"]
  } // or null
}`;

      const historyMessages = chatHistory.slice(-6).map((m) => ({
        role: m.role,
        content: m.content
      }));

      const responseText = await callUniversalLLM(
        effectiveConfig,
        [
          { role: 'system', content: systemPrompt },
          ...historyMessages,
          { role: 'user', content: userText }
        ],
        true
      );

      if (responseText) {
        const cleaned = responseText.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
        const parsed = JSON.parse(cleaned);
        return {
          message: parsed.reply || "I hear you, Aryamaan. Take a deep, gentle breath. What feels most essential for you in this moment?",
          matchedQuotes,
          suggestedDiaryEntry: parsed.suggestedDiary || undefined,
          suggestedQuote: parsed.suggestedQuote || undefined
        };
      }
    } catch (err) {
      console.warn('[CompanionService] LLM call failed, falling back to heuristic reply:', err);
    }
  }

  // Heuristic Companion Fallback
  let reply = "I hear you, Aryamaan. Take a slow, quiet breath. You don't need to have all the answers right now.";
  if (matchedQuotes.length > 0) {
    reply += ` As you once anchored: "${matchedQuotes[0].text}" — ${matchedQuotes[0].author}. What would happen if you gave yourself permission to step back for a moment?`;
  } else {
    reply += " What is the most honest truth you know right now, stripped of pressure?";
  }

  return {
    message: reply,
    matchedQuotes,
    suggestedDiaryEntry: {
      raw: userText,
      refined: `Grounded realization: Acknowledging what is present without rushing to force an outcome.`,
      learnings: ['Give space between thought and reaction.', 'Honor current energy levels.'],
      tags: ['Clarity', 'Peace']
    }
  };
}
