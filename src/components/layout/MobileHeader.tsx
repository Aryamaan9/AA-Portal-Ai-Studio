import React from 'react';
import { useData } from '../../context/DataContext';
import { useTheme } from '../../context/ThemeContext';
import { Sparkles, Wind, Palette, Moon, Sun, Settings, Camera } from 'lucide-react';
import styles from './MobileHeader.module.css';

interface MobileHeaderProps {
  onOpenSwitcher: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({ onOpenSwitcher }) => {
  const { setActiveTab, setIsBreathModalOpen, setIsSettingsOpen, setIsScreenshotModalOpen } = useData();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className={styles.mobileHeader}>
      <div className={styles.brand} onClick={() => setActiveTab('sanctuary')}>
        <div className={styles.brandIconBox}>
          <Sparkles size={16} color="var(--accent-gold)" />
        </div>
        <span className={styles.brandMainName}>Sanctuary</span>
      </div>

      <div className={styles.actions}>
        <button
          className={styles.iconBtn}
          onClick={() => setIsScreenshotModalOpen(true)}
          title="Capture from Screenshot / Gallery"
        >
          <Camera size={17} color="var(--accent-gold)" />
        </button>

        <button
          className={styles.iconBtn}
          onClick={onOpenSwitcher}
          title="Customize Theme & Layout"
        >
          <Palette size={17} />
        </button>

        <button
          className={styles.iconBtn}
          onClick={() => setIsBreathModalOpen(true)}
          title="Grounding Breath"
        >
          <Wind size={17} />
        </button>

        <button
          className={styles.iconBtn}
          onClick={toggleTheme}
          title="Toggle Light / Dark"
        >
          {theme === 'dark-hearth' ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        <button
          className={styles.iconBtn}
          onClick={() => setIsSettingsOpen(true)}
          title="Settings"
        >
          <Settings size={17} />
        </button>
      </div>
    </header>
  );
};
