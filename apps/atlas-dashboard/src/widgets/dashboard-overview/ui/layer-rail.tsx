import { ApiOutlined, CodeOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { Card, Flex, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { dashboardToneStyles, type OptionalLayerViewModel } from '@/entities/dashboard';
import { atlasDashboardLayerRailStyles, atlasDashboardPalette } from '@/shared/theme/atlas-theme';
import { createAtlasDashboardLayerRailToneStyles } from '@/shared/theme/dashboard-visual-styles';
import { surfaceCardStyle } from '@/shared/ui';

const { Text, Title } = Typography;

interface LayerRailProps {
  aiLayer: Pick<OptionalLayerViewModel, 'enabled' | 'tone'>;
  aiServicesCount: number;
  coreServicesCount: number;
  workbenchCount: number;
  workbenchLayer: Pick<OptionalLayerViewModel, 'enabled' | 'tone'>;
}

interface LayerTelemetry {
  liveUnits: number;
  title: string;
  tone: OptionalLayerViewModel['tone'];
  totalUnits: number;
}

export function LayerRail({
  aiLayer,
  aiServicesCount,
  coreServicesCount,
  workbenchCount,
  workbenchLayer
}: LayerRailProps) {
  const { t } = useTranslation();
  const layers: LayerTelemetry[] = [
    {
      liveUnits: coreServicesCount,
      title: t('cards.tones.core'),
      tone: 'core',
      totalUnits: coreServicesCount
    },
    {
      liveUnits: aiLayer.enabled ? aiServicesCount : 0,
      title: t('cards.tones.ai'),
      tone: aiLayer.tone,
      totalUnits: aiServicesCount
    },
    {
      liveUnits: workbenchLayer.enabled ? workbenchCount : 0,
      title: t('cards.tones.workbench'),
      tone: workbenchLayer.tone,
      totalUnits: workbenchCount
    }
  ];

  return (
    <Card style={{ ...surfaceCardStyle, width: '100%' }} styles={{ body: { padding: 24 } }}>
      <Flex gap={22} vertical>
        <Title
          level={3}
          style={{
            color: atlasDashboardPalette.white,
            letterSpacing: '-0.05em',
            margin: 0
          }}
        >
          {t('rails.layerHeartbeatFootprint')}
        </Title>

        <div style={atlasDashboardLayerRailStyles.comparisonGrid}>
          {layers.map((layer) => (
            <div key={layer.title} style={{ minWidth: 0 }}>
              <LayerFootprintRow layer={layer} />
            </div>
          ))}
        </div>
      </Flex>
    </Card>
  );
}

interface LayerFootprintRowProps {
  layer: LayerTelemetry;
}

function LayerFootprintRow({ layer }: LayerFootprintRowProps) {
  const palette = dashboardToneStyles[layer.tone];
  const toneVisuals = createAtlasDashboardLayerRailToneStyles(palette);
  const IconGlyph =
    layer.tone === 'ai'
      ? ApiOutlined
      : layer.tone === 'workbench'
        ? CodeOutlined
        : ThunderboltOutlined;
  const configuredWidth = layer.totalUnits > 0 ? '100%' : '0%';
  const liveWidth =
    layer.totalUnits > 0
      ? `${Math.min(layer.liveUnits / layer.totalUnits, 1) * 100}%`
      : '0%';

  return (
    <Flex
      gap={14}
      style={toneVisuals.row}
      vertical
    >
      <Flex align="center" gap={14} justify="space-between" wrap="wrap">
        <Flex align="center" gap={12}>
          <Flex
            align="center"
            justify="center"
            style={toneVisuals.iconShell}
          >
            <IconGlyph style={{ fontSize: 18 }} />
          </Flex>

          <Text strong style={toneVisuals.title}>
            {layer.title}
          </Text>
        </Flex>

        <Text style={toneVisuals.counter}>
          {layer.liveUnits}/{layer.totalUnits}
        </Text>
      </Flex>

      <div style={atlasDashboardLayerRailStyles.comparisonTrack}>
        <div
          style={{
            ...toneVisuals.configuredBar,
            width: configuredWidth
          }}
        />
        <div
          style={{
            ...toneVisuals.liveBar,
            width: liveWidth
          }}
        />
      </div>
    </Flex>
  );
}
