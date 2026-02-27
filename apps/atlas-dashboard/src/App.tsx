import type { ComponentType, CSSProperties } from 'react';
import { useState } from 'react';
import {
  ApiOutlined,
  ArrowRightOutlined,
  BranchesOutlined,
  CloudServerOutlined,
  CodeOutlined,
  CompassOutlined,
  DatabaseOutlined,
  FlagOutlined,
  GlobalOutlined,
  LockOutlined,
  NodeIndexOutlined,
  RobotOutlined,
  SafetyCertificateOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';
import {
  Alert,
  Button,
  Card,
  Col,
  Divider,
  Flex,
  Layout,
  Row,
  Select,
  Tag,
  Typography
} from 'antd';
import { useTranslation } from 'react-i18next';
import { BriefingDialog } from '@/components/briefing-dialog';
import { dashboardLanguages, resolveDashboardLanguage } from '@/i18n';
import { useLabConfig } from '@/hooks/use-lab-config';
import { createDashboardViewModel } from '@/models/dashboard-model';
import { atlasDashboardPalette } from '@/theme/atlas-theme';
import type {
  BriefingActionItem,
  DashboardIconKey,
  DashboardTone,
  HeroLinkActionItem,
  ServiceCardViewModel,
  WorkbenchCardViewModel
} from '@/types/dashboard.types';
import type { BriefingReference } from '@/types/briefing.types';

const { Content } = Layout;
const { Link, Paragraph, Text, Title } = Typography;

type DashboardIconComponent = ComponentType<{
  className?: string;
  style?: CSSProperties;
}>;

const iconMap: Record<DashboardIconKey, DashboardIconComponent> = {
  ai: ApiOutlined,
  certificate: SafetyCertificateOutlined,
  cpp: CodeOutlined,
  forge: BranchesOutlined,
  host: GlobalOutlined,
  network: NodeIndexOutlined,
  node: CodeOutlined,
  ollama: CloudServerOutlined,
  openWebUi: RobotOutlined,
  postgres: DatabaseOutlined,
  route: CompassOutlined,
  secure: LockOutlined,
  spark: ThunderboltOutlined,
  terminal: CodeOutlined,
  workflow: BranchesOutlined
};

const toneStyles: Record<
  DashboardTone,
  { accent: string; border: string; soft: string }
> = {
  ai: {
    accent: atlasDashboardPalette.ai,
    border: 'rgba(199, 122, 63, 0.22)',
    soft: 'rgba(199, 122, 63, 0.10)'
  },
  core: {
    accent: atlasDashboardPalette.core,
    border: 'rgba(22, 124, 115, 0.22)',
    soft: 'rgba(22, 124, 115, 0.10)'
  },
  neutral: {
    accent: atlasDashboardPalette.signal,
    border: 'rgba(47, 95, 138, 0.18)',
    soft: 'rgba(47, 95, 138, 0.08)'
  },
  workbench: {
    accent: atlasDashboardPalette.workbench,
    border: 'rgba(53, 106, 152, 0.22)',
    soft: 'rgba(53, 106, 152, 0.10)'
  }
};

const surfaceCardStyle: CSSProperties = {
  background: atlasDashboardPalette.panel,
  border: `1px solid ${atlasDashboardPalette.line}`,
  borderRadius: 28,
  boxShadow: '0 14px 32px rgba(16, 33, 39, 0.07)'
};

const cardBodyPadding = {
  body: {
    padding: 24
  }
} as const;

const overlineStyle: CSSProperties = {
  color: atlasDashboardPalette.muted,
  display: 'block',
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: '0.18em',
  textTransform: 'uppercase'
};

export default function App() {
  const { config, error, isLoading } = useLabConfig();
  const { t } = useTranslation();
  const [activeBriefing, setActiveBriefing] = useState<BriefingReference | null>(null);

  if (isLoading) {
    return (
      <StatusScreen
        eyebrow={t('status.eyebrow')}
        summary={t('status.loadingSummary')}
        title={t('status.loadingTitle')}
      />
    );
  }

  if (error || !config) {
    return (
      <StatusScreen
        eyebrow={t('status.eyebrow')}
        summary={error ?? t('status.missingConfig')}
        title={t('status.errorTitle')}
        tone="error"
      />
    );
  }

  const dashboard = createDashboardViewModel(config, t);

  return (
    <>
      <Layout
        style={{
          background:
            `radial-gradient(circle at top left, rgba(18, 119, 109, 0.16), transparent 28%), radial-gradient(circle at 88% 10%, rgba(191, 113, 54, 0.16), transparent 24%), linear-gradient(180deg, #f7faf7 0%, ${atlasDashboardPalette.bg} 100%)`,
          minHeight: '100vh'
        }}
      >
        <Content
          style={{
            margin: '0 auto',
            maxWidth: 1360,
            padding: '24px 24px 48px',
            width: '100%'
          }}
        >
          <Flex vertical gap={32}>
            <Flex justify="flex-end">
              <LanguageSelect />
            </Flex>

            <Row align="stretch" gutter={[24, 24]}>
              <Col xs={24} xl={15}>
                <HeroSection
                  certificateUrl={config.assets.certificateUrl}
                  eyebrow={dashboard.hero.eyebrow}
                  networkMap={dashboard.networkMap}
                  onOpenBriefing={setActiveBriefing}
                  pills={dashboard.hero.pills}
                  summary={dashboard.hero.summary}
                  titleLines={dashboard.hero.titleLines}
                />
              </Col>
              <Col xs={24} xl={9}>
                <Flex vertical gap={18}>
                  <StatsRail metrics={dashboard.hero.metrics} />
                  <LayerRail
                    aiLayer={dashboard.aiLayer}
                    workbenchLayer={dashboard.workbenchLayer}
                  />
                  <QuickRail
                    accessNotes={dashboard.accessNotes}
                    onOpenBriefing={setActiveBriefing}
                    quickActions={dashboard.hero.quickActions}
                  />
                </Flex>
              </Col>
            </Row>

            <Row gutter={[24, 24]}>
              <Col xs={24} lg={12}>
                <IntelPanel
                  eyebrow={t('panels.operatingDoctrineEyebrow')}
                  icon="route"
                  items={dashboard.operatingCharter}
                  title={t('panels.operatingDoctrineTitle')}
                  tone="core"
                />
              </Col>
              <Col xs={24} lg={12}>
                <IntelPanel
                  eyebrow={t('panels.accessNotesEyebrow')}
                  icon="certificate"
                  items={dashboard.accessNotes}
                  title={t('panels.accessNotesTitle')}
                  tone="neutral"
                />
              </Col>
            </Row>

            <SectionBand
              body={t('sections.servicesBody')}
              kicker={t('sections.servicesKicker')}
              title={t('sections.servicesTitle')}
            />
            <Row gutter={[24, 24]}>
              {dashboard.services.map((service) => (
                <Col xs={24} xl={12} key={service.id}>
                  <OperationalCard
                    item={service}
                    primaryAction={service.action}
                    tone={service.tone}
                  />
                </Col>
              ))}
            </Row>

            <SectionBand
              body={t(
                dashboard.aiLayer.enabled
                  ? 'sections.aiBodyEnabled'
                  : 'sections.aiBodyDisabled'
              )}
              kicker={t('sections.aiKicker')}
              title={t('sections.aiTitle')}
            />
            <LayerStateCard layer={dashboard.aiLayer} />
            {dashboard.aiLayer.enabled ? (
              <Row gutter={[24, 24]}>
                {dashboard.aiServices.map((service) => (
                  <Col xs={24} xl={12} key={service.id}>
                    <OperationalCard
                      item={service}
                      primaryAction={service.action}
                      tone={service.tone}
                    />
                  </Col>
                ))}
              </Row>
            ) : null}

            <SectionBand
              body={t(
                dashboard.workbenchLayer.enabled
                  ? 'sections.workbenchBodyEnabled'
                  : 'sections.workbenchBodyDisabled'
              )}
              kicker={t('sections.workbenchKicker')}
              title={t('sections.workbenchTitle')}
            />
            <LayerStateCard layer={dashboard.workbenchLayer} />
            {dashboard.workbenchLayer.enabled ? (
              <Row gutter={[24, 24]}>
                {dashboard.workbenches.map((workbench) => (
                  <Col xs={24} md={12} xl={8} key={workbench.id}>
                    <OperationalCard
                      briefing={workbench.briefing}
                      item={workbench}
                      onOpenBriefing={setActiveBriefing}
                      primaryAction={workbench.action}
                      tone={workbench.tone}
                    />
                  </Col>
                ))}
              </Row>
            ) : null}

            <SectionBand
              body={t('sections.footerBody')}
              kicker={t('sections.footerKicker')}
              title={t('sections.footerTitle')}
            />
            <Row gutter={[18, 18]}>
              {dashboard.footerCards.map((card) => (
                <Col xs={24} md={12} xl={6} key={card.id}>
                  <InsightCard body={card.body} icon={card.icon} label={card.label} />
                </Col>
              ))}
            </Row>
          </Flex>
        </Content>
      </Layout>

      <BriefingDialog
        briefing={activeBriefing}
        onClose={() => setActiveBriefing(null)}
      />
    </>
  );
}

function StatusScreen({
  eyebrow,
  summary,
  title,
  tone = 'default'
}: {
  eyebrow: string;
  summary: string;
  title: string;
  tone?: 'default' | 'error';
}) {
  const { t } = useTranslation();
  const accent = tone === 'error' ? '#b24a3a' : atlasDashboardPalette.core;

  return (
    <Layout
      style={{
        alignItems: 'center',
        background:
          `linear-gradient(180deg, #f7faf7 0%, ${atlasDashboardPalette.bg} 100%)`,
        justifyContent: 'center',
        minHeight: '100vh',
        padding: 24
      }}
    >
      <Card
        style={{ ...surfaceCardStyle, maxWidth: 720, width: '100%' }}
        styles={{ body: { padding: 32 } }}
      >
        <Flex vertical gap={16}>
          <Text style={overlineStyle}>{eyebrow}</Text>
          <Title
            level={1}
            style={{
              fontSize: 'clamp(2.4rem, 5vw, 4.5rem)',
              letterSpacing: '-0.06em',
              lineHeight: 0.92,
              margin: 0,
              maxWidth: 480
            }}
          >
            {title}
          </Title>
          <Paragraph
            style={{
              color: atlasDashboardPalette.muted,
              fontSize: 18,
              lineHeight: 1.75,
              margin: 0
            }}
          >
            {summary}
          </Paragraph>
          <Tag
            color={accent}
            style={{
              alignSelf: 'flex-start',
              background: `${accent}1A`,
              border: 'none',
              fontWeight: 700,
              marginInlineEnd: 0,
              padding: '6px 14px',
              textTransform: 'uppercase'
            }}
          >
            {t('status.runtimeBadge')}
          </Tag>
        </Flex>
      </Card>
    </Layout>
  );
}

function LanguageSelect() {
  const { i18n, t } = useTranslation();
  const currentLanguage =
    resolveDashboardLanguage(i18n.resolvedLanguage ?? i18n.language) ?? 'it';

  const handleLanguageChange = (value: string) => {
    const nextLanguage = resolveDashboardLanguage(value);

    if (!nextLanguage || nextLanguage === currentLanguage) {
      return;
    }

    void i18n.changeLanguage(nextLanguage);
  };

  return (
    <Card style={{ ...surfaceCardStyle, minWidth: 240 }} styles={{ body: { padding: 16 } }}>
      <Flex align="center" gap={12}>
        <Button
          icon={<FlagOutlined />}
          shape="circle"
          size="large"
          type="text"
          style={{
            background: 'rgba(47, 95, 138, 0.10)',
            color: atlasDashboardPalette.signal
          }}
        />
        <Flex vertical gap={4} style={{ flex: 1 }}>
          <Text style={overlineStyle}>{t('language.selectorLabel')}</Text>
          <Select
            aria-label={t('language.ariaLabel')}
            onChange={handleLanguageChange}
            options={dashboardLanguages.map((language) => ({
              label: t(`language.options.${language}`),
              value: language
            }))}
            value={currentLanguage}
          />
        </Flex>
      </Flex>
    </Card>
  );
}

function HeroSection({
  certificateUrl,
  eyebrow,
  networkMap,
  onOpenBriefing,
  pills,
  summary,
  titleLines
}: {
  certificateUrl: string;
  eyebrow: string;
  networkMap: BriefingReference;
  onOpenBriefing: (briefing: BriefingReference) => void;
  pills: { icon: DashboardIconKey; label: string; tone: DashboardTone }[];
  summary: string;
  titleLines: string[];
}) {
  const { t } = useTranslation();

  return (
    <Card
      style={{
        ...surfaceCardStyle,
        background: `linear-gradient(135deg, ${atlasDashboardPalette.coreDark} 0%, ${atlasDashboardPalette.core} 54%, ${atlasDashboardPalette.ai} 100%)`,
        border: 'none',
        overflow: 'hidden'
      }}
      styles={{ body: { padding: 32 } }}
    >
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={15}>
          <Flex vertical justify="space-between" gap={32} style={{ minHeight: 420 }}>
            <Flex vertical gap={24}>
              <Text style={{ ...overlineStyle, color: 'rgba(247, 250, 248, 0.72)' }}>
                {eyebrow}
              </Text>
              <Flex vertical gap={4}>
                {titleLines.map((line) => (
                  <Title
                    key={line}
                    level={1}
                    style={{
                      color: atlasDashboardPalette.white,
                      fontSize: 'clamp(3.4rem, 8vw, 6.5rem)',
                      letterSpacing: '-0.08em',
                      lineHeight: 0.82,
                      margin: 0
                    }}
                  >
                    {line}
                  </Title>
                ))}
              </Flex>
              <Paragraph
                style={{
                  color: 'rgba(247, 250, 248, 0.86)',
                  fontSize: 22,
                  lineHeight: 1.55,
                  margin: 0,
                  maxWidth: 560
                }}
              >
                {summary}
              </Paragraph>
            </Flex>

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

        <Col xs={24} lg={9}>
          <Card
            style={{
              background: 'rgba(14, 44, 50, 0.38)',
              border: '1px solid rgba(247, 250, 248, 0.14)',
              borderRadius: 28,
              height: '100%'
            }}
            styles={{ body: { padding: 24 } }}
          >
            <Flex vertical gap={24} style={{ height: '100%' }}>
              <Flex vertical gap={14}>
                <Text style={{ ...overlineStyle, color: 'rgba(247, 250, 248, 0.72)' }}>
                  {t('hero.actionsEyebrow')}
                </Text>
                <Title
                  level={3}
                  style={{
                    color: atlasDashboardPalette.white,
                    lineHeight: 1.08,
                    margin: 0
                  }}
                >
                  {t('hero.actionsTitle')}
                </Title>
                <Paragraph
                  style={{
                    color: 'rgba(247, 250, 248, 0.76)',
                    lineHeight: 1.7,
                    margin: 0
                  }}
                >
                  {t('hero.actionsSummary')}
                </Paragraph>
              </Flex>
              <Flex vertical gap={12}>
                <ActionButton
                  icon={NodeIndexOutlined}
                  label={t('hero.openNetworkMap')}
                  onClick={() => onOpenBriefing(networkMap)}
                  tone="solid"
                />
                <ActionButton
                  href={certificateUrl}
                  icon={SafetyCertificateOutlined}
                  label={t('hero.downloadCertificate')}
                  tone="ghost"
                />
              </Flex>
            </Flex>
          </Card>
        </Col>
      </Row>
    </Card>
  );
}

function StatsRail({
  metrics
}: {
  metrics: { caption: string; label: string; value: number }[];
}) {
  const { t } = useTranslation();

  return (
    <Card style={surfaceCardStyle} styles={cardBodyPadding}>
      <Flex vertical gap={16}>
        <Text style={overlineStyle}>{t('rails.liveFootprint')}</Text>
        <Row gutter={[14, 14]}>
          {metrics.map((metric) => (
            <Col xs={12} md={6} xl={12} key={metric.label}>
              <Card
                size="small"
                style={{
                  background: atlasDashboardPalette.panelAlt,
                  border: `1px solid ${atlasDashboardPalette.line}`,
                  borderRadius: 20,
                  height: '100%'
                }}
                styles={{ body: { padding: 16 } }}
              >
                <Flex vertical gap={8}>
                  <Text style={overlineStyle}>{metric.label}</Text>
                  <Title level={2} style={{ letterSpacing: '-0.05em', lineHeight: 1, margin: 0 }}>
                    {metric.value}
                  </Title>
                  <Paragraph style={{ color: atlasDashboardPalette.muted, lineHeight: 1.6, margin: 0 }}>
                    {metric.caption}
                  </Paragraph>
                </Flex>
              </Card>
            </Col>
          ))}
        </Row>
      </Flex>
    </Card>
  );
}

function LayerRail({
  aiLayer,
  workbenchLayer
}: {
  aiLayer: { enabled: boolean; summary: string; tone: DashboardTone };
  workbenchLayer: { enabled: boolean; summary: string; tone: DashboardTone };
}) {
  const { t } = useTranslation();

  return (
    <Card style={surfaceCardStyle} styles={cardBodyPadding}>
      <Flex vertical gap={16}>
        <Text style={overlineStyle}>{t('rails.layerHeartbeat')}</Text>
        <Flex vertical gap={12}>
          <LayerSummaryTile
            enabled
            summary={t('dashboard.coreLayerSummary')}
            title={t('cards.tones.core')}
            tone="core"
          />
          <LayerSummaryTile
            enabled={aiLayer.enabled}
            summary={aiLayer.summary}
            title={t('cards.tones.ai')}
            tone={aiLayer.tone}
          />
          <LayerSummaryTile
            enabled={workbenchLayer.enabled}
            summary={workbenchLayer.summary}
            title={t('cards.tones.workbench')}
            tone={workbenchLayer.tone}
          />
        </Flex>
      </Flex>
    </Card>
  );
}

function QuickRail({
  accessNotes,
  onOpenBriefing,
  quickActions
}: {
  accessNotes: string[];
  onOpenBriefing: (briefing: BriefingReference) => void;
  quickActions: (HeroLinkActionItem | BriefingActionItem)[];
}) {
  const { t } = useTranslation();

  return (
    <Card style={surfaceCardStyle} styles={cardBodyPadding}>
      <Flex vertical gap={16}>
        <Text style={overlineStyle}>{t('rails.briefingsAndLinks')}</Text>
        <Flex vertical gap={12}>
          {quickActions.map((action) => {
            const IconGlyph = iconMap[action.icon];

            return (
              <Card
                key={action.label}
                size="small"
                style={{
                  background: atlasDashboardPalette.panelAlt,
                  border: `1px solid ${atlasDashboardPalette.line}`,
                  borderRadius: 20
                }}
                styles={{ body: { padding: 16 } }}
              >
                <Flex align="flex-start" gap={16}>
                  <Button
                    icon={<IconGlyph />}
                    shape="circle"
                    size="large"
                    type="text"
                    style={{
                      background: 'rgba(47, 95, 138, 0.12)',
                      color: atlasDashboardPalette.signal,
                      flexShrink: 0
                    }}
                  />
                  <Flex vertical gap={4} style={{ minWidth: 0 }}>
                    <Text strong>{action.label}</Text>
                    {'href' in action ? (
                      <Link href={action.href} rel="noreferrer" target="_blank">
                        {action.description}
                      </Link>
                    ) : (
                      <Link onClick={() => onOpenBriefing(action.briefing)}>
                        {action.description}
                      </Link>
                    )}
                  </Flex>
                </Flex>
              </Card>
            );
          })}
        </Flex>

        <Divider style={{ margin: 0 }} />

        <Flex vertical gap={12}>
          {accessNotes.slice(0, 2).map((note) => (
            <Alert
              description={note}
              key={note}
              message={null}
              showIcon={false}
              style={{
                background: atlasDashboardPalette.panelAlt,
                border: `1px solid ${atlasDashboardPalette.line}`,
                borderRadius: 20
              }}
              type="info"
            />
          ))}
        </Flex>
      </Flex>
    </Card>
  );
}

function LayerSummaryTile({
  enabled,
  summary,
  title,
  tone
}: {
  enabled: boolean;
  summary: string;
  title: string;
  tone: DashboardTone;
}) {
  const { t } = useTranslation();
  const palette = toneStyles[tone];
  const IconGlyph =
    tone === 'ai' ? ApiOutlined : tone === 'workbench' ? CodeOutlined : ThunderboltOutlined;

  return (
    <Card
      size="small"
      style={{
        background: palette.soft,
        border: `1px solid ${palette.border}`,
        borderRadius: 20
      }}
      styles={{ body: { padding: 16 } }}
    >
      <Flex align="flex-start" gap={16}>
        <Button
          icon={<IconGlyph />}
          shape="circle"
          size="large"
          type="text"
          style={{
            background: `${palette.accent}22`,
            color: palette.accent,
            flexShrink: 0
          }}
        />
        <Flex vertical gap={8} style={{ minWidth: 0 }}>
          <Flex align="center" gap={8} wrap="wrap">
            <Text strong style={{ fontSize: 18 }}>
              {title}
            </Text>
            <Tag
              color={palette.accent}
              style={{
                background: `${palette.accent}22`,
                border: 'none',
                fontWeight: 700,
                marginInlineEnd: 0
              }}
            >
              {enabled ? t('layerSummary.active') : t('layerSummary.optional')}
            </Tag>
          </Flex>
          <Paragraph style={{ color: atlasDashboardPalette.muted, lineHeight: 1.7, margin: 0 }}>
            {summary}
          </Paragraph>
        </Flex>
      </Flex>
    </Card>
  );
}

function IntelPanel({
  eyebrow,
  icon,
  items,
  title,
  tone
}: {
  eyebrow: string;
  icon: DashboardIconKey;
  items: string[];
  title: string;
  tone: DashboardTone;
}) {
  const palette = toneStyles[tone];
  const IconGlyph = iconMap[icon];

  return (
    <Card style={{ ...surfaceCardStyle, height: '100%' }} styles={{ body: { padding: 24 } }}>
      <Flex vertical gap={20}>
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
              height: 56,
              width: 56
            }}
          />
          <Flex vertical gap={4}>
            <Text style={overlineStyle}>{eyebrow}</Text>
            <Title level={3} style={{ letterSpacing: '-0.04em', lineHeight: 1, margin: 0 }}>
              {title}
            </Title>
          </Flex>
        </Flex>
        <Flex vertical gap={12}>
          {items.map((item) => (
            <Flex align="flex-start" gap={12} key={item}>
              <Tag
                color={palette.accent}
                style={{
                  background: palette.accent,
                  border: 'none',
                  borderRadius: 999,
                  height: 10,
                  marginInlineEnd: 0,
                  marginTop: 8,
                  minWidth: 10,
                  padding: 0
                }}
              />
              <Paragraph style={{ color: atlasDashboardPalette.muted, lineHeight: 1.8, margin: 0 }}>
                {item}
              </Paragraph>
            </Flex>
          ))}
        </Flex>
      </Flex>
    </Card>
  );
}

function SectionBand({ body, kicker, title }: { body: string; kicker: string; title: string }) {
  return (
    <Row align="bottom" gutter={[24, 12]}>
      <Col xs={24} lg={10}>
        <Flex vertical gap={6}>
          <Text style={overlineStyle}>{kicker}</Text>
          <Title level={2} style={{ letterSpacing: '-0.05em', lineHeight: 0.98, margin: 0 }}>
            {title}
          </Title>
        </Flex>
      </Col>
      <Col xs={24} lg={14}>
        <Paragraph
          style={{
            color: atlasDashboardPalette.muted,
            fontSize: 18,
            lineHeight: 1.78,
            margin: 0,
            maxWidth: 760
          }}
        >
          {body}
        </Paragraph>
      </Col>
    </Row>
  );
}

function LayerStateCard({
  layer
}: {
  layer: {
    activationCommand: string;
    capabilities: { icon: DashboardIconKey; label: string }[];
    description: string;
    enabled: boolean;
    summary: string;
    title: string;
    tone: DashboardTone;
  };
}) {
  const { t } = useTranslation();
  const palette = toneStyles[layer.tone];
  const IconGlyph = layer.tone === 'ai' ? ApiOutlined : CodeOutlined;

  return (
    <Card
      style={{
        ...surfaceCardStyle,
        background: `linear-gradient(135deg, ${palette.soft} 0%, ${atlasDashboardPalette.panel} 100%)`
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
                  background: `${palette.accent}22`,
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
              border: `1px solid ${palette.border}`,
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
                    background: `${palette.accent}22`,
                    border: 'none',
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
                      fontFamily: `"SFMono-Regular", Consolas, monospace`,
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

function OperationalCard({
  briefing,
  item,
  onOpenBriefing,
  primaryAction,
  tone
}: {
  briefing?: BriefingReference;
  item: ServiceCardViewModel | WorkbenchCardViewModel;
  onOpenBriefing?: (briefing: BriefingReference) => void;
  primaryAction?: { href: string; label: string };
  tone: DashboardTone;
}) {
  const { t } = useTranslation();
  const palette = toneStyles[tone];
  const IconGlyph = iconMap[item.icon];

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
          background: `linear-gradient(135deg, ${palette.soft} 0%, rgba(247, 250, 248, 0) 100%)`,
          borderBottom: `1px solid ${palette.border}`,
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
              background: `${palette.accent}22`,
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
            background: `${palette.accent}22`,
            border: 'none',
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
                    border: `1px solid ${palette.border}`,
                    borderRadius: 20,
                    height: '100%'
                  }}
                  styles={{ body: { padding: 16 } }}
                >
                  <Flex vertical gap={8}>
                    <Text style={overlineStyle}>{credential.label}</Text>
                    <Text
                      style={{
                        fontFamily: useMono
                          ? `"SFMono-Regular", Consolas, monospace`
                          : undefined,
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
              border: `1px solid ${palette.border}`,
              borderRadius: 20
            }}
            type="info"
          />
        ) : null}
      </Flex>
    </Card>
  );
}

function InsightCard({
  body,
  icon,
  label
}: {
  body: string;
  icon: DashboardIconKey;
  label: string;
}) {
  const IconGlyph = iconMap[icon];

  return (
    <Card style={{ ...surfaceCardStyle, height: '100%' }} styles={{ body: { padding: 20 } }}>
      <Flex vertical gap={14}>
        <Button
          icon={<IconGlyph />}
          shape="circle"
          size="large"
          type="text"
          style={{
            background: 'rgba(47, 95, 138, 0.10)',
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

function ActionButton({
  href,
  icon,
  label,
  onClick,
  tone
}: {
  href?: string;
  icon: DashboardIconComponent;
  label: string;
  onClick?: () => void;
  tone: 'brand' | 'ghost' | 'outline' | 'solid';
}) {
  const IconGlyph = icon;
  const colors = {
    brand: {
      background: atlasDashboardPalette.core,
      border: atlasDashboardPalette.core,
      color: atlasDashboardPalette.white
    },
    ghost: {
      background: 'rgba(249, 252, 250, 0.10)',
      border: 'rgba(249, 252, 250, 0.16)',
      color: atlasDashboardPalette.white
    },
    outline: {
      background: atlasDashboardPalette.panelAlt,
      border: atlasDashboardPalette.border,
      color: atlasDashboardPalette.ink
    },
    solid: {
      background: 'rgba(249, 252, 250, 0.16)',
      border: 'rgba(249, 252, 250, 0.16)',
      color: atlasDashboardPalette.white
    }
  }[tone];

  return (
    <Button
      href={href}
      icon={<IconGlyph />}
      onClick={onClick}
      rel={href ? 'noreferrer' : undefined}
      size="large"
      style={{
        background: colors.background,
        border: `1px solid ${colors.border}`,
        color: colors.color,
        fontWeight: 700
      }}
      target={href ? '_blank' : undefined}
      type="default"
    >
      {label}
    </Button>
  );
}

function SignalPill({
  icon,
  label,
  tone
}: {
  icon: DashboardIconKey;
  label: string;
  tone: DashboardTone;
}) {
  const IconGlyph = iconMap[icon];
  const palette = toneStyles[tone];
  const capsuleBg =
    tone === 'core'
      ? 'rgba(18, 119, 109, 0.18)'
      : tone === 'ai'
        ? 'rgba(191, 113, 54, 0.18)'
        : tone === 'workbench'
          ? 'rgba(58, 111, 156, 0.18)'
          : 'rgba(249, 252, 250, 0.14)';
  const capsuleBorder =
    tone === 'neutral' ? 'rgba(249, 252, 250, 0.16)' : palette.border;

  return (
    <Tag
      color={atlasDashboardPalette.white}
      icon={<IconGlyph style={{ color: atlasDashboardPalette.white }} />}
      style={{
        background: capsuleBg,
        border: `1px solid ${capsuleBorder}`,
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

function resolveToneLabel(
  t: ReturnType<typeof useTranslation>['t'],
  tone: DashboardTone
) {
  return t(`cards.tones.${tone}`);
}
