import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Sparkles, Layout, Palette, X } from 'lucide-react';

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
    <aside className="floating-switcher-panel" aria-label="Layout and Style Switcher">
      <div className="switcher-panel-header">
        <div className="switcher-header-left">
          <Sparkles size={14} color="var(--accent-gold)" />
          <span className="switcher-title">Visual Customization</span>
        </div>
        <button
          className="switcher-close-btn"
          onClick={onClose}
          title="Close Customization"
        >
          <X size={14} />
        </button>
      </div>

      {/* Tabs Row */}
      <div className="switcher-tabs-row">
        <button
          type="button"
          className={`switcher-tab-btn ${activeTab === 'themes' ? 'active' : ''}`}
          onClick={() => setActiveTab('themes')}
        >
          <Palette size={13} />
          <span>8 Color Atmospheres</span>
        </button>

        <button
          type="button"
          className={`switcher-tab-btn ${activeTab === 'layouts' ? 'active' : ''}`}
          onClick={() => setActiveTab('layouts')}
        >
          <Layout size={13} />
          <span>4 Structure Layouts</span>
        </button>
      </div>

      {/* TAB 1: 8 NATURE COLOR THEMES */}
      {activeTab === 'themes' && (
        <div className="switcher-items-list">
          {themes.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`switcher-choice-card ${theme === t.id ? 'active' : ''}`}
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
                <span className="choice-card-badge">{t.badge}</span>
              </div>
              <div className="choice-card-desc">{t.name}</div>
            </button>
          ))}
        </div>
      )}

      {/* TAB 2: 4 LAYOUT OPTIONS */}
      {activeTab === 'layouts' && (
        <div className="switcher-items-list">
          {layouts.map((l) => (
            <button
              key={l.id}
              type="button"
              className={`switcher-choice-card ${layout === l.id ? 'active' : ''}`}
              onClick={() => setLayout(l.id)}
            >
              <div className="choice-card-badge">{l.badge}</div>
              <div className="choice-card-desc">{l.desc}</div>
            </button>
          ))}
        </div>
      )}
    </aside>
  );
};
