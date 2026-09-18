import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Layout, Palette } from 'lucide-react';
import { ResponsiveModal } from '../common/ResponsiveModal';
import styles from './LayoutSwitcherBar.module.css';

interface LayoutSwitcherBarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LayoutSwitcherBar: React.FC<LayoutSwitcherBarProps> = ({ isOpen, onClose }) => {
  const {
    layout,
    setLayout,
    layouts,
    theme,
    setTheme,
    themes
  } = useTheme();

  const [activeTab, setActiveTab] = useState<'themes' | 'layouts'>('themes');

  if (!isOpen) return null;

  return (
    <ResponsiveModal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Visual Customization" 
      hideHeader={false}
      maxWidth="380px"
    >
      {/* Tabs Row */}
      <div className={styles.tabsRow}>
        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === 'themes' ? styles.active : ''}`}
          onClick={() => setActiveTab('themes')}
        >
          <Palette size={13} />
          <span>8 Color Atmospheres</span>
        </button>

        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === 'layouts' ? styles.active : ''}`}
          onClick={() => setActiveTab('layouts')}
        >
          <Layout size={13} />
          <span>4 Structure Layouts</span>
        </button>
      </div>

      {/* TAB 1: 8 NATURE COLOR THEMES */}
      {activeTab === 'themes' && (
        <div className={styles.itemsList}>
          {themes.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`${styles.choiceCard} ${theme === t.id ? styles.active : ''}`}
              onClick={() => setTheme(t.id)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span
                  style={{
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    backgroundColor: t.bgHex,
                    border: '1px solid #999',
                    display: 'inline-block'
                  }}
                />
                <span className={styles.cardBadge}>{t.badge}</span>
              </div>
              <div className={styles.cardDesc}>{t.name}</div>
            </button>
          ))}
        </div>
      )}

      {/* TAB 2: 4 LAYOUT OPTIONS */}
      {activeTab === 'layouts' && (
        <div className={styles.itemsList}>
          {layouts.map((l) => (
            <button
              key={l.id}
              type="button"
              className={`${styles.choiceCard} ${layout === l.id ? styles.active : ''}`}
              onClick={() => setLayout(l.id)}
            >
              <div className={styles.cardBadge}>{l.badge}</div>
              <div className={styles.cardDesc}>{l.desc}</div>
            </button>
          ))}
        </div>
      )}
    </ResponsiveModal>
  );
};
