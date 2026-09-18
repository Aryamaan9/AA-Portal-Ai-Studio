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
import styles from './SidebarNav.module.css';

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
    <aside className={styles.sidebarRail}>
      {/* Top Brand */}
      <div>
        <div className={styles.brandBlock} onClick={() => setActiveTab('sanctuary')}>
          <div className={styles.brandIconBox}>
            <Sparkles size={18} color="var(--accent-gold)" />
          </div>
          <div>
            <div className={styles.brandMainName}>Sanctuary</div>
            <div className={styles.brandSubBadge}>Aryamaan</div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className={styles.navMenu} aria-label="Desktop Navigation">
          <button
            className={`${styles.navBtn} ${activeTab === 'sanctuary' ? styles.active : ''}`}
            onClick={() => setActiveTab('sanctuary')}
          >
            <Compass size={17} />
            <span>Sanctuary</span>
          </button>

          <button
            className={`${styles.navBtn} ${activeTab === 'diary' ? styles.active : ''}`}
            onClick={() => setActiveTab('diary')}
          >
            <BookMarked size={17} />
            <span>Notebook Journal</span>
            {diary.length > 0 && <span className={styles.badgeCount}>{diary.length}</span>}
          </button>

          <button
            className={`${styles.navBtn} ${activeTab === 'quotes' ? styles.active : ''}`}
            onClick={() => setActiveTab('quotes')}
          >
            <BookOpen size={17} />
            <span>Wisdom Vault</span>
            {quotes.length > 0 && <span className={styles.badgeCount}>{quotes.length}</span>}
          </button>

          <button
            className={`${styles.navBtn} ${activeTab === 'companion' ? styles.active : ''}`}
            onClick={() => setActiveTab('companion')}
          >
            <MessageSquare size={17} />
            <span>Companion</span>
            <span className={styles.badgeAi}>AI</span>
          </button>

          {/* Layouts & Styles menu item inside Left Sidebar */}
          {onOpenSwitcher && (
            <button
              className={styles.navBtn}
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
      <div className={styles.footerBlock}>
        <div className={styles.toolsRow}>
          <button
            className={styles.toolIconBtn}
            onClick={() => setIsWhatsAppSimOpen(true)}
            title="WhatsApp Simulator"
          >
            <MessageSquare size={16} />
          </button>

          <button
            className={styles.toolIconBtn}
            onClick={() => setIsBreathModalOpen(true)}
            title="Grounding Breath"
          >
            <Wind size={16} />
          </button>

          <button
            className={styles.toolIconBtn}
            onClick={toggleTheme}
            title={theme === 'dark-hearth' ? 'Switch Light Theme' : 'Switch Dark Theme'}
          >
            {theme === 'dark-hearth' ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <button
            className={styles.toolIconBtn}
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
