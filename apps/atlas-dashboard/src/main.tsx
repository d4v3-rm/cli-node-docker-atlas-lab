import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import DashboardApp from './App';
import '@/shared/config/i18n';
import { DashboardProviders } from '@/app/providers/dashboard-providers';
import { applyDashboardDocumentChrome } from '@/app/styles/apply-dashboard-document-chrome';

applyDashboardDocumentChrome();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <DashboardProviders>
        <DashboardApp />
      </DashboardProviders>
    </BrowserRouter>
  </StrictMode>
);
