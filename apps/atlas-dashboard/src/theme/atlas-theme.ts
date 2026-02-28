import { theme, type ThemeConfig } from 'antd';

export const atlasDashboardPalette = {
  ai: '#ff8a1f',
  bg: '#06080c',
  border: '#2b3440',
  core: '#00d3a7',
  coreDark: '#0b1017',
  hero: '#0b1017',
  heroAlt: '#111823',
  ink: '#f3f7fb',
  line: '#1e2732',
  muted: '#90a0b4',
  panel: '#0f141b',
  panelAlt: '#151c25',
  signal: '#4da3ff',
  white: '#f3f7fb',
  workbench: '#7c8cff'
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
      boxShadowTertiary: 'none'
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
