import { Button, Card, Flex, Typography } from 'antd';
import {
  dashboardIconMap,
  dashboardToneStyles,
  type DashboardTone,
  type DashboardIconKey
} from '@/entities/dashboard';
import { atlasDashboardPalette } from '@/shared/theme/atlas-theme';
import {
  atlasDashboardCardLayoutStyles,
  createAtlasDashboardToneCardStyles
} from '@/shared/theme/dashboard-visual-styles';
import { overlineStyle, surfaceCardStyle } from '@/shared/ui';

const { Paragraph, Text } = Typography;

interface InsightCardProps {
  body: string;
  icon: DashboardIconKey;
  label: string;
  tone?: DashboardTone;
}

export function InsightCard({
  body,
  icon,
  label,
  tone = 'neutral'
}: InsightCardProps) {
  const IconGlyph = dashboardIconMap[icon];
  const palette = dashboardToneStyles[tone];
  const toneVisuals = createAtlasDashboardToneCardStyles(palette);

  return (
    <Card
      style={{
        ...surfaceCardStyle,
        ...atlasDashboardCardLayoutStyles.fullHeightShell,
        ...toneVisuals.shell
      }}
      styles={{ body: atlasDashboardCardLayoutStyles.insightBody }}
    >
      <Flex vertical gap={14}>
        <Button
          icon={<IconGlyph />}
          shape="circle"
          size="large"
          type="text"
          style={toneVisuals.insightIcon}
        />
        <Text style={{ ...overlineStyle, ...toneVisuals.titleEyebrow }}>{label}</Text>
        <Paragraph style={{ color: atlasDashboardPalette.muted, lineHeight: 1.85, margin: 0 }}>
          {body}
        </Paragraph>
      </Flex>
    </Card>
  );
}
