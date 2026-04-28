import {
  ArrowRightOutlined,
  CheckOutlined,
  CompassOutlined,
  CopyOutlined,
  EyeInvisibleOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { Alert, Button, Card, Col, Flex, Row, Tag, Tooltip, Typography } from 'antd';
import { useState } from 'react';
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
  atlasDashboardCardLayoutStyles,
  createAtlasDashboardToneCardStyles
} from '@/shared/theme/dashboard-visual-styles';
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
  const [revealedCredentials, setRevealedCredentials] = useState<Record<string, boolean>>({});
  const [copiedCredentials, setCopiedCredentials] = useState<Record<string, boolean>>({});
  const palette = dashboardToneStyles[tone];
  const toneVisuals = createAtlasDashboardToneCardStyles(palette);
  const IconGlyph = dashboardIconMap[item.icon];

  const handleCopyCredential = async (credentialKey: string, value: string) => {
    if (!navigator.clipboard) {
      return;
    }

    await navigator.clipboard.writeText(value);
    setCopiedCredentials((current) => ({
      ...current,
      [credentialKey]: true
    }));
    window.setTimeout(() => {
      setCopiedCredentials((current) => ({
        ...current,
        [credentialKey]: false
      }));
    }, 1600);
  };

  return (
    <Card
      style={{
        ...surfaceCardStyle,
        ...atlasDashboardCardLayoutStyles.fullHeightShell,
        ...toneVisuals.shell
      }}
      styles={{
        body: atlasDashboardCardLayoutStyles.fullHeightBody
      }}
    >
      <Flex
        align="center"
        gap={16}
        justify="space-between"
        style={toneVisuals.header}
        wrap="wrap"
      >
        <Flex align="center" gap={16}>
          <Button
            icon={<IconGlyph />}
            shape="circle"
            size="large"
            type="text"
            style={{
              ...toneVisuals.iconButton,
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
          style={toneVisuals.softTag}
        >
          {resolveToneLabel(t, tone)}
        </Tag>
      </Flex>

      <Flex
        gap={18}
        style={atlasDashboardCardLayoutStyles.content}
        vertical
      >
        <Paragraph style={{ color: atlasDashboardPalette.muted, lineHeight: 1.78, margin: 0 }}>
          {item.description}
        </Paragraph>

        <Row gutter={[12, 12]}>
          {item.credentials.map((credential) => {
            const credentialKey = `${item.id}-${credential.label}`;
            const isRevealed = Boolean(revealedCredentials[credentialKey]);
            const isCopied = Boolean(copiedCredentials[credentialKey]);
            const displayedValue =
              credential.concealed && !isRevealed
                ? maskCredentialValue(credential.value)
                : credential.value;
            const useMono =
              credential.value.includes(':') ||
              credential.value.includes('@') ||
              credential.value.includes('/') ||
              credential.value.includes('\\');

            return (
              <Col
                key={credentialKey}
                md={item.credentials.length > 1 ? 12 : 24}
                span={24}
              >
                <Card
                  size="small"
                  style={toneVisuals.subSurface}
                  styles={{ body: atlasDashboardCardLayoutStyles.nestedBody }}
                >
                  <Flex vertical gap={8}>
                    <Flex align="center" justify="space-between" gap={8}>
                      <Text style={overlineStyle}>{credential.label}</Text>
                      <Flex align="center" gap={4}>
                        {credential.concealed ? (
                          <Tooltip
                            title={
                              isRevealed
                                ? t('cards.hideCredential')
                                : t('cards.revealCredential')
                            }
                          >
                            <Button
                              aria-label={
                                isRevealed
                                  ? t('cards.hideCredential')
                                  : t('cards.revealCredential')
                              }
                              icon={isRevealed ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                              onClick={() =>
                                setRevealedCredentials((current) => ({
                                  ...current,
                                  [credentialKey]: !current[credentialKey]
                                }))
                              }
                              size="small"
                              style={{
                                color: palette.accent
                              }}
                              type="text"
                            />
                          </Tooltip>
                        ) : null}
                        <Tooltip
                          title={
                            isCopied ? t('cards.copiedCredential') : t('cards.copyCredential')
                          }
                        >
                          <Button
                            aria-label={
                              isCopied ? t('cards.copiedCredential') : t('cards.copyCredential')
                            }
                            icon={isCopied ? <CheckOutlined /> : <CopyOutlined />}
                            onClick={() =>
                              void handleCopyCredential(credentialKey, credential.value)
                            }
                            size="small"
                            style={{
                              color: palette.accent
                            }}
                            type="text"
                          />
                        </Tooltip>
                      </Flex>
                    </Flex>
                    <Text
                      style={{
                        color: atlasDashboardPalette.white,
                        fontFamily: useMono ? monoFontFamily : undefined,
                        lineHeight: 1.8,
                        overflowWrap: 'anywhere'
                      }}
                    >
                      {displayedValue}
                    </Text>
                  </Flex>
                </Card>
              </Col>
            );
          })}
        </Row>

        {item.note ? (
          <Alert
            description={item.note}
            message={null}
            showIcon={false}
            style={toneVisuals.note}
            type="info"
          />
        ) : null}

        <Flex gap={12} style={atlasDashboardCardLayoutStyles.actionRow} wrap="wrap">
          {primaryAction ? (
            <ActionButton
              href={primaryAction.href}
              icon={ArrowRightOutlined}
              label={primaryAction.label}
              palette={palette}
              tone="brand"
            />
          ) : null}
          {briefing && onOpenBriefing ? (
            <ActionButton
              icon={CompassOutlined}
              label={t('cards.openBriefing')}
              onClick={() => onOpenBriefing(briefing)}
              palette={palette}
              tone="outline"
            />
          ) : null}
        </Flex>
      </Flex>
    </Card>
  );
}

function maskCredentialValue(value: string) {
  const maskLength = Math.max(8, Math.min(value.trim().length, 18));

  return '*'.repeat(maskLength);
}
