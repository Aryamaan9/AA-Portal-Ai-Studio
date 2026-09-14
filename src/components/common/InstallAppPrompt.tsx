import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X } from 'lucide-react';

export const InstallAppPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already running as standalone PWA / WebAPK
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsInstalled(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      (window as any).__sanctuaryDeferredPrompt = e;
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (isInstalled || isDismissed || !deferredPrompt) return null;

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  return (
    <div className="install-app-banner">
      <div className="install-app-left">
        <div className="install-app-icon-wrap">
          <Smartphone size={16} color="var(--accent-gold)" />
        </div>
        <div className="install-app-text-wrap">
          <span className="install-app-title">Install Sanctuary App</span>
          <span className="install-app-desc">Tap for full-screen Android app experience</span>
        </div>
      </div>
      <div className="install-app-right">
        <button type="button" className="btn-primary install-btn" onClick={handleInstall}>
          <Download size={13} />
          <span>Install</span>
        </button>
        <button
          type="button"
          className="install-dismiss-btn"
          onClick={() => setIsDismissed(true)}
          title="Dismiss install banner"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};
