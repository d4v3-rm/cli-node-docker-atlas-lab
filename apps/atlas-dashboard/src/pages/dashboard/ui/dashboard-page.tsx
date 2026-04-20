import { Col, Flex, Layout, Row } from 'antd';
import { useTranslation } from 'react-i18next';
import { BriefingDialog } from '@/features/briefing';
import { LanguageSelectCard } from '@/features/language';
import { NetworkMapDialog } from '@/features/network-map';
import { atlasDashboardPalette } from '@/shared/theme/atlas-theme';
import {
  HeroSection
} from '@/widgets/dashboard-hero';
import {
  InsightCard,
  OperationalCard
} from '@/widgets/dashboard-cards';
import {
  LayerStateCard,
  SectionBand
} from '@/widgets/dashboard-panels';
import { LayerSwitcher } from '@/widgets/dashboard-switcher';
import { LayerRail } from '@/widgets/dashboard-overview';
import { StatusScreen } from '@/widgets/dashboard-status';
import { useDashboardPageState } from '@/pages/dashboard/model/use-dashboard-page-state';

const { Content } = Layout;

export function DashboardPage() {
  const { t } = useTranslation();
  const {
    activeBriefing,
    config,
    dashboard,
    error,
    isNetworkMapOpen,
    isLoading,
    networkGraph,
    selectedLayer,
    setActiveBriefing,
    setIsNetworkMapOpen,
    setSelectedLayer
  } = useDashboardPageState();

  const showCoreLayer = selectedLayer === 'all' || selectedLayer === 'core';
  const showAiLayer = selectedLayer === 'all' || selectedLayer === 'ai';
  const showWorkbenchLayer = selectedLayer === 'all' || selectedLayer === 'workbench';

  if (isLoading) {
    return (
      <StatusScreen
        eyebrow={t('status.eyebrow')}
        summary={t('status.loadingSummary')}
        title={t('status.loadingTitle')}
      />
    );
  }

  if (error || !config || !dashboard) {
    return (
      <StatusScreen
        eyebrow={t('status.eyebrow')}
        summary={error ?? t('status.missingConfig')}
        title={t('status.errorTitle')}
        tone="error"
      />
    );
  }

  return (
    <>
      <Layout
        style={{
          background: atlasDashboardPalette.bg,
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
              <LanguageSelectCard />
            </Flex>

            <Row gutter={[24, 24]}>
              <Col xs={24}>
                <HeroSection
                  certificateUrl={config.assets.certificateUrl}
                  eyebrow={dashboard.hero.eyebrow}
                  onOpenNetworkMap={() => setIsNetworkMapOpen(true)}
                  pills={dashboard.hero.pills}
                  summary={dashboard.hero.summary}
                  titleLines={dashboard.hero.titleLines}
                />
              </Col>
            </Row>

            <Row gutter={[24, 24]}>
              <Col xs={24} style={{ display: 'flex' }}>
                <LayerRail
                  aiLayer={dashboard.aiLayer}
                  aiServicesCount={dashboard.aiServices.length}
                  coreServicesCount={dashboard.services.length}
                  workbenchCount={dashboard.workbenches.length}
                  workbenchLayer={dashboard.workbenchLayer}
                />
              </Col>
            </Row>

            <Row gutter={[24, 24]}>
              <Col xs={24}>
                <LayerSwitcher
                  onChange={setSelectedLayer}
                  value={selectedLayer}
                />
              </Col>
            </Row>

            {showCoreLayer ? (
              <>
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
              </>
            ) : null}

            {showAiLayer ? (
              <>
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
                <Row gutter={[24, 24]}>
                  {dashboard.aiServices.map((service) => (
                    <Col xs={24} xl={12} key={service.id}>
                      <OperationalCard
                        item={service}
                        primaryAction={dashboard.aiLayer.enabled ? service.action : undefined}
                        tone={service.tone}
                      />
                    </Col>
                  ))}
                </Row>
              </>
            ) : null}

            {showWorkbenchLayer ? (
              <>
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
              </>
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
      {networkGraph ? (
        <NetworkMapDialog
          graph={networkGraph}
          onClose={() => setIsNetworkMapOpen(false)}
          open={isNetworkMapOpen}
          source={dashboard.networkMap}
        />
      ) : null}
    </>
  );
}
