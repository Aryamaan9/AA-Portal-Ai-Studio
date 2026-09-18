import React, { useState, useEffect } from 'react';
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
import { ScreenshotIngestModal } from './components/quotes/ScreenshotIngestModal';
import { InstallAppPrompt } from './components/common/InstallAppPrompt';
import { LayoutSwitcherBar } from './components/layout/LayoutSwitcherBar';
import { MobileHeader } from './components/layout/MobileHeader';
import { useIsMobile } from './hooks/useIsMobile';
import { Check } from 'lucide-react';
import styles from './AppLayout.module.css';

const SanctuaryShell: React.FC = () => {
  const {
    activeTab,
    toastMessage,
    isWhatsAppSimOpen,
    setIsWhatsAppSimOpen,
    isScreenshotModalOpen,
    setIsScreenshotModalOpen,
    pastedImageBase64,
    setPastedImageBase64
  } = useData();
  const { layout } = useTheme();
  const isMobile = useIsMobile();

  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);

  // Global clipboard listener for screenshot ingestion
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (!blob) continue;

          const reader = new FileReader();
          reader.onload = () => {
            const base64 = reader.result as string;
            setPastedImageBase64(base64);
            setIsScreenshotModalOpen(true);
          };
          reader.readAsDataURL(blob);
          e.preventDefault();
          break;
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [setIsScreenshotModalOpen, setPastedImageBase64]);

  const isSidebarLayout = layout === 'sidebar-left';
  const isCenteredLayout = layout === 'centered-notebook' || layout === 'split-pane';
  const isIslandLayout = layout === 'floating-island';

  let layoutClass = '';
  if (isSidebarLayout) layoutClass = styles.layoutSidebarLeft;
  else if (layout === 'centered-notebook') layoutClass = styles.layoutCenteredNotebook;
  else if (layout === 'split-pane') layoutClass = styles.layoutSplitPane;
  else if (isIslandLayout) layoutClass = styles.layoutFloatingIsland;

  let mainClass = styles.mainContent;
  if (isSidebarLayout) mainClass += ` ${styles.mainWithSidebar}`;
  else if (isCenteredLayout) mainClass += ` ${styles.mainCentered}`;
  else if (isIslandLayout) mainClass += ` ${styles.mainIsland}`;

  return (
    <div className={`${styles.appContainer} ${layoutClass}`}>
      {/* Mobile-First Header or Desktop Layout Navs */}
      {isMobile ? (
        <MobileHeader onOpenSwitcher={() => setIsSwitcherOpen(true)} />
      ) : (
        <>
          {/* 1. Left Sidebar Navigation */}
          {isSidebarLayout && (
            <SidebarNav onOpenSwitcher={() => setIsSwitcherOpen(true)} />
          )}

          {/* 2. Top Centered Literary Header */}
          {isCenteredLayout && <TopHeader />}

          {/* 3. Floating Glass Island Dock */}
          {isIslandLayout && <FloatingIsland />}
        </>
      )}

      {/* Main Sanctuary Workspace */}
      <main className={mainClass}>
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
      <ScreenshotIngestModal
        isOpen={isScreenshotModalOpen}
        onClose={() => {
          setIsScreenshotModalOpen(false);
          setPastedImageBase64(null);
        }}
        initialImageBase64={pastedImageBase64}
      />

      {/* Android PWA / WebAPK Install Prompt */}
      <InstallAppPrompt />

      {/* Controlled Layout & Style Switcher Bar (Triggered from Left Sidebar) */}
      <LayoutSwitcherBar
        isOpen={isSwitcherOpen}
        onClose={() => setIsSwitcherOpen(false)}
      />

      {/* Subtle Toast Feedback */}
      {toastMessage && (
        <div className={styles.toast}>
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
