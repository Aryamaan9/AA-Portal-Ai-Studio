import { Quote, DiaryEntry, CompanionMessage, ChatThread, AppSettings } from '../types';

const STORAGE_KEYS = {
  QUOTES: 'aryamaan_quotes_v2',
  DIARY: 'aryamaan_diary_v2',
  COMPANION: 'aryamaan_companion_v2',
  CHAT_THREADS: 'aryamaan_chat_threads_v2',
  ACTIVE_THREAD_ID: 'aryamaan_active_thread_id_v2',
  SETTINGS: 'aryamaan_settings_v2'
};

const DEFAULT_SETTINGS: AppSettings = {
  userName: 'Aryamaan',
  theme: 'grounded-sage',
  layoutStructure: 'sidebar-left',
  geminiApiKey: import.meta.env.VITE_GEMINI_API_KEY || '',
  providerConfigs: {},
  providerKeys: {}
};

// 1. QUOTES
export const loadQuotes = (): Quote[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.QUOTES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveQuotes = (quotes: Quote[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify(quotes));
  } catch (e) {
    console.error('Failed to save quotes locally', e);
  }
};

// 2. DIARY / REFLECTIONS
export const loadDiary = (): DiaryEntry[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DIARY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveDiary = (entries: DiaryEntry[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.DIARY, JSON.stringify(entries));
  } catch (e) {
    console.error('Failed to save diary locally', e);
  }
};

export const loadReflections = loadDiary;
export const saveReflections = saveDiary;

// Todos & Goals Stubs for esbuild compatibility
export const loadTodos = () => [];
export const saveTodos = () => {};
export const loadGoals = () => [];
export const saveGoals = () => {};

// 3. CHAT THREADS & HISTORY (ChatGPT Style Memory & History)
const INITIAL_THREAD: ChatThread = {
  id: 'thread_initial',
  title: 'Welcome Session',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  messages: [
    {
      id: 'msg_welcome',
      role: 'assistant',
      content:
        'Welcome back, Aryamaan. I am your quiet conversational companion, connected to your Wisdom Vault and Journal. What is on your mind or what are you navigating today?',
      timestamp: new Date().toISOString()
    }
  ]
};

export const loadChatThreads = (): ChatThread[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CHAT_THREADS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
    return [INITIAL_THREAD];
  } catch {
    return [INITIAL_THREAD];
  }
};

export const saveChatThreads = (threads: ChatThread[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.CHAT_THREADS, JSON.stringify(threads));
  } catch (e) {
    console.error('Failed to save chat threads locally', e);
  }
};

export const loadActiveThreadId = (): string => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVE_THREAD_ID);
    return raw || 'thread_initial';
  } catch {
    return 'thread_initial';
  }
};

export const saveActiveThreadId = (threadId: string): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_THREAD_ID, threadId);
  } catch (e) {
    console.error('Failed to save active thread ID locally', e);
  }
};

// 4. COMPANION MESSAGES (Legacy fallback)
export const loadCompanionChat = (): CompanionMessage[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.COMPANION);
    return raw ? JSON.parse(raw) : INITIAL_THREAD.messages;
  } catch {
    return INITIAL_THREAD.messages;
  }
};

export const saveCompanionChat = (messages: CompanionMessage[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.COMPANION, JSON.stringify(messages));
  } catch (e) {
    console.error('Failed to save companion messages locally', e);
  }
};

// 5. SETTINGS
export const loadSettings = (): AppSettings => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
};

export const saveSettings = (settings: AppSettings): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings locally', e);
  }
};

// BACKUP & RESTORE
export interface FullSanctuaryBackup {
  version: number;
  exportedAt: string;
  quotes: Quote[];
  diary: DiaryEntry[];
  companionChat: CompanionMessage[];
  chatThreads?: ChatThread[];
  settings: AppSettings;
}

export const exportSanctuaryData = (): string => {
  const backup: FullSanctuaryBackup = {
    version: 2,
    exportedAt: new Date().toISOString(),
    quotes: loadQuotes(),
    diary: loadDiary(),
    companionChat: loadCompanionChat(),
    chatThreads: loadChatThreads(),
    settings: loadSettings()
  };
  return JSON.stringify(backup, null, 2);
};

export const importSanctuaryData = (
  jsonStr: string
): { success: boolean; quotesCount: number; diaryCount: number; error?: string } => {
  try {
    const parsed = JSON.parse(jsonStr);
    if (!parsed) throw new Error('Invalid JSON format');

    const quotes = Array.isArray(parsed.quotes) ? parsed.quotes : [];
    const diary = Array.isArray(parsed.diary) ? parsed.diary : [];
    const companionChat = Array.isArray(parsed.companionChat) ? parsed.companionChat : [];
    const chatThreads = Array.isArray(parsed.chatThreads) ? parsed.chatThreads : [];

    saveQuotes(quotes);
    saveDiary(diary);
    saveCompanionChat(companionChat);
    if (chatThreads.length > 0) saveChatThreads(chatThreads);

    if (parsed.settings) {
      saveSettings({ ...DEFAULT_SETTINGS, ...parsed.settings });
    }

    return {
      success: true,
      quotesCount: quotes.length,
      diaryCount: diary.length
    };
  } catch (err: any) {
    return { success: false, quotesCount: 0, diaryCount: 0, error: err.message };
  }
};
