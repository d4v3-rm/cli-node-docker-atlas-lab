import { Button, Card, Flex, Typography } from 'antd';
import {
  dashboardIconMap,
  type DashboardIconKey
} from '@/entities/dashboard';
import { atlasDashboardPalette } from '@/shared/theme/atlas-theme';
import { overlineStyle, surfaceCardStyle } from '@/shared/ui';

const { Paragraph, Text } = Typography;

interface InsightCardProps {
  body: string;
  icon: DashboardIconKey;
  label: string;
}

export function InsightCard({ body, icon, label }: InsightCardProps) {
  const IconGlyph = dashboardIconMap[icon];

  return (
    <Card style={{ ...surfaceCardStyle, height: '100%' }} styles={{ body: { padding: 20 } }}>
      <Flex vertical gap={14}>
        <Button
          icon={<IconGlyph />}
          shape="circle"
          size="large"
          type="text"
          style={{
            background: atlasDashboardPalette.panelAlt,
            color: atlasDashboardPalette.signal,
            width: 48
          }}
        />
        <Text style={overlineStyle}>{label}</Text>
        <Paragraph style={{ color: atlasDashboardPalette.muted, lineHeight: 1.85, margin: 0 }}>
          {body}
        </Paragraph>
      </Flex>
    </Card>
  );
}
