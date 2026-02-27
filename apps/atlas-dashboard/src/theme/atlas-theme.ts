import type { ThemeConfig } from 'antd';

export const atlasDashboardPalette = {
  ai: '#bf7136',
  bg: '#e8f0eb',
  border: '#bfd0c7',
  core: '#12776d',
  coreDark: '#0b4e48',
  hero: '#0e2c32',
  heroAlt: '#173c43',
  ink: '#102127',
  line: '#cfddd5',
  muted: '#53645f',
  panel: '#fbfdfb',
  panelAlt: '#f2f7f4',
  signal: '#31658f',
  white: '#f9fcfa',
  workbench: '#3a6f9c'
} as const;

/**
 * Shared Ant Design theme for the Atlas Dashboard.
 */
export const atlasTheme: ThemeConfig = {
  token: {
    borderRadius: 24,
    colorBgBase: atlasDashboardPalette.panel,
    colorBgContainer: atlasDashboardPalette.panel,
    colorBorder: atlasDashboardPalette.line,
    colorError: '#b24a3a',
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
      boxShadowTertiary: '0 14px 32px rgba(16, 33, 39, 0.07)'
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
