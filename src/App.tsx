import React, { useState } from 'react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { DataProvider, useData } from './context/DataContext';
import { SidebarNav } from './components/layout/SidebarNav';
import { TopHeader } from './components/layout/TopHeader';
import { FloatingIsland } from './components/layout/FloatingIsland';
import { MobileNav } from './components/layout/MobileNav';
import { SanctuaryHome } from './components/sanctuary/SanctuaryHome';
import { DiaryNotebook } from './components/diary/DiaryNotebook';
import { QuotesVault } from './components/quotes/QuotesVault';
import { CompanionView } from './components/companion/CompanionView';
import { CompanionDrawer } from './components/companion/CompanionDrawer';
import { BreathModal } from './components/common/BreathModal';
import { ContemplateModal } from './components/common/ContemplateModal';
import { SettingsModal } from './components/common/SettingsModal';
import { WhatsAppSimulatorModal } from './components/common/WhatsAppSimulatorModal';
import { LayoutSwitcherBar } from './components/layout/LayoutSwitcherBar';
import { Check } from 'lucide-react';

const SanctuaryShell: React.FC = () => {
  const { activeTab, toastMessage, isWhatsAppSimOpen, setIsWhatsAppSimOpen } = useData();
  const { layout } = useTheme();

  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);

  const isSidebarLayout = layout === 'sidebar-left';
  const isCenteredLayout = layout === 'centered-notebook' || layout === 'split-pane';
  const isIslandLayout = layout === 'floating-island';

  return (
    <div className={`app-container layout-${layout}`}>
      {/* 1. Left Sidebar Navigation */}
      {isSidebarLayout && (
        <SidebarNav onOpenSwitcher={() => setIsSwitcherOpen(true)} />
      )}

      {/* 2. Top Centered Literary Header */}
      {isCenteredLayout && <TopHeader />}

      {/* 3. Floating Glass Island Dock */}
      {isIslandLayout && <FloatingIsland />}

      {/* Main Sanctuary Workspace */}
      <main
        className={`main-content ${
          isSidebarLayout
            ? 'main-with-sidebar'
            : isCenteredLayout
            ? 'main-centered'
            : isIslandLayout
            ? 'main-island'
            : ''
        }`}
      >
        {activeTab === 'sanctuary' && <SanctuaryHome />}
        {activeTab === 'diary' && <DiaryNotebook />}
        {activeTab === 'quotes' && <QuotesVault />}
        {activeTab === 'companion' && <CompanionView />}
      </main>

      {/* Slide-out Companion Drawer (available everywhere) */}
      <CompanionDrawer />

      {/* Mobile Bottom Navigation */}
      <MobileNav />

      {/* Global Modals */}
      <BreathModal />
      <ContemplateModal />
      <SettingsModal />
      <WhatsAppSimulatorModal
        isOpen={isWhatsAppSimOpen}
        onClose={() => setIsWhatsAppSimOpen(false)}
      />

      {/* Controlled Layout & Style Switcher Bar (Triggered from Left Sidebar) */}
      <LayoutSwitcherBar
        isOpen={isSwitcherOpen}
        onClose={() => setIsSwitcherOpen(false)}
      />

      {/* Subtle Toast Feedback */}
      {toastMessage && (
        <div className="sanctuary-toast">
          <Check size={14} color="var(--accent-gold)" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <DataProvider>
        <SanctuaryShell />
      </DataProvider>
    </ThemeProvider>
  );
};

export default App;
