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
            body="Ogni card spiega il servizio, mostra le credenziali root e apre direttamente il target operativo sul proprio endpoint localhost."
            kicker="service catalog"
            title="Servizi Attivi"
          />

          <div className="service-grid">
            {dashboard.services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </section>

        <section className="section">
          <SectionHeader
            body="Gli ambienti restano opzionali e vivono nel profilo Compose workbench. Dal deck apri un briefing locale che spiega scopo, accesso e credenziali."
            kicker="workbench layer"
            title="Ambienti Di Sviluppo"
          />

          <div className="workbench-grid">
            {dashboard.workbenches.map((workbench) => (
              <WorkbenchCard
                key={workbench.id}
                onOpenBriefing={setActiveBriefing}
                workbench={workbench}
              />
            ))}
          </div>
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
