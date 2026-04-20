import { NodeIndexOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { Col, Flex, Row, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { SignalPill, type DashboardIconKey, type DashboardTone } from '@/entities/dashboard';
import { ActionButton, overlineStyle } from '@/shared/ui';
import { atlasDashboardPalette } from '@/shared/theme/atlas-theme';

const { Paragraph, Text, Title } = Typography;

interface HeroSectionProps {
  certificateUrl: string;
  eyebrow: string;
  onOpenNetworkMap: () => void;
  pills: { icon: DashboardIconKey; label: string; tone: DashboardTone }[];
  summary: string;
  titleLines: string[];
}

export function HeroSection({
  certificateUrl,
  eyebrow,
  onOpenNetworkMap,
  pills,
  summary,
  titleLines
}: HeroSectionProps) {
  const { t } = useTranslation();

  return (
    <section
      style={{
        padding: '18px 0 12px'
      }}
    >
      <Row
        align="middle"
        gutter={[40, 36]}
        style={{
          minHeight: 400
        }}
      >
        <Col xs={24} lg={16}>
          <Flex vertical gap={28}>
            <Flex align="center" gap={18} wrap="wrap">
              <Flex align="center" gap={12}>
                <span
                  aria-hidden
                  style={{
                    background: atlasDashboardPalette.core,
                    borderRadius: '50%',
                    display: 'block',
                    height: 10,
                    width: 10
                  }}
                />
                <Text style={{ ...overlineStyle, color: 'rgba(247, 250, 248, 0.72)' }}>
                  {eyebrow}
                </Text>
              </Flex>
            </Flex>

            <Flex vertical gap={8}>
              {titleLines.map((line) => (
                <Title
                  key={line}
                  level={1}
                  style={{
                    color: atlasDashboardPalette.white,
                    fontSize: 'clamp(3.6rem, 8vw, 7rem)',
                    letterSpacing: '-0.09em',
                    lineHeight: 0.8,
                    margin: 0
                  }}
                >
                  {line}
                </Title>
              ))}
            </Flex>

            <Paragraph
              style={{
                color: 'rgba(247, 250, 248, 0.88)',
                fontSize: 22,
                lineHeight: 1.62,
                margin: 0,
                maxWidth: 760
              }}
            >
              {summary}
            </Paragraph>

            <Flex wrap="wrap" gap={12}>
              {pills.map((pill) => (
                <SignalPill
                  icon={pill.icon}
                  key={pill.label}
                  label={pill.label}
                  tone={pill.tone}
                />
              ))}
            </Flex>
          </Flex>
        </Col>

        <Col xs={24} lg={8}>
          <Flex
            style={{
              height: '100%',
              paddingLeft: 28
            }}
            vertical
          >
            <Flex
              justify="space-between"
              style={{
                flex: 1,
                minHeight: 300,
                paddingTop: 10
              }}
              vertical
            >
              <Flex vertical gap={12}>
                <ActionButton
                  block
                  icon={NodeIndexOutlined}
                  label={t('hero.openNetworkMap')}
                  onClick={onOpenNetworkMap}
                  style={{
                    justifyContent: 'center',
                    minHeight: 56
                  }}
                  tone="solid"
                />
                <ActionButton
                  block
                  href={certificateUrl}
                  icon={SafetyCertificateOutlined}
                  label={t('hero.downloadCertificate')}
                  style={{
                    justifyContent: 'center',
                    minHeight: 56
                  }}
                  tone="ghost"
                />
              </Flex>
            </Flex>
          </Flex>
        </Col>
      </Row>
    </section>
  );
}
