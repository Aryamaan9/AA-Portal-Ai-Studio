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
  FolderInput,
  Menu as MenuIcon
} from 'lucide-react';
import {
  Drawer,
  Menu,
  ActionIcon,
  Button,
  TextInput,
  Textarea,
  Card,
  Text,
  Group,
  Stack
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';

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

  const isMobile = useMediaQuery('(max-width: 768px)');

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

  // Moving Thread Modal / Picker State
  const [movingThreadId, setMovingThreadId] = useState<string | null>(null);

  // Renaming Thread & Project States
  const [editingThreadId, setEditingThreadId] = useState<string | null>(null);
  const [editThreadTitle, setEditThreadTitle] = useState('');

  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editProjectTitle, setEditProjectTitle] = useState('');

  const [input, setInput] = useState('');
  const [searchHistoryQuery, setSearchHistoryQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const initKeyboard = async () => {
      try {
        const { Keyboard } = await import('@capacitor/keyboard');
        Keyboard.addListener('keyboardWillShow', (info) => {
          if (isMounted) setKeyboardHeight(info.keyboardHeight);
        });
        Keyboard.addListener('keyboardWillHide', () => {
          if (isMounted) setKeyboardHeight(0);
        });
      } catch (e) {
        // Not in capacitor environment or error
      }
    };
    initKeyboard();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('sanctuary_chat_notebooks', JSON.stringify(notebooks));
  }, [notebooks]);

  useEffect(() => {
    localStorage.setItem('sanctuary_thread_notebook_map', JSON.stringify(threadNotebookMap));
  }, [threadNotebookMap]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [companionChat, isCompanionTyping]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
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

  // Reusable Sidebar Content
  const renderSidebarContent = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
      {/* New Chat Primary Button */}
      <Button
        fullWidth
        leftSection={<Plus size={16} />}
        color="teal"
        radius="md"
        size="sm"
        onClick={() => {
          createNewThread();
          if (isMobile) setIsSidebarOpen(false);
        }}
        styles={{ root: { fontWeight: 600 } }}
      >
        New chat
      </Button>

      {/* Search Bar */}
      <TextInput
        placeholder="Search chats..."
        leftSection={<Search size={14} color="var(--text-muted)" />}
        value={searchHistoryQuery}
        onChange={(e) => setSearchHistoryQuery(e.target.value)}
        size="xs"
        radius="md"
        styles={{
          input: {
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-light)',
            color: 'var(--text-primary)'
          }
        }}
      />

      {/* SECTION A: PROJECTS / NOTEBOOKS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <Group justify="space-between" align="center" px={4} py={2}>
          <Text size="xs" fw={700} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.05em' }}>
            Projects
          </Text>
          <ActionIcon
            variant="subtle"
            size="sm"
            color="gray"
            onClick={() => setIsCreatingNotebook((prev) => !prev)}
            title="Create new project"
          >
            <FolderPlus size={14} color="var(--accent-gold)" />
          </ActionIcon>
        </Group>

        {/* Create Project Input Form */}
        {isCreatingNotebook && (
          <form onSubmit={handleCreateNotebook} style={{ display: 'flex', gap: '0.3rem', padding: '0.2rem 0' }}>
            <TextInput
              placeholder="Project name..."
              value={newNotebookName}
              onChange={(e) => setNewNotebookName(e.target.value)}
              size="xs"
              radius="sm"
              autoFocus
              style={{ flex: 1 }}
            />
            <Button type="submit" size="xs" color="teal">Add</Button>
          </form>
        )}

        {/* Projects List */}
        {notebooks.map((nb) => (
          <div
            key={nb.id}
            className={`sidebar-chat-item ${activeNotebookId === nb.id ? 'active' : ''}`}
            onClick={() => setActiveNotebookId(activeNotebookId === nb.id ? null : nb.id)}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.45rem 0.6rem' }}
          >
            <Group gap="xs" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
              <Folder size={14} color="var(--accent-gold)" style={{ flexShrink: 0 }} />
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
                  style={{
                    fontSize: '0.8rem',
                    width: '100%',
                    border: '1px solid var(--accent-gold)',
                    borderRadius: '3px',
                    background: 'var(--bg-app)',
                    color: 'var(--text-primary)',
                    padding: '0.1rem 0.3rem'
                  }}
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <Text size="xs" truncate fw={activeNotebookId === nb.id ? 600 : 400}>
                  {nb.name}
                </Text>
              )}
            </Group>

            {/* Project Options Menu */}
            <Menu shadow="md" width={170} position="bottom-end">
              <Menu.Target>
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  size="sm"
                  onClick={(e) => e.stopPropagation()}
                  title="Project options"
                >
                  <MoreHorizontal size={13} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown onClick={(e) => e.stopPropagation()}>
                <Menu.Item
                  leftSection={<Plus size={13} />}
                  onClick={() => {
                    setActiveNotebookId(nb.id);
                    createNewThread();
                    if (isMobile) setIsSidebarOpen(false);
                  }}
                >
                  New Chat Here
                </Menu.Item>
                <Menu.Item
                  leftSection={<Edit2 size={13} />}
                  onClick={() => {
                    setEditingProjectId(nb.id);
                    setEditProjectTitle(nb.name);
                  }}
                >
                  Rename Project
                </Menu.Item>
                {notebooks.length > 1 && (
                  <Menu.Item
                    color="red"
                    leftSection={<Trash2 size={13} />}
                    onClick={() => handleDeleteNotebook(nb.id)}
                  >
                    Delete Project
                  </Menu.Item>
                )}
              </Menu.Dropdown>
            </Menu>
          </div>
        ))}
      </div>

      {/* SECTION B: RECENT CHATS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1, overflowY: 'auto' }}>
        <Text size="xs" fw={700} c="dimmed" tt="uppercase" px={4} py={2} style={{ letterSpacing: '0.05em' }}>
          {activeNotebookId
            ? `Chats in ${notebooks.find((n) => n.id === activeNotebookId)?.name || 'Project'}`
            : 'Recent Chats'}
        </Text>

        {filteredThreads.map((t) => (
          <div
            key={t.id}
            className={`sidebar-chat-item ${t.id === activeThreadId ? 'active' : ''}`}
            onClick={() => {
              switchThread(t.id);
              if (isMobile) setIsSidebarOpen(false);
            }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.45rem 0.6rem' }}
          >
            <Group gap="xs" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
              <MessageSquare size={13} color="var(--text-muted)" style={{ flexShrink: 0 }} />
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
                  style={{
                    fontSize: '0.8rem',
                    width: '100%',
                    border: '1px solid var(--accent-gold)',
                    borderRadius: '3px',
                    background: 'var(--bg-app)',
                    color: 'var(--text-primary)',
                    padding: '0.1rem 0.3rem'
                  }}
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <Text size="xs" truncate fw={t.id === activeThreadId ? 600 : 400}>
                  {t.title}
                </Text>
              )}
            </Group>

            {/* Chat Options Menu */}
            <Menu shadow="md" width={170} position="bottom-end">
              <Menu.Target>
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  size="sm"
                  onClick={(e) => e.stopPropagation()}
                  title="Chat options"
                >
                  <MoreHorizontal size={13} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown onClick={(e) => e.stopPropagation()}>
                <Menu.Item
                  leftSection={<Edit2 size={13} />}
                  onClick={() => {
                    setEditingThreadId(t.id);
                    setEditThreadTitle(t.title);
                  }}
                >
                  Rename Session
                </Menu.Item>
                <Menu.Item
                  leftSection={<FolderInput size={13} />}
                  onClick={() => setMovingThreadId(t.id)}
                >
                  Move to Project
                </Menu.Item>
                {chatThreads.length > 1 && (
                  <Menu.Item
                    color="red"
                    leftSection={<Trash2 size={13} />}
                    onClick={() => deleteThread(t.id)}
                  >
                    Delete Session
                  </Menu.Item>
                )}
              </Menu.Dropdown>
            </Menu>
          </div>
        ))}

        {/* Move Thread Picker Modal if active */}
        {movingThreadId && (
          <Card withBorder p="xs" radius="sm" my="xs" style={{ backgroundColor: 'var(--bg-card)' }}>
            <Text size="xs" fw={700} c="dimmed" mb={4}>Move to Project:</Text>
            <Stack gap={2}>
              {notebooks.map((nb) => (
                <Button
                  key={nb.id}
                  variant="subtle"
                  size="xs"
                  color="teal"
                  justify="flex-start"
                  leftSection={<Folder size={12} />}
                  onClick={() => handleMoveThread(movingThreadId, nb.id)}
                >
                  {nb.name}
                </Button>
              ))}
              <Button
                variant="subtle"
                size="xs"
                color="gray"
                onClick={() => setMovingThreadId(null)}
              >
                Cancel
              </Button>
            </Stack>
          </Card>
        )}
      </div>
    </div>
  );

  return (
    <div className="chatgpt-clone-container">
      {/* 1. SIDEBAR: Mantine Drawer on Mobile, Smooth Collapsible Aside on Desktop */}
      {isMobile ? (
        <Drawer
          opened={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          title={
            <Group gap="xs">
              <Sparkles size={16} color="var(--accent-gold)" />
              <Text fw={700} size="sm">Sanctuary AI</Text>
            </Group>
          }
          padding="md"
          size={290}
          zIndex={2000}
          styles={{
            content: { backgroundColor: 'var(--bg-surface)' },
            header: { backgroundColor: 'var(--bg-surface)', borderBottom: '1px solid var(--border-light)' }
          }}
        >
          {renderSidebarContent()}
        </Drawer>
      ) : (
        <aside className={`chatgpt-clone-sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
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
              {renderSidebarContent()}
            </div>
          )}
        </aside>
      )}

      {/* 2. MAIN CHAT STAGE */}
      <div className="chatgpt-main-panel">
        {/* Header Bar */}
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.6rem 0.85rem',
            borderBottom: '1px solid var(--border-light)',
            backgroundColor: 'var(--bg-card)'
          }}
        >
          <Group gap="xs" align="center" style={{ minWidth: 0 }}>
            <ActionIcon
              variant="subtle"
              color="gray"
              size="md"
              onClick={() => setIsSidebarOpen(true)}
              title="Toggle Chats & Projects"
            >
              <MenuIcon size={18} />
            </ActionIcon>
            <Brain size={18} color="var(--accent-gold)" style={{ flexShrink: 0 }} />
            <Text fw={600} size="sm" truncate style={{ fontFamily: 'var(--font-serif)' }}>
              Companion Memory
            </Text>
          </Group>

          <Button
            variant="subtle"
            color="gray"
            size="xs"
            radius="sm"
            leftSection={<Trash2 size={13} />}
            onClick={clearCompanionChat}
            title="Reset conversation"
            style={{ flexShrink: 0 }}
          >
            Reset
          </Button>
        </header>

        {/* Message Stream */}
        <div className="chat-history-scroll">
          {companionChat.map((msg) => (
            <div
              key={msg.id}
              className={`chat-bubble-row ${msg.role === 'user' ? 'user' : 'assistant'}`}
            >
              {msg.role === 'user' ? (
                <div className="chat-bubble-user">
                  {msg.content}
                </div>
              ) : (
                <div className="chat-bubble-assistant">
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
            <div className="chat-bubble-row assistant">
              <div className="assistant-text-content typing-placeholder" style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                Reflecting with your memory...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 3. FLOATING BOTTOM INPUT DOCK */}
        <div 
          className="chatgpt-input-dock"
          style={keyboardHeight > 0 ? { bottom: `${keyboardHeight}px` } : {}}
        >
          <div className="disclaimer-text">
            Sanctuary AI &middot; Grounded in your {quotes.length} vault quotes & {diary.length} journal pages.
          </div>

          <form onSubmit={handleSend}>
            <Card
              withBorder
              radius="xl"
              p={6}
              shadow="xs"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--border-medium)',
                maxWidth: '820px',
                margin: '0 auto',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <ActionIcon
                type="button"
                variant="subtle"
                color="gray"
                size="md"
                radius="xl"
                onClick={() => {
                  setInput('What wisdom from my vault can help me with clarity right now?');
                }}
                title="Insert prompt suggestion"
                style={{ flexShrink: 0 }}
              >
                <Plus size={18} />
              </ActionIcon>

              <Textarea
                placeholder="Message Companion..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                disabled={isCompanionTyping}
                autosize
                minRows={1}
                maxRows={5}
                size="sm"
                variant="unstyled"
                style={{ flex: 1 }}
                styles={{
                  input: {
                    fontSize: '0.92rem',
                    lineHeight: 1.4,
                    padding: '4px 6px',
                    color: 'var(--text-primary)'
                  }
                }}
              />

              <ActionIcon
                type="submit"
                color="teal"
                size="md"
                radius="xl"
                disabled={!input.trim() || isCompanionTyping}
                title="Send message"
                style={{ flexShrink: 0 }}
              >
                <Send size={14} />
              </ActionIcon>
            </Card>
          </form>
        </div>
      </div>
    </div>
  );
};
