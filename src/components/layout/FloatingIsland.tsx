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
import styles from './FloatingIsland.module.css';

export const FloatingIsland: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    setIsBreathModalOpen,
    setIsSettingsOpen
  } = useData();
  const { toggleTheme } = useTheme();

  return (
    <nav className={styles.floatingIslandDock} aria-label="Sanctuary Island Dock">
      <div className={styles.brandPill} onClick={() => setActiveTab('sanctuary')}>
        <Sparkles size={16} color="var(--accent-gold)" />
      </div>

      <div className={styles.navItemsRow}>
        <button
          className={`${styles.tabBtn} ${activeTab === 'sanctuary' ? styles.active : ''}`}
          onClick={() => setActiveTab('sanctuary')}
        >
          <Compass size={15} />
          <span>Sanctuary</span>
        </button>

        <button
          className={`${styles.tabBtn} ${activeTab === 'diary' ? styles.active : ''}`}
          onClick={() => setActiveTab('diary')}
        >
          <BookMarked size={15} />
          <span>Diary</span>
        </button>

        <button
          className={`${styles.tabBtn} ${activeTab === 'quotes' ? styles.active : ''}`}
          onClick={() => setActiveTab('quotes')}
        >
          <BookOpen size={15} />
          <span>Quotes</span>
        </button>

        <button
          className={`${styles.tabBtn} ${activeTab === 'companion' ? styles.active : ''}`}
          onClick={() => setActiveTab('companion')}
        >
          <MessageSquare size={15} />
          <span>Companion</span>
        </button>
      </div>

      <div className={styles.toolsCluster}>
        <button
          className={styles.toolBtn}
          onClick={() => setIsBreathModalOpen(true)}
          title="Take a breath"
        >
          <Wind size={15} />
        </button>

        <button
          className={styles.toolBtn}
          onClick={toggleTheme}
          title="Toggle Light/Dark"
        >
          <Sparkles size={14} />
        </button>

        <button
          className={styles.toolBtn}
          onClick={() => setIsSettingsOpen(true)}
          title="Settings"
        >
          <Settings size={15} />
        </button>
      </div>
    </nav>
  );
};
