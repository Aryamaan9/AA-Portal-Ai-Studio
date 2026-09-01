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
  Settings
} from 'lucide-react';

export const FloatingIsland: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    setIsBreathModalOpen,
    setIsSettingsOpen
  } = useData();
  const { toggleTheme } = useTheme();

  return (
    <nav className="sanctuary-floating-island-dock" aria-label="Sanctuary Island Dock">
      <div className="island-brand-pill" onClick={() => setActiveTab('sanctuary')}>
        <Sparkles size={16} color="var(--accent-gold)" />
      </div>

      <div className="island-nav-items-row">
        <button
          className={`island-tab-btn ${activeTab === 'sanctuary' ? 'active' : ''}`}
          onClick={() => setActiveTab('sanctuary')}
        >
          <Compass size={15} />
          <span>Sanctuary</span>
        </button>

        <button
          className={`island-tab-btn ${activeTab === 'diary' ? 'active' : ''}`}
          onClick={() => setActiveTab('diary')}
        >
          <BookMarked size={15} />
          <span>Diary</span>
        </button>

        <button
          className={`island-tab-btn ${activeTab === 'quotes' ? 'active' : ''}`}
          onClick={() => setActiveTab('quotes')}
        >
          <BookOpen size={15} />
          <span>Quotes</span>
        </button>

        <button
          className={`island-tab-btn ${activeTab === 'companion' ? 'active' : ''}`}
          onClick={() => setActiveTab('companion')}
        >
          <MessageSquare size={15} />
          <span>Companion</span>
        </button>
      </div>

      <div className="island-tools-cluster">
        <button
          className="island-tool-btn"
          onClick={() => setIsBreathModalOpen(true)}
          title="Take a breath"
        >
          <Wind size={15} />
        </button>

        <button
          className="island-tool-btn"
          onClick={toggleTheme}
          title="Toggle Light/Dark"
        >
          <Sparkles size={14} />
        </button>

        <button
          className="island-tool-btn"
          onClick={() => setIsSettingsOpen(true)}
          title="Settings"
        >
          <Settings size={15} />
        </button>
      </div>
    </nav>
  );
};
