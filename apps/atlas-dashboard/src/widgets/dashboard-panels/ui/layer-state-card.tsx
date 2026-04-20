import { ApiOutlined, CodeOutlined } from '@ant-design/icons';
import { Button, Card, Col, Flex, Row, Tag, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import {
  dashboardToneStyles,
  SignalPill,
  type OptionalLayerViewModel
} from '@/entities/dashboard';
import { atlasDashboardPalette } from '@/shared/theme/atlas-theme';
import {
  monoFontFamily,
  surfaceCardStyle
} from '@/shared/ui';

const { Paragraph, Text, Title } = Typography;

interface LayerStateCardProps {
  layer: OptionalLayerViewModel;
}

export function LayerStateCard({ layer }: LayerStateCardProps) {
  const { t } = useTranslation();
  const palette = dashboardToneStyles[layer.tone];
  const IconGlyph = layer.tone === 'ai' ? ApiOutlined : CodeOutlined;

  return (
    <Card
      style={{
        ...surfaceCardStyle,
        background: atlasDashboardPalette.panel
      }}
      styles={{ body: { padding: 24 } }}
    >
      <Row align="stretch" gutter={[24, 24]}>
        <Col xs={24} xl={14}>
          <Flex vertical gap={20}>
            <Flex align="flex-start" gap={18}>
              <Button
                icon={<IconGlyph />}
                shape="circle"
                size="large"
                type="text"
                style={{
                  background: palette.soft,
                  color: palette.accent,
                  flexShrink: 0,
                  height: 56,
                  width: 56
                }}
              />
              <Flex vertical gap={8}>
                <Title level={3} style={{ letterSpacing: '-0.04em', lineHeight: 1, margin: 0 }}>
                  {layer.title}
                </Title>
                <Paragraph style={{ color: atlasDashboardPalette.muted, lineHeight: 1.8, margin: 0 }}>
                  {layer.description}
                </Paragraph>
              </Flex>
            </Flex>

            <Flex gap={12} wrap="wrap">
              {layer.capabilities.map((capability) => (
                <SignalPill
                  icon={capability.icon}
                  key={capability.label}
                  label={capability.label}
                  tone={layer.tone}
                />
              ))}
            </Flex>
          </Flex>
        </Col>
        <Col xs={24} xl={10}>
          <Card
            size="small"
            style={{
              background: atlasDashboardPalette.panelAlt,
              borderRadius: 24,
              height: '100%'
            }}
            styles={{ body: { padding: 20 } }}
          >
            <Flex vertical justify="space-between" gap={16} style={{ height: '100%' }}>
              <Flex align="center" gap={12} justify="space-between" wrap="wrap">
                <Text strong style={{ fontSize: 18 }}>
                  {layer.enabled ? t('layerState.activeTitle') : t('layerState.inactiveTitle')}
                </Text>
                <Tag
                  color={palette.accent}
                  style={{
                    background: palette.soft,
                    fontWeight: 700,
                    marginInlineEnd: 0
                  }}
                >
                  {layer.enabled ? t('layerState.onlineBadge') : t('layerState.manualBadge')}
                </Tag>
              </Flex>
              <Paragraph style={{ color: atlasDashboardPalette.muted, lineHeight: 1.8, margin: 0 }}>
                {layer.summary}
              </Paragraph>
              {!layer.enabled ? (
                <Card
                  size="small"
                  style={{
                    background: atlasDashboardPalette.hero,
                    border: 'none',
                    borderRadius: 18
                  }}
                  styles={{ body: { padding: 16 } }}
                >
                  <Text
                    code
                    style={{
                      color: atlasDashboardPalette.white,
                      fontFamily: monoFontFamily,
                      fontSize: 15
                    }}
                  >
                    {layer.activationCommand}
                  </Text>
                </Card>
              ) : null}
            </Flex>
          </Card>
        </Col>
      </Row>
    </Card>
  );
}
