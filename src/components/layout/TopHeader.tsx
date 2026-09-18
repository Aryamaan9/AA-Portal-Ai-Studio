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
import styles from './TopHeader.module.css';

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
    <header className={styles.topHeaderBar}>
      <div className={styles.innerWrap}>
        {/* Brand */}
        <div className={styles.brand} onClick={() => setActiveTab('sanctuary')}>
          <div className={styles.brandIconBox}>
            <Sparkles size={16} color="var(--accent-gold)" />
          </div>
          <span className={styles.brandMainName}>Sanctuary</span>
          <span className={styles.brandSubBadge}>Aryamaan</span>
        </div>

        {/* Center Nav Links */}
        <nav className={styles.navMenu}>
          <button
            className={`${styles.navBtn} ${activeTab === 'sanctuary' ? styles.active : ''}`}
            onClick={() => setActiveTab('sanctuary')}
          >
            <Compass size={15} />
            <span>Sanctuary</span>
          </button>

          <button
            className={`${styles.navBtn} ${activeTab === 'diary' ? styles.active : ''}`}
            onClick={() => setActiveTab('diary')}
          >
            <BookMarked size={15} />
            <span>Diary</span>
            {diary.length > 0 && <span className={styles.navBadge}>{diary.length}</span>}
          </button>

          <button
            className={`${styles.navBtn} ${activeTab === 'quotes' ? styles.active : ''}`}
            onClick={() => setActiveTab('quotes')}
          >
            <BookOpen size={15} />
            <span>Wisdom Vault</span>
            {quotes.length > 0 && <span className={styles.navBadge}>{quotes.length}</span>}
          </button>

          <button
            className={`${styles.navBtn} ${activeTab === 'companion' ? styles.active : ''}`}
            onClick={() => setActiveTab('companion')}
          >
            <MessageSquare size={15} />
            <span>Companion</span>
          </button>
        </nav>

        {/* Right Tools */}
        <div className={styles.toolsCluster}>
          <button
            className={styles.toolBtn}
            onClick={() => setIsWhatsAppSimOpen(true)}
            title="WhatsApp Simulator"
          >
            <MessageSquare size={16} />
          </button>

          <button
            className={styles.toolBtn}
            onClick={() => setIsBreathModalOpen(true)}
            title="Grounding Breath"
          >
            <Wind size={16} />
          </button>

          <button
            className={styles.toolBtn}
            onClick={toggleTheme}
            title={theme === 'dark-hearth' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          >
            {theme === 'dark-hearth' ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <button
            className={styles.toolBtn}
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
