import { MetricCard } from '@/components/metric-card';
import { useHeroGlow } from '@/hooks/use-hero-glow';
import type { HeroSectionProps } from '@/types/dashboard.types';

/**
 * Renders the top-level Atlas Lab hero, charter and access notes.
 */
export function HeroSection({
  accessNotes,
  certificateUrl,
  eyebrow,
  metrics,
  networkMap,
  onOpenBriefing,
  operatingCharter,
  pills,
  summary,
  titleLines
}: HeroSectionProps) {
  const { handlePointerLeave, handlePointerMove } = useHeroGlow();

  return (
    <section className="hero" onPointerLeave={handlePointerLeave} onPointerMove={handlePointerMove}>
      <span className="eyebrow">{eyebrow}</span>

      <div className="hero-grid">
        <div>
          <h1 className="headline">
            {titleLines.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </h1>

          <p className="hero-copy">{summary}</p>

          <div className="hero-strip">
            {pills.map((pill) => (
              <span className="pill" key={pill.label}>
                <pill.icon />
                {pill.label}
              </span>
            ))}
          </div>

          <div className="stat-grid">
            {metrics.map((metric) => (
              <MetricCard key={metric.label} metric={metric} />
            ))}
          </div>
        </div>

        <div className="hero-aside">
          <div className="aside-card" data-reveal>
            <p className="aside-title">operating charter</p>
            <div className="aside-meta">
              {operatingCharter.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </div>
          </div>

          <div className="aside-card" data-reveal>
            <p className="aside-title">access notes</p>
            <div className="aside-meta">
              {accessNotes.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </div>

            <div className="card-actions card-actions--spaced">
              <button
                className="ghost-button"
                onClick={() => onOpenBriefing(networkMap)}
                type="button"
              >
                apri network map
              </button>

              <a className="button" href={certificateUrl} rel="noreferrer" target="_blank">
                scarica certificato
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
