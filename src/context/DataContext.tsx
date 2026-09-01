import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Quote,
  DiaryEntry,
  CompanionMessage,
  ChatThread,
  AppSettings,
  ActiveTab
} from '../types';
import {
  loadQuotes,
  saveQuotes,
  loadDiary,
  saveDiary,
  loadChatThreads,
  saveChatThreads,
  loadActiveThreadId,
  saveActiveThreadId,
  loadSettings,
  saveSettings
} from '../services/storage';
import { askCompanion } from '../services/companionService';

interface DataContextType {
  quotes: Quote[];
  diary: DiaryEntry[];
  companionChat: CompanionMessage[];
  chatThreads: ChatThread[];
  activeThreadId: string;
  settings: AppSettings;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isCompanionDrawerOpen: boolean;
  setIsCompanionDrawerOpen: (open: boolean) => void;
  isBreathModalOpen: boolean;
  setIsBreathModalOpen: (open: boolean) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
  isWhatsAppSimOpen: boolean;
  setIsWhatsAppSimOpen: (open: boolean) => void;
  contemplatingQuote: Quote | null;
  setContemplatingQuote: (quote: Quote | null) => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
  isCompanionTyping: boolean;

  // Quotes Actions
  addQuote: (data: Omit<Quote, 'id' | 'createdAt' | 'updatedAt'>) => Quote;
  updateQuote: (id: string, updates: Partial<Quote>) => void;
  deleteQuote: (id: string) => void;
  togglePinQuote: (id: string) => void;

  // 3-Section Diary Actions
  addDiaryEntry: (data: Omit<DiaryEntry, 'id' | 'createdAt' | 'updatedAt'>) => DiaryEntry;
  updateDiaryEntry: (id: string, updates: Partial<DiaryEntry>) => void;
  deleteDiaryEntry: (id: string) => void;

  // Companion Chat Thread Actions
  createNewThread: () => void;
  switchThread: (threadId: string) => void;
  deleteThread: (threadId: string) => void;
  renameThread: (threadId: string, newTitle: string) => void;
  sendCompanionMessage: (text: string) => Promise<void>;
  saveToDiaryFromCompanion: (msg: CompanionMessage) => void;
  saveToQuoteFromCompanion: (msg: CompanionMessage) => void;
  clearCompanionChat: () => void;

  // Settings & Refresh
  updateSettings: (updates: Partial<AppSettings>) => void;
  refreshData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [quotes, setQuotes] = useState<Quote[]>(() => loadQuotes());
  const [diary, setDiary] = useState<DiaryEntry[]>(() => loadDiary());
  const [chatThreads, setChatThreads] = useState<ChatThread[]>(() => loadChatThreads());
  const [activeThreadId, setActiveThreadIdState] = useState<string>(() => loadActiveThreadId());
  const [settings, setSettingsState] = useState<AppSettings>(() => loadSettings());

  const [activeTab, setActiveTab] = useState<ActiveTab>('sanctuary');
  const [isCompanionDrawerOpen, setIsCompanionDrawerOpen] = useState<boolean>(false);
  const [isBreathModalOpen, setIsBreathModalOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isWhatsAppSimOpen, setIsWhatsAppSimOpen] = useState<boolean>(false);
  const [contemplatingQuote, setContemplatingQuote] = useState<Quote | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isCompanionTyping, setIsCompanionTyping] = useState<boolean>(false);

  // Active Companion Chat Messages computed from active Thread
  const activeThread = chatThreads.find((t) => t.id === activeThreadId) || chatThreads[0];
  const companionChat = activeThread ? activeThread.messages : [];

  // Auto toast clear
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 3200);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
  }, []);

  const refreshData = useCallback(async () => {
    const localQuotes = loadQuotes();
    const localDiary = loadDiary();
    setChatThreads(loadChatThreads());
    setActiveThreadIdState(loadActiveThreadId());
    setSettingsState(loadSettings());

    // Sync from local backend server if reachable
    try {
      const res = await fetch('http://localhost:3001/api/entries');
      if (res.ok) {
        const data = await res.json();
        if (data.entries && Array.isArray(data.entries)) {
          const existingQuoteIds = new Set(localQuotes.map((q) => q.id));
          const existingDiaryIds = new Set(localDiary.map((d) => d.id));

          const newQuotes: Quote[] = [];
          const newDiary: DiaryEntry[] = [];

          for (const item of data.entries) {
            if (item.type === 'quote' && !existingQuoteIds.has(item.id)) {
              newQuotes.push({
                id: item.id,
                text: item.content || item.text || '',
                author: item.author || 'Internal Wisdom',
                source: item.source === 'whatsapp' ? 'WhatsApp' : 'ChatGPT',
                tags: item.tags || ['Wisdom'],
                notes: item.notes,
                isPinned: item.is_pinned || false,
                createdAt: item.created_at,
                updatedAt: item.updated_at
              });
            } else if (item.type === 'diary' && !existingDiaryIds.has(item.id)) {
              newDiary.push({
                id: item.id,
                title: item.title,
                date: item.created_at.slice(0, 10),
                rawContent: item.content || '',
                refinedContent: item.notes,
                tags: item.tags || ['Journal'],
                source: item.source === 'whatsapp' ? 'whatsapp' : 'chatgpt',
                createdAt: item.created_at,
                updatedAt: item.updated_at
              });
            }
          }

          if (newQuotes.length > 0) {
            const merged = [...newQuotes, ...localQuotes];
            setQuotes(merged);
            saveQuotes(merged);
          }
          if (newDiary.length > 0) {
            const merged = [...newDiary, ...localDiary];
            setDiary(merged);
            saveDiary(merged);
          }
          return;
        }
      }
    } catch {
      // Backend offline, keep local state
    }

    setQuotes(localQuotes);
    setDiary(localDiary);
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Global Keyboard Shortcuts (Escape to close modals)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsCompanionDrawerOpen(false);
        setIsBreathModalOpen(false);
        setIsSettingsOpen(false);
        setIsWhatsAppSimOpen(false);
        setContemplatingQuote(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // --- QUOTES ACTIONS ---
  const addQuote = useCallback(
    (data: Omit<Quote, 'id' | 'createdAt' | 'updatedAt'>): Quote => {
      const now = new Date().toISOString();
      const newQuote: Quote = {
        ...data,
        id: 'quote_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        createdAt: now,
        updatedAt: now
      };
      const updated = [newQuote, ...quotes];
      setQuotes(updated);
      saveQuotes(updated);
      showToast('Quote saved to your vault');

      fetch('http://localhost:3001/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'quote',
          content: newQuote.text,
          author: newQuote.author,
          source: newQuote.source || 'dashboard',
          tags: newQuote.tags,
          notes: newQuote.notes,
          is_pinned: newQuote.isPinned
        })
      }).catch(() => {});

      return newQuote;
    },
    [quotes, showToast]
  );

  const updateQuote = useCallback(
    (id: string, updates: Partial<Quote>) => {
      const updated = quotes.map((q) =>
        q.id === id ? { ...q, ...updates, updatedAt: new Date().toISOString() } : q
      );
      setQuotes(updated);
      saveQuotes(updated);
      showToast('Quote updated');
    },
    [quotes, showToast]
  );

  const deleteQuote = useCallback(
    (id: string) => {
      const updated = quotes.filter((q) => q.id !== id);
      setQuotes(updated);
      saveQuotes(updated);
      showToast('Quote removed');
    },
    [quotes, showToast]
  );

  const togglePinQuote = useCallback(
    (id: string) => {
      const updated = quotes.map((q) =>
        q.id === id ? { ...q, isPinned: !q.isPinned, updatedAt: new Date().toISOString() } : q
      );
      setQuotes(updated);
      saveQuotes(updated);
      const target = updated.find((q) => q.id === id);
      if (target) {
        showToast(target.isPinned ? 'Pinned to Daily Anchor' : 'Unpinned from Anchor');
      }
    },
    [quotes, showToast]
  );

  // --- DIARY ACTIONS ---
  const addDiaryEntry = useCallback(
    (data: Omit<DiaryEntry, 'id' | 'createdAt' | 'updatedAt'>): DiaryEntry => {
      const now = new Date().toISOString();
      const newEntry: DiaryEntry = {
        ...data,
        id: 'diary_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        createdAt: now,
        updatedAt: now
      };
      const updated = [newEntry, ...diary];
      setDiary(updated);
      saveDiary(updated);
      showToast('Journal page saved');

      fetch('http://localhost:3001/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'diary',
          title: newEntry.title,
          content: newEntry.rawContent,
          notes: newEntry.refinedContent,
          source: newEntry.source,
          tags: newEntry.tags
        })
      }).catch(() => {});

      return newEntry;
    },
    [diary, showToast]
  );

  const updateDiaryEntry = useCallback(
    (id: string, updates: Partial<DiaryEntry>) => {
      const updated = diary.map((d) =>
        d.id === id ? { ...d, ...updates, updatedAt: new Date().toISOString() } : d
      );
      setDiary(updated);
      saveDiary(updated);
      showToast('Journal updated');
    },
    [diary, showToast]
  );

  const deleteDiaryEntry = useCallback(
    (id: string) => {
      const updated = diary.filter((d) => d.id !== id);
      setDiary(updated);
      saveDiary(updated);
      showToast('Entry removed');
    },
    [diary, showToast]
  );

  // --- CHAT THREAD & COMPANION ACTIONS (ChatGPT Style) ---
  const createNewThread = useCallback(() => {
    const newId = 'thread_' + Date.now();
    const now = new Date().toISOString();
    const newThread: ChatThread = {
      id: newId,
      title: 'New Session',
      createdAt: now,
      updatedAt: now,
      messages: [
        {
          id: 'msg_' + Date.now(),
          role: 'assistant',
          content:
            'Hello Aryamaan. How can I help ground your mind, explore a thought, or reflect on your wisdom today?',
          timestamp: now
        }
      ]
    };
    const updated = [newThread, ...chatThreads];
    setChatThreads(updated);
    saveChatThreads(updated);
    setActiveThreadIdState(newId);
    saveActiveThreadId(newId);
    showToast('New chat session started');
  }, [chatThreads, showToast]);

  const switchThread = useCallback((threadId: string) => {
    setActiveThreadIdState(threadId);
    saveActiveThreadId(threadId);
  }, []);

  const deleteThread = useCallback(
    (threadId: string) => {
      if (chatThreads.length <= 1) {
        showToast('Cannot delete sole remaining thread');
        return;
      }
      const updated = chatThreads.filter((t) => t.id !== threadId);
      setChatThreads(updated);
      saveChatThreads(updated);

      if (activeThreadId === threadId) {
        const nextId = updated[0].id;
        setActiveThreadIdState(nextId);
        saveActiveThreadId(nextId);
      }
      showToast('Chat thread deleted');
    },
    [chatThreads, activeThreadId, showToast]
  );

  const renameThread = useCallback(
    (threadId: string, newTitle: string) => {
      const updated = chatThreads.map((t) =>
        t.id === threadId ? { ...t, title: newTitle, updatedAt: new Date().toISOString() } : t
      );
      setChatThreads(updated);
      saveChatThreads(updated);
    },
    [chatThreads]
  );

  const sendCompanionMessage = useCallback(
    async (text: string) => {
      const now = new Date().toISOString();
      const userMsg: CompanionMessage = {
        id: 'msg_' + Date.now(),
        role: 'user',
        content: text,
        timestamp: now
      };

      const currentMessages = companionChat;
      const updatedMessages = [...currentMessages, userMsg];

      // Auto-title thread on first user message
      let currentTitle = activeThread?.title || 'New Session';
      if (currentMessages.length <= 1 && text.length > 0) {
        currentTitle = text.slice(0, 28) + (text.length > 28 ? '...' : '');
      }

      const updatedThreads = chatThreads.map((t) =>
        t.id === activeThreadId
          ? {
              ...t,
              title: currentTitle,
              messages: updatedMessages,
              updatedAt: now
            }
          : t
      );

      setChatThreads(updatedThreads);
      saveChatThreads(updatedThreads);
      setIsCompanionTyping(true);

      try {
        const result = await askCompanion(
          text,
          updatedMessages,
          quotes,
          diary,
          settings.aiConfig,
          settings.geminiApiKey
        );

        const botMsg: CompanionMessage = {
          id: 'msg_' + (Date.now() + 1),
          role: 'assistant',
          content: result.message,
          matchedQuoteIds: result.matchedQuotes.map((q) => q.id),
          suggestedDiaryEntry: result.suggestedDiaryEntry,
          suggestedQuote: result.suggestedQuote,
          timestamp: new Date().toISOString()
        };

        const finalMessages = [...updatedMessages, botMsg];
        const finalThreads = updatedThreads.map((t) =>
          t.id === activeThreadId
            ? { ...t, messages: finalMessages, updatedAt: new Date().toISOString() }
            : t
        );

        setChatThreads(finalThreads);
        saveChatThreads(finalThreads);
      } finally {
        setIsCompanionTyping(false);
      }
    },
    [activeThread, activeThreadId, companionChat, chatThreads, quotes, diary, settings.aiConfig, settings.geminiApiKey]
  );

  const saveToDiaryFromCompanion = useCallback(
    (msg: CompanionMessage) => {
      if (!msg.suggestedDiaryEntry) return;
      addDiaryEntry({
        title: 'Companion Insight',
        date: new Date().toISOString().slice(0, 10),
        rawContent: msg.suggestedDiaryEntry.raw,
        refinedContent: msg.suggestedDiaryEntry.refined,
        learnings: msg.suggestedDiaryEntry.learnings,
        tags: msg.suggestedDiaryEntry.tags,
        source: 'companion'
      });
    },
    [addDiaryEntry]
  );

  const saveToQuoteFromCompanion = useCallback(
    (msg: CompanionMessage) => {
      if (!msg.suggestedQuote) return;
      addQuote({
        text: msg.suggestedQuote.text,
        author: msg.suggestedQuote.author,
        notes: msg.suggestedQuote.notes,
        tags: msg.suggestedQuote.tags,
        isPinned: false,
        source: 'Companion Chat'
      });
    },
    [addQuote]
  );

  const clearCompanionChat = useCallback(() => {
    const defaultMessages: CompanionMessage[] = [
      {
        id: 'msg_welcome_' + Date.now(),
        role: 'assistant',
        content:
          'Welcome back, Aryamaan. What is on your mind or what are you navigating right now?',
        timestamp: new Date().toISOString()
      }
    ];

    const updatedThreads = chatThreads.map((t) =>
      t.id === activeThreadId
        ? { ...t, messages: defaultMessages, updatedAt: new Date().toISOString() }
        : t
    );

    setChatThreads(updatedThreads);
    saveChatThreads(updatedThreads);
    showToast('Chat history reset');
  }, [activeThreadId, chatThreads, showToast]);

  const updateSettings = useCallback(
    (updates: Partial<AppSettings>) => {
      const newSettings = { ...settings, ...updates };
      setSettingsState(newSettings);
      saveSettings(newSettings);
      showToast('Settings saved');
    },
    [settings, showToast]
  );

  return (
    <DataContext.Provider
      value={{
        quotes,
        diary,
        companionChat,
        chatThreads,
        activeThreadId,
        settings,
        activeTab,
        setActiveTab,
        isCompanionDrawerOpen,
        setIsCompanionDrawerOpen,
        isBreathModalOpen,
        setIsBreathModalOpen,
        isSettingsOpen,
        setIsSettingsOpen,
        isWhatsAppSimOpen,
        setIsWhatsAppSimOpen,
        contemplatingQuote,
        setContemplatingQuote,
        toastMessage,
        showToast,
        isCompanionTyping,
        addQuote,
        updateQuote,
        deleteQuote,
        togglePinQuote,
        addDiaryEntry,
        updateDiaryEntry,
        deleteDiaryEntry,
        createNewThread,
        switchThread,
        deleteThread,
        renameThread,
        sendCompanionMessage,
        saveToDiaryFromCompanion,
        saveToQuoteFromCompanion,
        clearCompanionChat,
        updateSettings,
        refreshData
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
