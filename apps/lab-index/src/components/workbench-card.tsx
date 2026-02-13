import type { WorkbenchCardProps } from '@/types/dashboard.types';

/**
 * Renders an optional workbench or infrastructure companion card.
 */
export function WorkbenchCard({ onOpenBriefing, workbench }: WorkbenchCardProps) {
  return (
    <article className="workbench-card" data-reveal>
      <div className="workbench-top">
        <div className="icon-box">
          <workbench.icon />
        </div>
        <span className="service-status">{workbench.status}</span>
      </div>

      <h3>{workbench.title}</h3>
      <p>{workbench.description}</p>

      <div className="credential-grid">
        {workbench.credentials.map((credential) => (
          <div className="credential" key={`${workbench.id}-${credential.label}`}>
            <span>{credential.label}</span>
            <span>{credential.value}</span>
          </div>
        ))}
      </div>

      <div className="card-actions">
        <button className="ghost-button" onClick={() => onOpenBriefing(workbench.briefing)} type="button">
          apri briefing
        </button>
      </div>

      {workbench.note ? <p className="service-note">{workbench.note}</p> : null}
    </article>
  );
}
