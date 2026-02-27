import { StrictMode } from 'react';
import { App as AntdApp, ConfigProvider } from 'antd';
import { createRoot } from 'react-dom/client';
import DashboardApp from './App';
import '@/i18n';
import { atlasTheme } from '@/theme/atlas-theme';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConfigProvider theme={atlasTheme}>
      <AntdApp>
        <DashboardApp />
      </AntdApp>
    </ConfigProvider>
  </StrictMode>
);
