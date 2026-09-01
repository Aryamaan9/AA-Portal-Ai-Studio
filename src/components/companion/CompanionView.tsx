import React, { useState, useRef, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { ChatNotebook } from '../../types';
import {
  Plus,
  Search,
  Folder,
  FolderPlus,
  Trash2,
  Copy,
  Check,
  Send,
  Sparkles,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Brain,
  BookMarked,
  BookOpen,
  MoreHorizontal,
  Edit2,
  FolderInput
} from 'lucide-react';

const DEFAULT_NOTEBOOKS: ChatNotebook[] = [
  { id: 'nb_stoic', name: 'Stoic Reflections', createdAt: new Date().toISOString() },
  { id: 'nb_strategy', name: 'Life Strategy & Ideas', createdAt: new Date().toISOString() },
  { id: 'nb_general', name: 'General Sessions', createdAt: new Date().toISOString() }
];

export const CompanionView: React.FC = () => {
  const {
    companionChat,
    chatThreads,
    activeThreadId,
    createNewThread,
    switchThread,
    deleteThread,
    renameThread,
    sendCompanionMessage,
    isCompanionTyping,
    quotes,
    diary,
    saveToDiaryFromCompanion,
    saveToQuoteFromCompanion,
    clearCompanionChat,
    showToast
  } = useData();

  // Chat Notebooks / Projects State
  const [notebooks, setNotebooks] = useState<ChatNotebook[]>(() => {
    const saved = localStorage.getItem('sanctuary_chat_notebooks');
    if (saved) {
      try { return JSON.parse(saved); } catch { return DEFAULT_NOTEBOOKS; }
    }
    return DEFAULT_NOTEBOOKS;
  });

  const [activeNotebookId, setActiveNotebookId] = useState<string | null>(null);
  const [threadNotebookMap, setThreadNotebookMap] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('sanctuary_thread_notebook_map');
    if (saved) {
      try { return JSON.parse(saved); } catch { return {}; }
    }
    return {};
  });

  const [isCreatingNotebook, setIsCreatingNotebook] = useState(false);
  const [newNotebookName, setNewNotebookName] = useState('');

  // Dropdown Menu States
  const [openThreadMenuId, setOpenThreadMenuId] = useState<string | null>(null);
  const [openProjectMenuId, setOpenProjectMenuId] = useState<string | null>(null);

  // Moving Thread Modal
  const [movingThreadId, setMovingThreadId] = useState<string | null>(null);

  // Renaming Thread & Project States
  const [editingThreadId, setEditingThreadId] = useState<string | null>(null);
  const [editThreadTitle, setEditThreadTitle] = useState('');

  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editProjectTitle, setEditProjectTitle] = useState('');

  const [input, setInput] = useState('');
  const [searchHistoryQuery, setSearchHistoryQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('sanctuary_chat_notebooks', JSON.stringify(notebooks));
  }, [notebooks]);

  useEffect(() => {
    localStorage.setItem('sanctuary_thread_notebook_map', JSON.stringify(threadNotebookMap));
  }, [threadNotebookMap]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [companionChat, isCompanionTyping]);

  // Global click to close popovers
  useEffect(() => {
    const handleGlobalClick = () => {
      setOpenThreadMenuId(null);
      setOpenProjectMenuId(null);
      setMovingThreadId(null);
    };
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isCompanionTyping) return;
    const textToSend = input.trim();
    setInput('');
    await sendCompanionMessage(textToSend);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast('Copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Create Notebook Project
  const handleCreateNotebook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNotebookName.trim()) return;
    const newNb: ChatNotebook = {
      id: 'nb_' + Date.now(),
      name: newNotebookName.trim(),
      createdAt: new Date().toISOString()
    };
    setNotebooks((prev) => [...prev, newNb]);
    setNewNotebookName('');
    setIsCreatingNotebook(false);
    showToast(`Project "${newNb.name}" created`);
  };

  // Rename Notebook Project
  const handleSaveRenameProject = (nbId: string) => {
    if (editProjectTitle.trim()) {
      setNotebooks((prev) =>
        prev.map((nb) => (nb.id === nbId ? { ...nb, name: editProjectTitle.trim() } : nb))
      );
      showToast('Project renamed');
    }
    setEditingProjectId(null);
  };

  // Delete Notebook Project
  const handleDeleteNotebook = (nbId: string) => {
    if (notebooks.length <= 1) {
      showToast('Cannot delete sole remaining project');
      return;
    }
    setNotebooks((prev) => prev.filter((nb) => nb.id !== nbId));
    if (activeNotebookId === nbId) setActiveNotebookId(null);
    showToast('Project removed');
  };

  // Move Thread to Project
  const handleMoveThread = (threadId: string, targetNbId: string) => {
    setThreadNotebookMap((prev) => ({ ...prev, [threadId]: targetNbId }));
    setMovingThreadId(null);
    setOpenThreadMenuId(null);
    showToast('Moved session to project');
  };

  // Save Thread Rename
  const handleSaveRenameThread = (threadId: string) => {
    if (editThreadTitle.trim()) {
      renameThread(threadId, editThreadTitle.trim());
      showToast('Session renamed');
    }
    setEditingThreadId(null);
  };

  // Filtered threads by search & project
  const filteredThreads = chatThreads.filter((t) => {
    const matchesSearch =
      !searchHistoryQuery.trim() ||
      t.title.toLowerCase().includes(searchHistoryQuery.toLowerCase());
    const matchesProject =
      !activeNotebookId || (threadNotebookMap[t.id] || 'nb_general') === activeNotebookId;
    return matchesSearch && matchesProject;
  });

  return (
    <div className="chatgpt-clone-container">
      {/* 1. SIDEBAR (CHATGPT & CLAUDE PROJECTS WITH ... MENUS) */}
      <aside className={`chatgpt-clone-sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        {/* Top Header */}
        <div className="sidebar-clone-top-bar">
          <div className="sidebar-clone-brand" onClick={() => setIsSidebarOpen(true)}>
            <Sparkles size={16} color="var(--accent-gold)" />
            <span className="brand-chatgpt-text">Sanctuary AI</span>
          </div>

          <button
            type="button"
            className="sidebar-icon-btn"
            onClick={() => setIsSidebarOpen((prev) => !prev)}
            title={isSidebarOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
          >
            {isSidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
        </div>

        {isSidebarOpen && (
          <div className="sidebar-clone-body">
            {/* New Chat Primary Button */}
            <button
              type="button"
              className="btn-new-chat-primary"
              onClick={createNewThread}
            >
              <Plus size={16} />
              <span>New chat</span>
            </button>

            {/* Search Bar */}
            <div className="sidebar-search-wrapper">
              <Search size={13} className="sidebar-search-icon" />
              <input
                type="text"
                className="sidebar-search-field"
                placeholder="Search chats..."
                value={searchHistoryQuery}
                onChange={(e) => setSearchHistoryQuery(e.target.value)}
              />
            </div>

            {/* SECTION A: PROJECTS / NOTEBOOKS (WITH ... MENU) */}
            <div className="sidebar-section-group">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.25rem 0.5rem' }}>
                <span className="sidebar-section-title" style={{ padding: 0 }}>Projects</span>
                <button
                  type="button"
                  className="sidebar-icon-btn"
                  style={{ width: '22px', height: '22px' }}
                  onClick={() => setIsCreatingNotebook((prev) => !prev)}
                  title="Create new project"
                >
                  <FolderPlus size={13} color="var(--accent-gold)" />
                </button>
              </div>

              {/* Create Project Input */}
              {isCreatingNotebook && (
                <form onSubmit={handleCreateNotebook} style={{ display: 'flex', gap: '0.3rem', padding: '0.25rem 0.5rem' }}>
                  <input
                    type="text"
                    placeholder="Project name..."
                    value={newNotebookName}
                    onChange={(e) => setNewNotebookName(e.target.value)}
                    style={{ flex: 1, fontSize: '0.78rem', padding: '0.25rem 0.5rem', borderRadius: '4px', border: '1px solid var(--border-medium)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
                    autoFocus
                  />
                  <button type="submit" style={{ fontSize: '0.72rem', padding: '0.25rem 0.5rem', backgroundColor: 'var(--text-primary)', color: 'var(--bg-app)', borderRadius: '4px' }}>Add</button>
                </form>
              )}

              {/* Projects List */}
              {notebooks.map((nb) => (
                <div
                  key={nb.id}
                  className={`sidebar-chat-item ${activeNotebookId === nb.id ? 'active' : ''}`}
                  onClick={() => setActiveNotebookId(activeNotebookId === nb.id ? null : nb.id)}
                  style={{ position: 'relative' }}
                >
                  <Folder size={14} className="item-icon" color="var(--accent-gold)" />

                  {editingProjectId === nb.id ? (
                    <input
                      type="text"
                      value={editProjectTitle}
                      onChange={(e) => setEditProjectTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveRenameProject(nb.id);
                        if (e.key === 'Escape') setEditingProjectId(null);
                      }}
                      onBlur={() => handleSaveRenameProject(nb.id)}
                      style={{ fontSize: '0.8rem', width: '100%', border: '1px solid var(--accent-gold)', borderRadius: '3px', background: 'var(--bg-app)', color: 'var(--text-primary)', padding: '0.1rem 0.3rem' }}
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <span className="item-text">{nb.name}</span>
                  )}

                  {/* Project ... Menu Trigger */}
                  <button
                    type="button"
                    className="item-delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenProjectMenuId(openProjectMenuId === nb.id ? null : nb.id);
                      setOpenThreadMenuId(null);
                    }}
                    title="Project Options"
                  >
                    <MoreHorizontal size={13} />
                  </button>

                  {/* Project Options Dropdown */}
                  {openProjectMenuId === nb.id && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        position: 'absolute',
                        top: '100%',
                        right: 0,
                        zIndex: 120,
                        backgroundColor: 'var(--bg-card)',
                        border: '1px solid var(--border-medium)',
                        borderRadius: 'var(--radius-sm)',
                        boxShadow: 'var(--shadow-floating)',
                        padding: '0.35rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.2rem',
                        minWidth: '150px'
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          createNewThread();
                          setOpenProjectMenuId(null);
                        }}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', padding: '0.3rem 0.5rem', borderRadius: '4px', color: 'var(--text-primary)', background: 'transparent' }}
                      >
                        <Plus size={12} />
                        <span>New Chat Here</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setEditingProjectId(nb.id);
                          setEditProjectTitle(nb.name);
                          setOpenProjectMenuId(null);
                        }}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', padding: '0.3rem 0.5rem', borderRadius: '4px', color: 'var(--text-primary)', background: 'transparent' }}
                      >
                        <Edit2 size={12} />
                        <span>Rename Project</span>
                      </button>

                      {notebooks.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            handleDeleteNotebook(nb.id);
                            setOpenProjectMenuId(null);
                          }}
                          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', padding: '0.3rem 0.5rem', borderRadius: '4px', color: '#ef4444', background: 'transparent' }}
                        >
                          <Trash2 size={12} />
                          <span>Delete Project</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* SECTION B: RECENT CHATS (WITH ... MENU) */}
            <div className="sidebar-section-group" style={{ flex: 1, marginTop: '0.5rem' }}>
              <div className="sidebar-section-title">
                {activeNotebookId
                  ? `Chats in ${notebooks.find((n) => n.id === activeNotebookId)?.name || 'Project'}`
                  : 'Recent Chats'}
              </div>

              {filteredThreads.map((t) => (
                <div
                  key={t.id}
                  className={`sidebar-chat-item ${t.id === activeThreadId ? 'active' : ''}`}
                  onClick={() => switchThread(t.id)}
                  style={{ position: 'relative' }}
                >
                  <MessageSquare size={13} className="item-icon" />

                  {editingThreadId === t.id ? (
                    <input
                      type="text"
                      value={editThreadTitle}
                      onChange={(e) => setEditThreadTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveRenameThread(t.id);
                        if (e.key === 'Escape') setEditingThreadId(null);
                      }}
                      onBlur={() => handleSaveRenameThread(t.id)}
                      style={{ fontSize: '0.8rem', width: '100%', border: '1px solid var(--accent-gold)', borderRadius: '3px', background: 'var(--bg-app)', color: 'var(--text-primary)', padding: '0.1rem 0.3rem' }}
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <span className="item-text">{t.title}</span>
                  )}

                  {/* Thread ... Menu Trigger */}
                  <button
                    type="button"
                    className="item-delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenThreadMenuId(openThreadMenuId === t.id ? null : t.id);
                      setOpenProjectMenuId(null);
                      setMovingThreadId(null);
                    }}
                    title="Chat Options"
                  >
                    <MoreHorizontal size={13} />
                  </button>

                  {/* Chat Options Dropdown */}
                  {openThreadMenuId === t.id && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        position: 'absolute',
                        top: '100%',
                        right: 0,
                        zIndex: 120,
                        backgroundColor: 'var(--bg-card)',
                        border: '1px solid var(--border-medium)',
                        borderRadius: 'var(--radius-sm)',
                        boxShadow: 'var(--shadow-floating)',
                        padding: '0.35rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.2rem',
                        minWidth: '160px'
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setEditingThreadId(t.id);
                          setEditThreadTitle(t.title);
                          setOpenThreadMenuId(null);
                        }}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', padding: '0.3rem 0.5rem', borderRadius: '4px', color: 'var(--text-primary)', background: 'transparent' }}
                      >
                        <Edit2 size={12} />
                        <span>Rename Session</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setMovingThreadId(movingThreadId === t.id ? null : t.id);
                        }}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', padding: '0.3rem 0.5rem', borderRadius: '4px', color: 'var(--text-primary)', background: 'transparent' }}
                      >
                        <FolderInput size={12} />
                        <span>Move to Project</span>
                      </button>

                      {movingThreadId === t.id && (
                        <div style={{ paddingLeft: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.15rem', borderLeft: '2px solid var(--accent-gold)', margin: '0.2rem 0' }}>
                          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700 }}>SELECT PROJECT:</span>
                          {notebooks.map((nb) => (
                            <button
                              key={nb.id}
                              type="button"
                              onClick={() => handleMoveThread(t.id, nb.id)}
                              style={{ textAlign: 'left', fontSize: '0.74rem', padding: '0.2rem 0.4rem', borderRadius: '3px', color: 'var(--text-primary)', background: 'transparent' }}
                            >
                              📁 {nb.name}
                            </button>
                          ))}
                        </div>
                      )}

                      {chatThreads.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            deleteThread(t.id);
                            setOpenThreadMenuId(null);
                          }}
                          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', padding: '0.3rem 0.5rem', borderRadius: '4px', color: '#ef4444', background: 'transparent' }}
                        >
                          <Trash2 size={12} />
                          <span>Delete Session</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </aside>

      {/* 2. MAIN CHAT STAGE */}
      <div className="chatgpt-clone-main">
        {/* Header Bar */}
        <header className="chatgpt-clone-header">
          <div className="header-left-group">
            {!isSidebarOpen && (
              <button
                type="button"
                className="sidebar-icon-btn"
                onClick={() => setIsSidebarOpen(true)}
                style={{ marginRight: '0.5rem' }}
              >
                <ChevronRight size={16} />
              </button>
            )}
            <Brain size={16} color="var(--accent-gold)" />
            <span className="header-folder-title">Companion Memory Stream</span>
          </div>

          <div className="header-right-actions">
            <button
              type="button"
              className="header-action-btn"
              onClick={clearCompanionChat}
              title="Reset conversation"
            >
              <Trash2 size={13} />
              <span>Reset Chat</span>
            </button>
          </div>
        </header>

        {/* Message Stream */}
        <div className="chatgpt-clone-stream">
          {companionChat.map((msg) => (
            <div
              key={msg.id}
              className={`clone-message-wrapper ${msg.role === 'user' ? 'user-wrapper' : 'assistant-wrapper'}`}
            >
              {msg.role === 'user' ? (
                <div className="user-message-bubble">
                  {msg.content}
                </div>
              ) : (
                <div className="assistant-message-body">
                  <div className="assistant-text-content">
                    {msg.content}
                  </div>

                  {/* 1-Click Extractions */}
                  {(msg.suggestedDiaryEntry || msg.suggestedQuote) && (
                    <div className="clone-card-options-box">
                      <div className="card-options-header">
                        <span className="option-pill-badge">Distilled Insight</span>
                      </div>

                      {msg.suggestedDiaryEntry && (
                        <div className="option-card-body">
                          <p>"{msg.suggestedDiaryEntry.refined}"</p>
                          <button
                            type="button"
                            className="btn-extract-pill"
                            onClick={() => {
                              saveToDiaryFromCompanion(msg);
                              showToast('Saved to Notebook Journal ✨');
                            }}
                          >
                            <BookMarked size={12} />
                            <span>Save to Notebook Journal</span>
                          </button>
                        </div>
                      )}

                      {msg.suggestedQuote && (
                        <div className="option-card-body" style={{ marginTop: '0.5rem' }}>
                          <p>"{msg.suggestedQuote.text}" — {msg.suggestedQuote.author}</p>
                          <button
                            type="button"
                            className="btn-extract-pill"
                            onClick={() => {
                              saveToQuoteFromCompanion(msg);
                              showToast('Save to Vault Quote 📖');
                            }}
                          >
                            <BookOpen size={12} />
                            <span>Save to Vault Quote</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Copy Button */}
                  <div className="assistant-actions-bar">
                    <button
                      type="button"
                      className="assistant-action-btn"
                      onClick={() => handleCopy(msg.content, msg.id)}
                      title="Copy response"
                    >
                      {copiedId === msg.id ? <Check size={13} color="var(--accent-gold)" /> : <Copy size={13} />}
                      <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {isCompanionTyping && (
            <div className="clone-message-wrapper assistant-wrapper">
              <div className="assistant-text-content typing-placeholder" style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                Reflecting with your memory...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 3. FLOATING BOTTOM INPUT DOCK */}
        <div className="chatgpt-clone-input-area">
          <div className="disclaimer-text">
            Sanctuary AI &middot; Grounded in your {quotes.length} vault quotes & {diary.length} journal pages.
          </div>

          <form onSubmit={handleSend} className="chatgpt-clone-input-pill">
            <button
              type="button"
              className="pill-add-btn"
              onClick={() => {
                setInput('What wisdom from my vault can help me with clarity right now?');
              }}
              title="Insert prompt suggestion"
            >
              <Plus size={18} />
            </button>

            <input
              type="text"
              className="pill-input-field"
              placeholder="Message Companion... (Press Enter to send)"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isCompanionTyping}
            />

            <button
              type="submit"
              className="pill-submit-blue-btn"
              disabled={!input.trim() || isCompanionTyping}
              title="Send message"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
