import React, { createContext, useContext, useState, useEffect } from 'react';
import { UIThemePreset, UILayoutStructure } from '../types';

export interface LayoutOption {
  id: UILayoutStructure;
  name: string;
  badge: string;
  desc: string;
}

export const LAYOUT_OPTIONS: LayoutOption[] = [
  {
    id: 'sidebar-left',
    name: 'Left Sidebar',
    badge: '📱 Left Sidebar',
    desc: 'Locked-in vertical navigation rail with clean focus.'
  },
  {
    id: 'centered-notebook',
    name: 'Centered Notebook',
    badge: '📖 Centered Book',
    desc: 'Distraction-free single column with centered literary masthead.'
  },
  {
    id: 'split-pane',
    name: 'Split-Pane Studio',
    badge: '🎛️ Split Studio',
    desc: 'Dual-pane master-detail view with live reading stage.'
  },
  {
    id: 'floating-island',
    name: 'Floating Glass Island',
    badge: '🏝️ Floating Island',
    desc: 'Zero top clutter. Sleek frosted glass pill dock.'
  }
];

export interface ThemeOption {
  id: UIThemePreset;
  name: string;
  badge: string;
  bgHex: string;
  inkHex: string;
}

export const THEME_OPTIONS: ThemeOption[] = [
  { id: 'grounded-sage', name: 'Grounded Sage Green', badge: '🌲 Grounded Sage', bgHex: '#F0F4F2', inkHex: '#1B2B25' },
  { id: 'forest-emerald', name: 'Forest Emerald Canopy', badge: '🌿 Forest Emerald', bgHex: '#EDF6F0', inkHex: '#132E1F' },
  { id: 'ocean-teal', name: 'Ocean Fjord Teal', badge: '🌊 Ocean Teal', bgHex: '#EFF6F7', inkHex: '#112A30' },
  { id: 'misty-aquamarine', name: 'Misty Glacial Aquamarine', badge: '💧 Aquamarine', bgHex: '#F0F8F8', inkHex: '#14292B' },
  { id: 'midnight-cobalt', name: 'Midnight Ocean Cobalt', badge: '🌌 Midnight Cobalt', bgHex: '#0D1522', inkHex: '#E9F1FA' },
  { id: 'twilight-lavender', name: 'Twilight Heather Purple', badge: '🪻 Twilight Lavender', bgHex: '#F5F3F8', inkHex: '#231B2C' },
  { id: 'warm-parchment', name: 'Sun-Bleached Parchment', badge: '📖 Warm Parchment', bgHex: '#FAF7F0', inkHex: '#28231D' },
  { id: 'dark-hearth', name: 'Dark Woodland Moss', badge: '🕯️ Dark Hearth', bgHex: '#111A17', inkHex: '#E6F0EC' }
];

interface ThemeContextType {
  theme: UIThemePreset;
  setTheme: (theme: UIThemePreset) => void;
  layout: UILayoutStructure;
  setLayout: (layout: UILayoutStructure) => void;
  layouts: LayoutOption[];
  themes: ThemeOption[];
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<UIThemePreset>(() => {
    return (localStorage.getItem('sanctuary_theme_preset') as UIThemePreset) || 'grounded-sage';
  });

  const [layout, setLayoutState] = useState<UILayoutStructure>(() => {
    return (localStorage.getItem('sanctuary_layout_structure') as UILayoutStructure) || 'sidebar-left';
  });

  const setTheme = (newTheme: UIThemePreset) => {
    setThemeState(newTheme);
    localStorage.setItem('sanctuary_theme_preset', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const setLayout = (newLayout: UILayoutStructure) => {
    setLayoutState(newLayout);
    localStorage.setItem('sanctuary_layout_structure', newLayout);
    document.documentElement.setAttribute('data-layout', newLayout);
  };

  const toggleTheme = () => {
    if (theme === 'dark-hearth' || theme === 'midnight-cobalt') {
      setTheme('grounded-sage');
    } else {
      setTheme('dark-hearth');
    }
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-layout', layout);
  }, [theme, layout]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        layout,
        setLayout,
        layouts: LAYOUT_OPTIONS,
        themes: THEME_OPTIONS,
        toggleTheme
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
