import React from 'react';
import { useData } from '../../context/DataContext';
import { CompanionView } from './CompanionView';
import { X, Sparkles } from 'lucide-react';

export const CompanionDrawer: React.FC = () => {
  const { isCompanionDrawerOpen, setIsCompanionDrawerOpen } = useData();

  if (!isCompanionDrawerOpen) return null;

  return (
    <div className="companion-drawer-overlay" onClick={() => setIsCompanionDrawerOpen(false)}>
      <aside className="companion-drawer-card" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header-bar">
          <div className="drawer-title-group">
            <Sparkles size={16} color="var(--accent-gold)" />
            <span className="drawer-title">Companion Drawer</span>
          </div>
          <button
            className="drawer-close-btn"
            onClick={() => setIsCompanionDrawerOpen(false)}
            title="Close Drawer"
          >
            <X size={16} />
          </button>
        </div>

        <div className="drawer-body-wrap">
          <CompanionView />
        </div>
      </aside>
    </div>
  );
};
