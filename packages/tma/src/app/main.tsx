import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@/styles/global.css';
import { translations } from '@/lib';
import { App } from './app';
import { ErrorBoundary } from './error-boundary';
import { Providers } from './providers';

// Resolve translations once at mount — ErrorBoundary is a class component
// and cannot use the useT() hook internally.
const t = translations[navigator.language.slice(0, 2)] ?? translations.en;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary t={t}>
      <Providers>
        <App />
      </Providers>
    </ErrorBoundary>
  </StrictMode>,
);
