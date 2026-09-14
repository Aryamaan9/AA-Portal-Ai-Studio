import React from 'react';
import { useData } from '../../context/DataContext';
import { Compass, BookMarked, BookOpen, MessageSquare, Settings } from 'lucide-react';

export const MobileNav: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    setIsSettingsOpen
  } = useData();

  return (
    <nav className="sanctuary-mobile-nav-bar" aria-label="Mobile Navigation">
      <button
        className={`mobile-nav-btn ${activeTab === 'sanctuary' ? 'active' : ''}`}
        onClick={() => setActiveTab('sanctuary')}
      >
        <Compass size={20} />
        <span>Sanctuary</span>
      </button>

      <button
        className={`mobile-nav-btn ${activeTab === 'diary' ? 'active' : ''}`}
        onClick={() => setActiveTab('diary')}
      >
        <BookMarked size={20} />
        <span>Diary</span>
      </button>

      <button
        className={`mobile-nav-btn ${activeTab === 'quotes' ? 'active' : ''}`}
        onClick={() => setActiveTab('quotes')}
      >
        <BookOpen size={20} />
        <span>Quotes</span>
      </button>

      <button
        className={`mobile-nav-btn ${activeTab === 'companion' ? 'active' : ''}`}
        onClick={() => setActiveTab('companion')}
      >
        <MessageSquare size={20} />
        <span>Companion</span>
      </button>

      <button
        className="mobile-nav-btn"
        onClick={() => setIsSettingsOpen(true)}
      >
        <Settings size={20} />
        <span>Settings</span>
      </button>
    </nav>
  );
};
