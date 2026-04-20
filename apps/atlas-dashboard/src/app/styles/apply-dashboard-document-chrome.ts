import { atlasDashboardPalette } from '@/shared/theme/atlas-theme';

export function applyDashboardDocumentChrome() {
  if (typeof document === 'undefined') {
    return;
  }

  const styleElementId = 'atlas-dashboard-flat-reset';

  document.documentElement.style.background = atlasDashboardPalette.bg;
  document.documentElement.style.colorScheme = 'dark';
  document.documentElement.style.minHeight = '100%';

  document.body.style.background = atlasDashboardPalette.bg;
  document.body.style.color = atlasDashboardPalette.ink;
  document.body.style.margin = '0';
  document.body.style.minHeight = '100vh';

  const rootElement = document.getElementById('root');
  if (!rootElement) {
    return;
  }

  rootElement.style.background = atlasDashboardPalette.bg;
  rootElement.style.minHeight = '100vh';

  let styleElement = document.getElementById(styleElementId) as HTMLStyleElement | null;

  if (!styleElement) {
    styleElement = document.createElement('style');
    styleElement.id = styleElementId;
    document.head.appendChild(styleElement);
  }

  styleElement.textContent = `
    .ant-card,
    .ant-card .ant-card-head,
    .ant-card .ant-card-body,
    .ant-modal .ant-modal-content,
    .ant-popover .ant-popover-inner,
    .ant-dropdown .ant-dropdown-menu,
    .ant-select-dropdown,
    .ant-tooltip .ant-tooltip-content {
      box-shadow: none !important;
    }
  `;
}
