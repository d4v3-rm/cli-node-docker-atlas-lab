import { Tag } from 'antd';
import {
  dashboardIconMap
} from '@/entities/dashboard/lib/dashboard-icon-map';
import { dashboardToneStyles } from '@/entities/dashboard/lib/dashboard-tone';
import type {
  DashboardIconKey,
  DashboardTone
} from '@/entities/dashboard/model/dashboard-view-model.types';
import { atlasDashboardPalette } from '@/shared/theme/atlas-theme';

interface SignalPillProps {
  icon: DashboardIconKey;
  label: string;
  tone: DashboardTone;
}

export function SignalPill({ icon, label, tone }: SignalPillProps) {
  const IconGlyph = dashboardIconMap[icon];
  const palette = dashboardToneStyles[tone];
  const capsuleBg =
    tone === 'core'
      ? 'rgba(31, 159, 141, 0.20)'
      : tone === 'ai'
        ? 'rgba(214, 138, 72, 0.20)'
        : tone === 'workbench'
          ? 'rgba(90, 143, 201, 0.20)'
          : atlasDashboardPalette.panelAlt;

  return (
    <Tag
      color={atlasDashboardPalette.white}
      icon={<IconGlyph style={{ color: atlasDashboardPalette.white }} />}
      style={{
        background: capsuleBg,
        borderRadius: 999,
        fontWeight: 700,
        marginInlineEnd: 0,
        padding: '8px 14px'
      }}
    >
      {label}
    </Tag>
  );
}
