import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AppProviders } from '@/app/providers/AppProviders';
import { initAppTheme } from '@/lib/app-theme';
import App from '@/App';
import '@/styles/index.css';

initAppTheme();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>
);
