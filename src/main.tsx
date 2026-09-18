import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './styles/forms.css';
import './styles/modals.css';
import './styles/sanctuary-home.css';
import './styles/quotes-vault.css';
import './styles/diary-notebook.css';
import './styles/companion-studio.css';
import './styles/vault-controls.css';
import './styles/install-banner.css';
import './styles/missing-clone.css';
import './styles/mobile-responsive.css';

import '@mantine/core/styles.css';
import { MantineProvider, createTheme } from '@mantine/core';

const theme = createTheme({
  primaryColor: 'teal',
  fontFamily: 'Plus Jakarta Sans, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
  defaultRadius: 'md',
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <MantineProvider theme={theme}>
      <App />
    </MantineProvider>
  </React.StrictMode>
);

// Register Service Worker for Android PWA / WebAPK support in production
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.log('Service Worker registration failed:', err);
    });
  });
}
