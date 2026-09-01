import { Quote, FeelingReflection, AIProviderConfig } from '../types';
import { callUniversalLLM } from './llm';

interface EmotionPattern {
  keywords: string[];
  state: string;
  groundingThoughts: string[];
  socraticQuestions: string[];
  relatedTags: string[];
}

const EMOTION_PATTERNS: EmotionPattern[] = [
  {
    keywords: ['anxious', 'anxiety', 'worried', 'panic', 'nervous', 'heart racing', 'dread', 'overthinking', 'spiral'],
    state: 'Nervous System Elevation & Anxiety',
    groundingThoughts: [
      "Your nervous system is simply trying to protect you right now. Take a deep, slow exhale. You are safe in this physical moment.",
      "Most of what your mind is projecting as a crisis is just an anticipated thought, not the present reality. Bring your attention back to your hands and your breath.",
      "You don't need to figure out the whole story today. Just take care of the next ten minutes with gentleness."
    ],
    socraticQuestions: [
      "Is this something you can directly control right now, or something you are trying to control through worry?",
      "What would happen if you allowed yourself to feel this sensation without trying to urgently fix it?"
    ],
    relatedTags: ['Peace', 'Calm', 'Perspective', 'Surrender', 'Patience', 'Resilience']
  },
  {
    keywords: ['overwhelmed', 'too much', 'exhausted', 'burnout', 'heavy', 'drowning', 'tired', 'drained', 'cant keep up'],
    state: 'Cognitive & Emotional Overload',
    groundingThoughts: [
      "When everything feels heavy, it's not a sign that you are failing—it's a biological signal that your system needs quiet, not more effort.",
      "You are allowed to stop carrying the weight of tomorrow. Put down the invisible backpack. Just this one breath is enough.",
      "High performance is not about nonstop output. True mastery is knowing when to retreat to the sanctuary and restore."
    ],
    socraticQuestions: [
      "If you could only protect your energy for one essential thing today, what would you let go of?",
      "What would give you 5% more breathing room right now?"
    ],
    relatedTags: ['Simplicity', 'Rest', 'Boundaries', 'Clarity', 'Peace', 'Patience']
  },
  {
    keywords: ['lost', 'confused', 'stuck', 'direction', 'where am i going', 'doubt', 'imposter', 'not good enough', 'failure'],
    state: 'Seeking Direction & Inner Clarity',
    groundingThoughts: [
      "Feeling lost is often the quiet prelude to a new chapter of alignment. You don't need all the answers, only your next honest step.",
      "Your worth as a human being is unconditional. It does not fluctuate with productivity, external metrics, or temporary setbacks.",
      "Trust the quiet intelligence within you that brought you this far. Confusion is just old perspectives shedding away."
    ],
    socraticQuestions: [
      "What is the most honest truth you know right now, stripped of what others expect from you?",
      "What did you love or value before the pressure became so loud?"
    ],
    relatedTags: ['Identity', 'Courage', 'Purpose', 'Truth', 'Self-Trust', 'Resilience']
  },
  {
    keywords: ['angry', 'frustrated', 'irritated', 'resentful', 'unfair', 'mad', 'annoyed'],
    state: 'Emotional Friction & Boundary Strain',
    groundingThoughts: [
      "Anger is often a guardian for a boundary that felt crossed or an unmet hope. Acknowledge it without letting it steer your actions.",
      "Between stimulus and response, there is a space. In that space lies your freedom and peace.",
      "Holding onto burning frustration hurts only the vessel carrying it. Breathe it out into the room."
    ],
    socraticQuestions: [
      "What underlying vulnerability or care is this frustration protecting?",
      "What would letting go of the need to be right give you in peace?"
    ],
    relatedTags: ['Perspective', 'Peace', 'Stoicism', 'Clarity', 'Boundaries']
  },
  {
    keywords: ['grateful', 'calm', 'happy', 'peaceful', 'hopeful', 'content', 'aligned', 'inspired', 'focused'],
    state: 'Quiet Presence & Aligned Flow',
    groundingThoughts: [
      "Savor this quiet equilibrium. Let your body register the feeling of peace so it can remember the path back here.",
      "Gratitude turns what we have into enough, and more. Carry this clear, grounded light gently with you.",
      "When the mind is clear, effort becomes effortless and action becomes poetry."
    ],
    socraticQuestions: [
      "How can you anchor this state of ease so you can return to it when storms arise?",
      "What is one small blessing you are deeply thankful for right this moment?"
    ],
    relatedTags: ['Gratitude', 'Peace', 'Flow', 'Presence', 'Clarity', 'Joy']
  }
];

export const analyzeFeeling = async (
  rawInput: string,
  userQuotes: Quote[],
  aiConfig?: AIProviderConfig,
  legacyGeminiApiKey?: string
): Promise<FeelingReflection> => {
  const normalizedInput = rawInput.toLowerCase().trim();

  // 1. Try Universal BYOK LLM if configured
  const effectiveConfig: AIProviderConfig | undefined =
    aiConfig && aiConfig.apiKey?.trim()
      ? aiConfig
      : legacyGeminiApiKey && legacyGeminiApiKey.trim().length > 10
      ? {
          provider: 'gemini',
          apiKey: legacyGeminiApiKey.trim(),
          model: 'gemini-1.5-flash'
        }
      : undefined;

  if (effectiveConfig) {
    try {
      const systemPrompt = `You are a quiet, deeply empathetic, world-class somatic psychologist and Stoic philosopher speaking privately to Aryamaan, a high-performing, sensitive, thoughtful person currently feeling: "${rawInput}".
Respond with pure empathy, emotional down-regulation, and grounded clarity.

Provide your response in strictly valid JSON format with this exact schema:
{
  "dominantState": "Short 2-4 word calm descriptor of the state",
  "groundingThought": "A 2-3 sentence deeply comforting, nervous-system-regulating, wise reframe. No toxic positivity. Pure warmth and perspective.",
  "socraticQuestion": "1 gentle, high-leverage question to help him regain clarity or peace."
}`;

      const textResponse = await callUniversalLLM(
        effectiveConfig,
        [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: rawInput }
        ],
        true
      );

      if (textResponse) {
        // Extract JSON if wrapped in markdown code blocks
        const cleaned = textResponse.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
        const parsed = JSON.parse(cleaned);
        const matched = findRelevantQuotes(rawInput, userQuotes, [parsed.dominantState]);

        return {
          id: 'ref_' + Date.now(),
          rawInput,
          dominantState: parsed.dominantState || 'Reflective State',
          groundingThought: parsed.groundingThought,
          matchedQuoteIds: matched.map((q) => q.id),
          socraticQuestion: parsed.socraticQuestion,
          timestamp: new Date().toISOString()
        };
      }
    } catch (err) {
      console.warn('[Reflection Engine] Universal LLM call error, falling back to heuristic engine:', err);
    }
  }

  // 2. Local psychological heuristic fallback
  let matchedPattern = EMOTION_PATTERNS[0];
  let maxScore = -1;

  for (const pattern of EMOTION_PATTERNS) {
    let score = 0;
    for (const kw of pattern.keywords) {
      if (normalizedInput.includes(kw)) {
        score += 2;
      }
    }
    if (score > maxScore) {
      maxScore = score;
      matchedPattern = pattern;
    }
  }

  const randomThought =
    matchedPattern.groundingThoughts[
      Math.floor(Math.random() * matchedPattern.groundingThoughts.length)
    ];
  const randomQuestion =
    matchedPattern.socraticQuestions[
      Math.floor(Math.random() * matchedPattern.socraticQuestions.length)
    ];

  const matchedQuotes = findRelevantQuotes(
    rawInput,
    userQuotes,
    matchedPattern.relatedTags
  );

  return {
    id: 'ref_' + Date.now(),
    rawInput,
    dominantState: matchedPattern.state,
    groundingThought: randomThought,
    matchedQuoteIds: matchedQuotes.map((q) => q.id),
    socraticQuestion: randomQuestion,
    timestamp: new Date().toISOString()
  };
};

export const findRelevantQuotes = (
  input: string,
  quotes: Quote[],
  targetTags: string[] = []
): Quote[] => {
  if (!quotes || !quotes.length) return [];

  const lowerInput = (input || '').toLowerCase();
  const scored = quotes.map((quote) => {
    let score = 0;
    const tags = quote.tags || [];

    for (const tag of tags) {
      if (tag && targetTags.some((t) => t.toLowerCase() === tag.toLowerCase())) {
        score += 5;
      }
      if (tag && lowerInput.includes(tag.toLowerCase())) {
        score += 4;
      }
    }

    const words = lowerInput.split(/\s+/).filter((w) => w.length > 3);
    for (const w of words) {
      if (quote.text && quote.text.toLowerCase().includes(w)) {
        score += 3;
      }
      if (quote.author && quote.author.toLowerCase().includes(w)) {
        score += 2;
      }
    }

    if (quote.isPinned) {
      score += 1;
    }

    return { quote, score };
  });

  scored.sort((a, b) => b.score - a.score);

  const relevant = scored.filter((s) => s.score > 0).map((s) => s.quote);
  if (relevant.length > 0) {
    return relevant.slice(0, 3);
  }

  const pinned = quotes.filter((q) => q.isPinned);
  return (pinned.length ? pinned : quotes).slice(0, 2);
};
