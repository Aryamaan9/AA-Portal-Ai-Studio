import React from 'react';
import { useData } from '../../context/DataContext';
import { Compass, BookMarked, BookOpen, MessageSquare, Settings } from 'lucide-react';
import styles from './MobileNav.module.css';

export const MobileNav: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    setIsSettingsOpen
  } = useData();

  return (
    <nav className={styles.mobileNav} aria-label="Mobile Navigation">
      <button
        className={`${styles.navBtn} ${activeTab === 'sanctuary' ? styles.active : ''}`}
        onClick={() => setActiveTab('sanctuary')}
      >
        <Compass size={20} />
        <span>Sanctuary</span>
      </button>

      <button
        className={`${styles.navBtn} ${activeTab === 'diary' ? styles.active : ''}`}
        onClick={() => setActiveTab('diary')}
      >
        <BookMarked size={20} />
        <span>Diary</span>
      </button>

      <button
        className={`${styles.navBtn} ${activeTab === 'quotes' ? styles.active : ''}`}
        onClick={() => setActiveTab('quotes')}
      >
        <BookOpen size={20} />
        <span>Quotes</span>
      </button>

      <button
        className={`${styles.navBtn} ${activeTab === 'companion' ? styles.active : ''}`}
        onClick={() => setActiveTab('companion')}
      >
        <MessageSquare size={20} />
        <span>Companion</span>
      </button>

      <button
        className={styles.navBtn}
        onClick={() => setIsSettingsOpen(true)}
      >
        <Settings size={20} />
        <span>Settings</span>
      </button>
    </nav>
  );
};
