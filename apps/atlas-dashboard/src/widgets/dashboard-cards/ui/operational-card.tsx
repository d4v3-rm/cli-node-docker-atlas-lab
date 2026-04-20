import { ArrowRightOutlined, CompassOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Col, Flex, Row, Tag, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import {
  dashboardIconMap,
  dashboardToneStyles,
  resolveToneLabel,
  type ServiceCardViewModel,
  type WorkbenchCardViewModel
} from '@/entities/dashboard';
import type { BriefingReference } from '@/shared/types';
import { atlasDashboardPalette } from '@/shared/theme/atlas-theme';
import {
  ActionButton,
  monoFontFamily,
  overlineStyle,
  surfaceCardStyle
} from '@/shared/ui';

const { Paragraph, Text, Title } = Typography;

interface OperationalCardProps {
  briefing?: BriefingReference;
  item: ServiceCardViewModel | WorkbenchCardViewModel;
  onOpenBriefing?: (briefing: BriefingReference) => void;
  primaryAction?: { href: string; label: string };
  tone: ServiceCardViewModel['tone'];
}

export function OperationalCard({
  briefing,
  item,
  onOpenBriefing,
  primaryAction,
  tone
}: OperationalCardProps) {
  const { t } = useTranslation();
  const palette = dashboardToneStyles[tone];
  const IconGlyph = dashboardIconMap[item.icon];

  return (
    <Card
      style={{ ...surfaceCardStyle, height: '100%', overflow: 'hidden' }}
      styles={{ body: { padding: 0 } }}
    >
      <Flex
        align="center"
        gap={16}
        justify="space-between"
        style={{
          background: atlasDashboardPalette.panelAlt,
          padding: 20
        }}
        wrap="wrap"
      >
        <Flex align="center" gap={16}>
          <Button
            icon={<IconGlyph />}
            shape="circle"
            size="large"
            type="text"
            style={{
              background: palette.soft,
              color: palette.accent,
              flexShrink: 0,
              height: 52,
              width: 52
            }}
          />
          <Flex vertical gap={2}>
            <Title level={4} style={{ letterSpacing: '-0.04em', lineHeight: 1, margin: 0 }}>
              {item.title}
            </Title>
            <Text style={{ color: atlasDashboardPalette.muted }}>{item.status}</Text>
          </Flex>
        </Flex>
        <Tag
          color={palette.accent}
          style={{
            background: palette.soft,
            fontWeight: 700,
            marginInlineEnd: 0
          }}
        >
          {resolveToneLabel(t, tone)}
        </Tag>
      </Flex>

      <Flex vertical gap={18} style={{ padding: 20 }}>
        <Paragraph style={{ color: atlasDashboardPalette.muted, lineHeight: 1.78, margin: 0 }}>
          {item.description}
        </Paragraph>

        <Row gutter={[12, 12]}>
          {item.credentials.map((credential) => {
            const useMono =
              credential.value.includes(':') ||
              credential.value.includes('@') ||
              credential.value.includes('/') ||
              credential.value.includes('\\');

            return (
              <Col
                key={`${item.id}-${credential.label}`}
                md={item.credentials.length > 1 ? 12 : 24}
                span={24}
              >
                <Card
                  size="small"
                  style={{
                    background: atlasDashboardPalette.panelAlt,
                    borderRadius: 20,
                    height: '100%'
                  }}
                  styles={{ body: { padding: 16 } }}
                >
                  <Flex vertical gap={8}>
                    <Text style={overlineStyle}>{credential.label}</Text>
                    <Text
                      style={{
                        fontFamily: useMono ? monoFontFamily : undefined,
                        lineHeight: 1.8,
                        overflowWrap: 'anywhere'
                      }}
                    >
                      {credential.value}
                    </Text>
                  </Flex>
                </Card>
              </Col>
            );
          })}
        </Row>

        <Flex gap={12} wrap="wrap">
          {primaryAction ? (
            <ActionButton
              href={primaryAction.href}
              icon={ArrowRightOutlined}
              label={primaryAction.label}
              tone="brand"
            />
          ) : null}
          {briefing && onOpenBriefing ? (
            <ActionButton
              icon={CompassOutlined}
              label={t('cards.openBriefing')}
              onClick={() => onOpenBriefing(briefing)}
              tone="outline"
            />
          ) : null}
        </Flex>

        {item.note ? (
          <Alert
            description={item.note}
            message={null}
            showIcon={false}
            style={{
              background: palette.soft,
              borderRadius: 20
            }}
            type="info"
          />
        ) : null}
      </Flex>
    </Card>
  );
}
