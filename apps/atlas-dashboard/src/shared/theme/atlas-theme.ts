import type { CSSProperties } from 'react';
import type { SegmentedProps } from 'antd';
import { theme, type ThemeConfig } from 'antd';

export const atlasDashboardPalette = {
  ai: '#ff8a1f',
  bg: '#06080c',
  border: '#2b3440',
  core: '#00d3a7',
  coreDark: '#0b1017',
  hero: '#0b1017',
  heroAlt: '#111823',
  image: '#c85cff',
  ink: '#f3f7fb',
  line: '#1e2732',
  muted: '#90a0b4',
  panel: '#0f141b',
  panelAlt: '#151c25',
  signal: '#4da3ff',
  white: '#f3f7fb',
  workbench: '#7c8cff'
} as const;

export const atlasDashboardLayerSwitcherStyles: {
  container: CSSProperties;
  eyebrow: CSSProperties;
  shell: CSSProperties;
  segmented: SegmentedProps['styles'];
} = {
  container: {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'center',
    width: '100%'
  },
  eyebrow: {
    color: atlasDashboardPalette.muted,
    textAlign: 'center'
  },
  shell: {
    background: atlasDashboardPalette.panelAlt,
    borderRadius: 999,
    padding: 8
  },
  segmented: {
    item: {
      borderRadius: 999,
      minHeight: 52,
      paddingInline: 18,
      transition: 'all 180ms ease'
    },
    label: {
      fontSize: 14,
      fontWeight: 700,
      letterSpacing: '0.01em'
    },
    root: {
      background: 'transparent'
    }
  }
} as const;

export const atlasDashboardLayerRailStyles: {
  backdrop: CSSProperties;
  comparisonGrid: CSSProperties;
  comparisonTrack: CSSProperties;
  container: CSSProperties;
  gaugeCore: CSSProperties;
  gaugeRing: CSSProperties;
  gaugeShell: CSSProperties;
  metricPill: CSSProperties;
  panel: CSSProperties;
  statusRow: CSSProperties;
  statusTrack: CSSProperties;
} = {
  backdrop: {
    background: atlasDashboardPalette.panel,
    inset: 0,
    pointerEvents: 'none',
    position: 'absolute'
  },
  comparisonGrid: {
    gap: 16
  },
  comparisonTrack: {
    background: atlasDashboardPalette.bg,
    borderRadius: 999,
    height: 18,
    overflow: 'hidden',
    position: 'relative'
  },
  container: {
    overflow: 'hidden',
    width: '100%'
  },
  gaugeCore: {
    background: atlasDashboardPalette.bg,
    borderRadius: 24,
    padding: 18
  },
  gaugeRing: {
    display: 'grid',
    gap: 12,
    width: 186
  },
  gaugeShell: {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'center',
    minWidth: 186
  },
  metricPill: {
    background: atlasDashboardPalette.panelAlt,
    borderRadius: 22,
    minWidth: 150,
    padding: '14px 16px'
  },
  panel: {
    background: atlasDashboardPalette.panelAlt,
    borderRadius: 26,
    height: '100%'
  },
  statusRow: {
    background: atlasDashboardPalette.bg,
    borderRadius: 20,
    padding: '14px 16px'
  },
  statusTrack: {
    display: 'grid',
    gap: 6,
    gridTemplateColumns: 'repeat(5, minmax(0, 1fr))'
  }
} as const;

/**
 * Shared Ant Design theme for the Atlas Dashboard.
 */
export const atlasTheme: ThemeConfig = {
  algorithm: theme.darkAlgorithm,
  token: {
    borderRadius: 24,
    boxShadow: 'none',
    boxShadowSecondary: 'none',
    boxShadowTertiary: 'none',
    colorBgBase: atlasDashboardPalette.bg,
    colorBgContainer: atlasDashboardPalette.panel,
    colorBorder: 'transparent',
    colorSplit: 'transparent',
    colorError: '#de6d60',
    colorInfo: atlasDashboardPalette.signal,
    colorPrimary: atlasDashboardPalette.core,
    colorSuccess: atlasDashboardPalette.core,
    colorText: atlasDashboardPalette.ink,
    colorTextSecondary: atlasDashboardPalette.muted,
    controlHeight: 44,
    fontFamily: `-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`,
    lineWidth: 0,
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
      boxShadow: 'none',
      boxShadowTertiary: 'none'
    },
    Modal: {
      borderRadiusLG: 24,
      contentBg: atlasDashboardPalette.panel,
      footerBg: atlasDashboardPalette.panel,
      headerBg: atlasDashboardPalette.panel
    },
    Segmented: {
      itemActiveBg: atlasDashboardPalette.panel,
      itemColor: atlasDashboardPalette.muted,
      itemHoverBg: atlasDashboardPalette.panel,
      itemHoverColor: atlasDashboardPalette.white,
      itemSelectedBg: atlasDashboardPalette.panel,
      itemSelectedColor: atlasDashboardPalette.white,
      trackBg: atlasDashboardPalette.panelAlt,
      trackPadding: 4
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
