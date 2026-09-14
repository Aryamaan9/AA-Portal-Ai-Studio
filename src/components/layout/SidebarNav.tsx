import React from 'react';
import { useData } from '../../context/DataContext';
import { useTheme } from '../../context/ThemeContext';
import {
  Sparkles,
  Compass,
  BookMarked,
  BookOpen,
  MessageSquare,
  Wind,
  Settings,
  Sun,
  Moon,
  Palette
} from 'lucide-react';

export const SidebarNav: React.FC<{ onOpenSwitcher?: () => void }> = ({ onOpenSwitcher }) => {
  const {
    activeTab,
    setActiveTab,
    setIsBreathModalOpen,
    setIsSettingsOpen,
    setIsWhatsAppSimOpen,
    quotes,
    diary
  } = useData();

  const { theme, toggleTheme } = useTheme();

  return (
    <aside className="sanctuary-sidebar-rail">
      {/* Top Brand */}
      <div>
        <div className="sidebar-brand-block" onClick={() => setActiveTab('sanctuary')}>
          <div className="brand-icon-box">
            <Sparkles size={18} color="var(--accent-gold)" />
          </div>
          <div>
            <div className="brand-main-name">Sanctuary</div>
            <div className="brand-sub-badge">Aryamaan</div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="sidebar-nav-menu" aria-label="Desktop Navigation">
          <button
            className={`sidebar-nav-btn ${activeTab === 'sanctuary' ? 'active' : ''}`}
            onClick={() => setActiveTab('sanctuary')}
          >
            <Compass size={17} />
            <span>Sanctuary</span>
          </button>

          <button
            className={`sidebar-nav-btn ${activeTab === 'diary' ? 'active' : ''}`}
            onClick={() => setActiveTab('diary')}
          >
            <BookMarked size={17} />
            <span>Notebook Journal</span>
            {diary.length > 0 && <span className="sidebar-badge-count">{diary.length}</span>}
          </button>

          <button
            className={`sidebar-nav-btn ${activeTab === 'quotes' ? 'active' : ''}`}
            onClick={() => setActiveTab('quotes')}
          >
            <BookOpen size={17} />
            <span>Wisdom Vault</span>
            {quotes.length > 0 && <span className="sidebar-badge-count">{quotes.length}</span>}
          </button>

          <button
            className={`sidebar-nav-btn ${activeTab === 'companion' ? 'active' : ''}`}
            onClick={() => setActiveTab('companion')}
          >
            <MessageSquare size={17} />
            <span>Companion</span>
            <span className="sidebar-badge-ai">AI</span>
          </button>

          {/* Layouts & Styles menu item inside Left Sidebar */}
          {onOpenSwitcher && (
            <button
              className="sidebar-nav-btn"
              onClick={onOpenSwitcher}
              style={{ marginTop: '0.85rem', borderTop: '1px dashed var(--border-light)', paddingTop: '0.85rem' }}
            >
              <Palette size={17} color="var(--accent-gold)" />
              <span>Layouts & Styles</span>
            </button>
          )}
        </nav>
      </div>

      {/* Sidebar Footer Tools */}
      <div className="sidebar-footer-block">
        <div className="sidebar-tools-row">
          <button
            className="sidebar-tool-icon-btn"
            onClick={() => setIsWhatsAppSimOpen(true)}
            title="WhatsApp Simulator"
          >
            <MessageSquare size={16} />
          </button>

          <button
            className="sidebar-tool-icon-btn"
            onClick={() => setIsBreathModalOpen(true)}
            title="Grounding Breath"
          >
            <Wind size={16} />
          </button>

          <button
            className="sidebar-tool-icon-btn"
            onClick={toggleTheme}
            title={theme === 'dark-hearth' ? 'Switch Light Theme' : 'Switch Dark Theme'}
          >
            {theme === 'dark-hearth' ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <button
            className="sidebar-tool-icon-btn"
            onClick={() => setIsSettingsOpen(true)}
            title="Settings & BYOK Keys"
          >
            <Settings size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};
