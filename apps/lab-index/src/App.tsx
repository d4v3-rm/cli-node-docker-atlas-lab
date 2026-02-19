import { useState } from 'react';
import { BriefingModal } from '@/components/briefing-modal';
import { FooterCard } from '@/components/footer-card';
import { HeroSection } from '@/components/hero-section';
import { SectionHeader } from '@/components/section-header';
import { ServiceCard } from '@/components/service-card';
import { WorkbenchCard } from '@/components/workbench-card';
import { useLabConfig } from '@/hooks/use-lab-config';
import { useRevealOnScroll } from '@/hooks/use-reveal-on-scroll';
import { createDashboardViewModel } from '@/models/dashboard-model';
import type { BriefingReference } from '@/types/briefing.types';

/**
 * Renders the Atlas Lab graphical index served by the gateway.
 */
export default function App() {
  const { config, error, isLoading } = useLabConfig();
  const [activeBriefing, setActiveBriefing] = useState<BriefingReference | null>(null);

  useRevealOnScroll(!isLoading && !error && Boolean(config));

  if (isLoading) {
    return (
      <main className="status-screen">
        <div className="status-panel">
          <span className="eyebrow">atlas control index</span>
          <h1>Caricamento deck</h1>
          <p>Sto caricando la configurazione runtime del lab e il catalogo servizi.</p>
        </div>
      </main>
    );
  }

  if (error || !config) {
    return (
      <main className="status-screen">
        <div className="status-panel status-panel--error">
          <span className="eyebrow">atlas control index</span>
          <h1>Deck non disponibile</h1>
          <p>{error ?? 'La configurazione runtime del lab non e disponibile.'}</p>
        </div>
      </main>
    );
  }

  const dashboard = createDashboardViewModel(config);

  return (
    <>
      <div className="backdrop-orb backdrop-orb--left" />
      <div className="backdrop-orb backdrop-orb--right" />

      <main className="deck">
        <HeroSection
          accessNotes={dashboard.accessNotes}
          certificateUrl={config.assets.certificateUrl}
          eyebrow={dashboard.hero.eyebrow}
          metrics={dashboard.hero.metrics}
          networkMap={dashboard.networkMap}
          onOpenBriefing={setActiveBriefing}
          operatingCharter={dashboard.operatingCharter}
          pills={dashboard.hero.pills}
          summary={dashboard.hero.summary}
          titleLines={dashboard.hero.titleLines}
        />

        <section className="section">
          <SectionHeader
            body="Il core del lab resta sempre attivo: repository, automazione e deck operativo. Ogni card mostra credenziali e accesso diretto ai target di base."
            kicker="service catalog"
            title="Servizi Core"
          />

          <div className="service-grid">
            {dashboard.services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </section>

        <section className="section">
          <SectionHeader
            body={
              dashboard.aiLayer.enabled
                ? 'Il layer AI e attivo: puoi entrare in Open WebUI o usare Ollama via gateway protetto.'
                : 'Il layer AI e opzionale. Quando non e attivo, il deck mostra il comando di attivazione invece di fingere che i servizi siano online.'
            }
            kicker="ai layer"
            title="Servizi AI"
          />

          {dashboard.aiLayer.enabled ? (
            <div className="service-grid">
              {dashboard.aiServices.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          ) : (
            <article className="layer-panel" data-reveal>
              <strong>{dashboard.aiLayer.title}</strong>
              <p>{dashboard.aiLayer.description}</p>
              <code>{dashboard.aiLayer.activationCommand}</code>
            </article>
          )}
        </section>

        <section className="section">
          <SectionHeader
            body={
              dashboard.workbenchLayer.enabled
                ? 'Il layer workbench e attivo: dal deck apri i briefing locali e poi raggiungi gli ambienti browser-based.'
                : 'Gli ambienti restano opzionali e isolati dal core. Attivali solo quando ti serve Postgres o un workspace code-server.'
            }
            kicker="workbench layer"
            title="Ambienti Di Sviluppo"
          />

          {dashboard.workbenchLayer.enabled ? (
            <div className="workbench-grid">
              {dashboard.workbenches.map((workbench) => (
                <WorkbenchCard
                  key={workbench.id}
                  onOpenBriefing={setActiveBriefing}
                  workbench={workbench}
                />
              ))}
            </div>
          ) : (
            <article className="layer-panel" data-reveal>
              <strong>{dashboard.workbenchLayer.title}</strong>
              <p>{dashboard.workbenchLayer.description}</p>
              <code>{dashboard.workbenchLayer.activationCommand}</code>
            </article>
          )}
        </section>

        <section className="footer-bar">
          {dashboard.footerCards.map((card) => (
            <FooterCard card={card} key={card.id} />
          ))}
        </section>
      </main>

      <BriefingModal briefing={activeBriefing} onClose={() => setActiveBriefing(null)} />
    </>
  );
}
