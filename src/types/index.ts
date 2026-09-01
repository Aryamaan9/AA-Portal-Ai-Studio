export interface Quote {
  id: string;
  text: string;
  author: string;
  source?: string;
  tags: string[];
  notes?: string;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DiaryEntry {
  id: string;
  title?: string;
  date: string; // YYYY-MM-DD
  rawContent: string;       // Notebook entry text
  refinedContent?: string;  // Gentle 2-line distillation note
  learnings?: string[];     // Key takeaways if any
  tags: string[];
  source: 'web' | 'whatsapp' | 'chatgpt' | 'companion';
  createdAt: string;
  updatedAt: string;
}

export interface CompanionMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  matchedQuoteIds?: string[];
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
  timestamp: string;
}

export interface ChatNotebook {
  id: string;
  name: string;
  color?: string;
  createdAt: string;
}

export interface ChatThread {
  id: string;
  title: string;
  messages: CompanionMessage[];
  createdAt: string;
  updatedAt: string;
  notebookId?: string;
}

export interface FeelingReflection {
  id: string;
  rawInput: string;
  dominantState: string;
  groundingThought: string;
  matchedQuoteIds: string[];
  socraticQuestion?: string;
  timestamp: string;
}

export type LLMProviderType =
  | 'openrouter'
  | 'gemini'
  | 'openai'
  | 'deepseek'
  | 'moonshot'
  | 'zhipu'
  | 'nvidia'
  | 'groq'
  | 'custom';

export interface AIProviderConfig {
  provider: LLMProviderType;
  apiKey: string;
  model: string;
  baseUrl?: string;
}

// 4 MASTER PRODUCTION LAYOUT STRUCTURES
export type UILayoutStructure =
  | 'sidebar-left'        // 1. Left Sidebar Navigation (Linear / Apple Notes)
  | 'centered-notebook'   // 2. Centered Literary Notebook (Kinfolk / Substack)
  | 'split-pane'          // 3. Split-Pane Studio (Bear / Notion)
  | 'floating-island';    // 4. Floating Glass Island Dock (Dynamic Island)

// 8 EXPANDED NATURE COLOR ATMOSPHERES
export type UIThemePreset =
  | 'grounded-sage'     // 1. Earthy Herbal Sage Green & Pine Ink
  | 'forest-emerald'    // 2. Deep Verdant Forest Canopy Green
  | 'ocean-teal'        // 3. Coastal Maritime Teal & Fjord Blue
  | 'misty-aquamarine'  // 4. Glacial Seafoam & Mountain Tarn Cyan
  | 'midnight-cobalt'   // 5. Deep Nocturnal Indigo & Electric Ocean Cobalt
  | 'twilight-lavender' // 6. Alpine Heather & Royal Violet Purple
  | 'warm-parchment'    // 7. Sun-Bleached Linen & Cedar Driftwood
  | 'dark-hearth';      // 8. Obsidian Woodland Moss & Campfire Embers

export interface AppSettings {
  userName: string;
  theme: UIThemePreset;
  layoutStructure: UILayoutStructure;
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  aiConfig?: AIProviderConfig;
  geminiApiKey?: string;
  lastSync?: string;
}

export type ActiveTab = 'sanctuary' | 'diary' | 'quotes' | 'companion';
