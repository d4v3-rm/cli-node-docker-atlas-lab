import { theme, type ThemeConfig } from 'antd';

export const atlasDashboardPalette = {
  ai: '#d68a48',
  bg: '#071015',
  border: '#2a3a42',
  core: '#1f9f8d',
  coreDark: '#07181d',
  hero: '#091920',
  heroAlt: '#0d242c',
  ink: '#eff7f4',
  line: '#22323a',
  muted: '#96a8a4',
  panel: '#0d171d',
  panelAlt: '#132129',
  signal: '#5b92c8',
  white: '#f5fbf8',
  workbench: '#5a8fc9'
} as const;

/**
 * Shared Ant Design theme for the Atlas Dashboard.
 */
export const atlasTheme: ThemeConfig = {
  algorithm: theme.darkAlgorithm,
  token: {
    borderRadius: 24,
    colorBgBase: atlasDashboardPalette.bg,
    colorBgContainer: atlasDashboardPalette.panel,
    colorBorder: atlasDashboardPalette.line,
    colorError: '#de6d60',
    colorInfo: atlasDashboardPalette.signal,
    colorPrimary: atlasDashboardPalette.core,
    colorSuccess: atlasDashboardPalette.core,
    colorText: atlasDashboardPalette.ink,
    colorTextSecondary: atlasDashboardPalette.muted,
    controlHeight: 44,
    fontFamily: `-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`,
    wireframe: false
  },
  components: {
    Alert: {
      borderRadiusLG: 20
    },
    Button: {
      borderRadius: 999,
      controlHeight: 44,
      fontWeight: 700
    },
    Card: {
      borderRadiusLG: 28,
      boxShadowTertiary: '0 18px 36px rgba(0, 0, 0, 0.28)'
    },
    Modal: {
      borderRadiusLG: 24,
      contentBg: atlasDashboardPalette.panel,
      footerBg: atlasDashboardPalette.panel,
      headerBg: atlasDashboardPalette.panel
    },
    Select: {
      borderRadius: 999,
      optionSelectedBg: atlasDashboardPalette.panelAlt
    },
    Tag: {
      borderRadiusSM: 999
    },
    Typography: {
      titleMarginBottom: 0,
      titleMarginTop: 0
    }
  }
};
