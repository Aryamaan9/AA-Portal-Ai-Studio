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
  Moon
} from 'lucide-react';

export const TopHeader: React.FC = () => {
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
    <header className="sanctuary-top-header-bar">
      <div className="top-header-inner-wrap">
        {/* Brand */}
        <div className="top-header-brand" onClick={() => setActiveTab('sanctuary')}>
          <div className="brand-icon-box">
            <Sparkles size={16} color="var(--accent-gold)" />
          </div>
          <span className="brand-main-name">Sanctuary</span>
          <span className="brand-sub-badge">Aryamaan</span>
        </div>

        {/* Center Nav Links */}
        <nav className="top-header-nav-menu">
          <button
            className={`top-nav-btn ${activeTab === 'sanctuary' ? 'active' : ''}`}
            onClick={() => setActiveTab('sanctuary')}
          >
            <Compass size={15} />
            <span>Sanctuary</span>
          </button>

          <button
            className={`top-nav-btn ${activeTab === 'diary' ? 'active' : ''}`}
            onClick={() => setActiveTab('diary')}
          >
            <BookMarked size={15} />
            <span>Diary</span>
            {diary.length > 0 && <span className="top-nav-badge">{diary.length}</span>}
          </button>

          <button
            className={`top-nav-btn ${activeTab === 'quotes' ? 'active' : ''}`}
            onClick={() => setActiveTab('quotes')}
          >
            <BookOpen size={15} />
            <span>Wisdom Vault</span>
            {quotes.length > 0 && <span className="top-nav-badge">{quotes.length}</span>}
          </button>

          <button
            className={`top-nav-btn ${activeTab === 'companion' ? 'active' : ''}`}
            onClick={() => setActiveTab('companion')}
          >
            <MessageSquare size={15} />
            <span>Companion</span>
          </button>
        </nav>

        {/* Right Tools */}
        <div className="top-header-tools-cluster">
          <button
            className="header-tool-btn"
            onClick={() => setIsWhatsAppSimOpen(true)}
            title="WhatsApp Simulator"
          >
            <MessageSquare size={16} />
          </button>

          <button
            className="header-tool-btn"
            onClick={() => setIsBreathModalOpen(true)}
            title="Grounding Breath"
          >
            <Wind size={16} />
          </button>

          <button
            className="header-tool-btn"
            onClick={toggleTheme}
            title={theme === 'dark-hearth' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          >
            {theme === 'dark-hearth' ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <button
            className="header-tool-btn"
            onClick={() => setIsSettingsOpen(true)}
            title="Settings & BYOK Keys"
          >
            <Settings size={16} />
          </button>
        </div>
      </div>
    </header>
  );
};
