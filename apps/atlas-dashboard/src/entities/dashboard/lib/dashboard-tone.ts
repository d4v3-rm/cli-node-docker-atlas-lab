import type { TFunction } from 'i18next';
import { atlasDashboardPalette } from '@/shared/theme/atlas-theme';
import type { DashboardTone } from '@/entities/dashboard/model/dashboard-view-model.types';

export interface DashboardToneStyle {
  accent: string;
  border: string;
  soft: string;
  surface: string;
  surfaceAlt: string;
}

export const dashboardToneStyles: Record<DashboardTone, DashboardToneStyle> = {
  ai: {
    accent: atlasDashboardPalette.ai,
    border: 'transparent',
    soft: 'rgba(214, 138, 72, 0.16)',
    surface: atlasDashboardPalette.panel,
    surfaceAlt: '#211b17'
  },
  core: {
    accent: atlasDashboardPalette.core,
    border: 'transparent',
    soft: 'rgba(31, 159, 141, 0.16)',
    surface: atlasDashboardPalette.panel,
    surfaceAlt: '#14211f'
  },
  neutral: {
    accent: atlasDashboardPalette.signal,
    border: 'transparent',
    soft: 'rgba(91, 146, 200, 0.16)',
    surface: atlasDashboardPalette.panel,
    surfaceAlt: '#17202a'
  },
  workbench: {
    accent: atlasDashboardPalette.workbench,
    border: 'transparent',
    soft: 'rgba(90, 143, 201, 0.16)',
    surface: atlasDashboardPalette.panel,
    surfaceAlt: '#171e29'
  }
};

export function resolveToneLabel(t: TFunction, tone: DashboardTone) {
  return t(`cards.tones.${tone}`);
}
