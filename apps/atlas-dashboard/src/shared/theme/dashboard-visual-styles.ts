import type { CSSProperties } from 'react';
import { atlasDashboardPalette } from './atlas-theme';

export interface AtlasDashboardToneVisualPalette {
  accent: string;
  soft: string;
  surface: string;
  surfaceAlt: string;
}

export const atlasDashboardCardLayoutStyles = {
  actionRow: {
    marginTop: 'auto'
  } satisfies CSSProperties,
  content: {
    flex: 1,
    padding: 20
  } satisfies CSSProperties,
  fullHeightBody: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    padding: 0
  } satisfies CSSProperties,
  fullHeightShell: {
    height: '100%',
    overflow: 'hidden',
    width: '100%'
  } satisfies CSSProperties,
  insightBody: {
    padding: 20
  } satisfies CSSProperties,
  layerStateAsideBody: {
    padding: 20
  } satisfies CSSProperties,
  nestedBody: {
    padding: 16
  } satisfies CSSProperties
} as const;

export function createAtlasDashboardToneCardStyles(
  palette: AtlasDashboardToneVisualPalette
) {
  return {
    header: {
      background: palette.surfaceAlt,
      padding: 20
    } satisfies CSSProperties,
    iconButton: {
      background: palette.soft,
      color: palette.accent,
      flexShrink: 0
    } satisfies CSSProperties,
    insightIcon: {
      background: palette.surfaceAlt,
      color: palette.accent,
      width: 48
    } satisfies CSSProperties,
    note: {
      background: palette.surfaceAlt,
      borderRadius: 20
    } satisfies CSSProperties,
    shell: {
      background: palette.surface
    } satisfies CSSProperties,
    softTag: {
      background: palette.soft,
      fontWeight: 700,
      marginInlineEnd: 0
    } satisfies CSSProperties,
    subSurface: {
      background: palette.surfaceAlt,
      borderRadius: 20,
      height: '100%'
    } satisfies CSSProperties,
    titleEyebrow: {
      color: palette.accent
    } satisfies CSSProperties
  };
}

export function createAtlasDashboardLayerRailToneStyles(
  palette: AtlasDashboardToneVisualPalette
) {
  return {
    configuredBar: {
      background: atlasDashboardPalette.panel,
      borderRadius: 999,
      height: 18,
      left: 0,
      position: 'absolute',
      top: 0
    } satisfies CSSProperties,
    counter: {
      color: atlasDashboardPalette.white
    } satisfies CSSProperties,
    iconShell: {
      background: atlasDashboardPalette.panelAlt,
      borderRadius: 16,
      color: palette.accent,
      height: 48,
      width: 48
    } satisfies CSSProperties,
    liveBar: {
      background: palette.accent,
      borderRadius: 999,
      height: 18,
      left: 0,
      position: 'absolute',
      top: 0
    } satisfies CSSProperties,
    row: {
      background: palette.soft,
      borderRadius: 22,
      padding: 16
    } satisfies CSSProperties,
    title: {
      color: atlasDashboardPalette.white,
      fontSize: 17
    } satisfies CSSProperties
  };
}

export function createAtlasDashboardActionButtonStyles(
  palette: AtlasDashboardToneVisualPalette
) {
  return {
    brand: {
      background: palette.accent,
      color: atlasDashboardPalette.bg
    } satisfies CSSProperties,
    ghost: {
      background: atlasDashboardPalette.heroAlt,
      color: atlasDashboardPalette.white
    } satisfies CSSProperties,
    outline: {
      background: palette.soft,
      color: palette.accent
    } satisfies CSSProperties,
    solid: {
      background: palette.surfaceAlt,
      color: palette.accent
    } satisfies CSSProperties
  };
}
