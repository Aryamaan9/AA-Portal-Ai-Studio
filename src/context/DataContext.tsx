import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { collection, doc, onSnapshot, setDoc, deleteDoc, updateDoc, query, orderBy } from 'firebase/firestore';
import { db as firestoreDb } from '../firebase';
import {
  Quote,
  DiaryEntry,
  CompanionMessage,
  ChatThread,
  AppSettings,
  ActiveTab
} from '../types';
import { askCompanion } from '../services/companionService';
import { loadSettings, saveSettings } from '../services/storage';

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

  addQuote: (data: Omit<Quote, 'id' | 'createdAt' | 'updatedAt'>) => Quote;
  updateQuote: (id: string, updates: Partial<Quote>) => void;
  deleteQuote: (id: string) => void;
  togglePinQuote: (id: string) => void;

  addDiaryEntry: (data: Omit<DiaryEntry, 'id' | 'createdAt' | 'updatedAt'>) => DiaryEntry;
  updateDiaryEntry: (id: string, updates: Partial<DiaryEntry>) => void;
  deleteDiaryEntry: (id: string) => void;

  createNewThread: () => void;
  switchThread: (threadId: string) => void;
  deleteThread: (threadId: string) => void;
  renameThread: (threadId: string, newTitle: string) => void;
  sendCompanionMessage: (text: string) => Promise<void>;
  saveToDiaryFromCompanion: (msg: CompanionMessage) => void;
  saveToQuoteFromCompanion: (msg: CompanionMessage) => void;
  clearCompanionChat: () => void;

  updateSettings: (updates: Partial<AppSettings>) => void;
  refreshData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [diary, setDiary] = useState<DiaryEntry[]>([]);
  const [chatThreads, setChatThreads] = useState<ChatThread[]>([]);
  const [activeThreadId, setActiveThreadIdState] = useState<string>('thread_initial');
  const [settings, setSettingsState] = useState<AppSettings>(() => loadSettings());

  const [activeTab, setActiveTab] = useState<ActiveTab>('sanctuary');
  const [isCompanionDrawerOpen, setIsCompanionDrawerOpen] = useState<boolean>(false);
  const [isBreathModalOpen, setIsBreathModalOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isWhatsAppSimOpen, setIsWhatsAppSimOpen] = useState<boolean>(false);
  const [contemplatingQuote, setContemplatingQuote] = useState<Quote | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isCompanionTyping, setIsCompanionTyping] = useState<boolean>(false);

  const activeThread = chatThreads.find((t) => t.id === activeThreadId) || chatThreads[0];
  const companionChat = activeThread ? activeThread.messages : [];

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3200);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
  }, []);

  useEffect(() => {
    // Listen to Quotes
    const qQuotes = query(collection(firestoreDb, 'quotes'), orderBy('createdAt', 'desc'));
    const unsubQuotes = onSnapshot(qQuotes, (snap) => {
      const qs = snap.docs.map(doc => doc.data() as Quote);
      setQuotes(qs);
    });

    // Listen to Diary
    const qDiary = query(collection(firestoreDb, 'diary'), orderBy('createdAt', 'desc'));
    const unsubDiary = onSnapshot(qDiary, (snap) => {
      const ds = snap.docs.map(doc => doc.data() as DiaryEntry);
      setDiary(ds);
    });
    
    // Listen to ChatThreads
    const qThreads = query(collection(firestoreDb, 'chatThreads'), orderBy('createdAt', 'desc'));
    const unsubThreads = onSnapshot(qThreads, (snap) => {
      const ts = snap.docs.map(doc => doc.data() as ChatThread);
      if (ts.length === 0) {
        // Initialize default
        const initialThread: ChatThread = {
          id: 'thread_initial',
          title: 'Welcome Session',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          messages: [{
            id: 'msg_welcome',
            role: 'assistant',
            content: 'Welcome back, Aryamaan. I am your quiet conversational companion. What is on your mind today?',
            timestamp: new Date().toISOString()
          }]
        };
        setDoc(doc(firestoreDb, 'chatThreads', initialThread.id), initialThread);
        setChatThreads([initialThread]);
      } else {
        setChatThreads(ts);
      }
    });

    return () => {
      unsubQuotes();
      unsubDiary();
      unsubThreads();
    };
  }, []);

  const refreshData = useCallback(() => {}, []);

  const addQuote = useCallback(
    (data: Omit<Quote, 'id' | 'createdAt' | 'updatedAt'>): Quote => {
      const now = new Date().toISOString();
      const newQuote: Quote = {
        ...data,
        id: 'quote_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        createdAt: now,
        updatedAt: now
      };
      setDoc(doc(firestoreDb, 'quotes', newQuote.id), newQuote);
      showToast('Quote saved to your vault');
      return newQuote;
    },
    [showToast]
  );

  const updateQuote = useCallback(
    (id: string, updates: Partial<Quote>) => {
      updateDoc(doc(firestoreDb, 'quotes', id), { ...updates, updatedAt: new Date().toISOString() });
      showToast('Quote updated');
    },
    [showToast]
  );

  const deleteQuote = useCallback(
    (id: string) => {
      deleteDoc(doc(firestoreDb, 'quotes', id));
      showToast('Quote removed');
    },
    [showToast]
  );

  const togglePinQuote = useCallback(
    (id: string) => {
      const target = quotes.find(q => q.id === id);
      if (target) {
        updateDoc(doc(firestoreDb, 'quotes', id), { isPinned: !target.isPinned, updatedAt: new Date().toISOString() });
        showToast(!target.isPinned ? 'Pinned to Daily Anchor' : 'Unpinned from Anchor');
      }
    },
    [quotes, showToast]
  );

  const addDiaryEntry = useCallback(
    (data: Omit<DiaryEntry, 'id' | 'createdAt' | 'updatedAt'>): DiaryEntry => {
      const now = new Date().toISOString();
      const newEntry: DiaryEntry = {
        ...data,
        id: 'diary_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        createdAt: now,
        updatedAt: now
      };
      setDoc(doc(firestoreDb, 'diary', newEntry.id), newEntry);
      showToast('Journal page saved');
      return newEntry;
    },
    [showToast]
  );

  const updateDiaryEntry = useCallback(
    (id: string, updates: Partial<DiaryEntry>) => {
      updateDoc(doc(firestoreDb, 'diary', id), { ...updates, updatedAt: new Date().toISOString() });
      showToast('Journal updated');
    },
    [showToast]
  );

  const deleteDiaryEntry = useCallback(
    (id: string) => {
      deleteDoc(doc(firestoreDb, 'diary', id));
      showToast('Entry removed');
    },
    [showToast]
  );

  const createNewThread = useCallback(() => {
    const newId = 'thread_' + Date.now();
    const now = new Date().toISOString();
    const newThread: ChatThread = {
      id: newId,
      title: 'New Session',
      createdAt: now,
      updatedAt: now,
      messages: [{
        id: 'msg_' + Date.now(),
        role: 'assistant',
        content: 'Hello Aryamaan. How can I help ground your mind, explore a thought, or reflect on your wisdom today?',
        timestamp: now
      }]
    };
    setDoc(doc(firestoreDb, 'chatThreads', newThread.id), newThread);
    setActiveThreadIdState(newId);
    showToast('New chat session started');
  }, [showToast]);

  const switchThread = useCallback((threadId: string) => {
    setActiveThreadIdState(threadId);
  }, []);

  const deleteThread = useCallback(
    (threadId: string) => {
      if (chatThreads.length <= 1) {
        showToast('Cannot delete sole remaining thread');
        return;
      }
      deleteDoc(doc(firestoreDb, 'chatThreads', threadId));
      if (activeThreadId === threadId) {
        const remaining = chatThreads.filter(t => t.id !== threadId);
        if (remaining.length > 0) setActiveThreadIdState(remaining[0].id);
      }
      showToast('Chat thread deleted');
    },
    [chatThreads, activeThreadId, showToast]
  );

  const renameThread = useCallback(
    (threadId: string, newTitle: string) => {
      updateDoc(doc(firestoreDb, 'chatThreads', threadId), { title: newTitle, updatedAt: new Date().toISOString() });
    },
    []
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

      const updatedMessages = [...companionChat, userMsg];
      let currentTitle = activeThread?.title || 'New Session';
      if (companionChat.length <= 1 && text.length > 0) {
        currentTitle = text.slice(0, 28) + (text.length > 28 ? '...' : '');
      }

      updateDoc(doc(firestoreDb, 'chatThreads', activeThreadId), {
        title: currentTitle,
        messages: updatedMessages,
        updatedAt: now
      });
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
        updateDoc(doc(firestoreDb, 'chatThreads', activeThreadId), {
          messages: finalMessages,
          updatedAt: new Date().toISOString()
        });
      } finally {
        setIsCompanionTyping(false);
      }
    },
    [activeThread, activeThreadId, companionChat, quotes, diary, settings.aiConfig, settings.geminiApiKey]
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
    const defaultMessages: CompanionMessage[] = [{
      id: 'msg_welcome_' + Date.now(),
      role: 'assistant',
      content: 'Welcome back, Aryamaan. What is on your mind or what are you navigating right now?',
      timestamp: new Date().toISOString()
    }];
    updateDoc(doc(firestoreDb, 'chatThreads', activeThreadId), {
      messages: defaultMessages,
      updatedAt: new Date().toISOString()
    });
    showToast('Chat history reset');
  }, [activeThreadId, showToast]);

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
        quotes, diary, companionChat, chatThreads, activeThreadId, settings,
        activeTab, setActiveTab, isCompanionDrawerOpen, setIsCompanionDrawerOpen,
        isBreathModalOpen, setIsBreathModalOpen, isSettingsOpen, setIsSettingsOpen,
        isWhatsAppSimOpen, setIsWhatsAppSimOpen, contemplatingQuote, setContemplatingQuote,
        toastMessage, showToast, isCompanionTyping,
        addQuote, updateQuote, deleteQuote, togglePinQuote,
        addDiaryEntry, updateDiaryEntry, deleteDiaryEntry,
        createNewThread, switchThread, deleteThread, renameThread,
        sendCompanionMessage, saveToDiaryFromCompanion, saveToQuoteFromCompanion,
        clearCompanionChat, updateSettings, refreshData
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
