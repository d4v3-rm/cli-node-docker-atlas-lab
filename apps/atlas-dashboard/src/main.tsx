import { StrictMode } from 'react';
import { App as AntdApp, ConfigProvider } from 'antd';
import { createRoot } from 'react-dom/client';
import DashboardApp from './App';
import '@/i18n';
import { atlasDashboardPalette, atlasTheme } from '@/theme/atlas-theme';

document.documentElement.style.background = atlasDashboardPalette.bg;
document.documentElement.style.colorScheme = 'dark';
document.documentElement.style.minHeight = '100%';
document.body.style.background = atlasDashboardPalette.bg;
document.body.style.margin = '0';
document.body.style.minHeight = '100vh';
document.body.style.color = atlasDashboardPalette.ink;
document.getElementById('root')!.style.minHeight = '100vh';
document.getElementById('root')!.style.background = atlasDashboardPalette.bg;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConfigProvider theme={atlasTheme}>
      <AntdApp>
        <DashboardApp />
      </AntdApp>
    </ConfigProvider>
  </StrictMode>
);
