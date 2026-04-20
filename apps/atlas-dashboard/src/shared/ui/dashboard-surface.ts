import type { CSSProperties } from 'react';
import { atlasDashboardPalette } from '@/shared/theme/atlas-theme';

export const surfaceCardStyle: CSSProperties = {
  background: atlasDashboardPalette.panel,
  borderRadius: 28,
  boxShadow: 'none'
};

export const cardBodyPadding = {
  body: {
    padding: 24
  }
} as const;

export const overlineStyle: CSSProperties = {
  color: atlasDashboardPalette.muted,
  display: 'block',
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: '0.18em',
  textTransform: 'uppercase'
};

export const monoFontFamily = `"SFMono-Regular", Consolas, monospace`;
