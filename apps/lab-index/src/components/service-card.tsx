import type { ServiceCardProps } from '@/types/dashboard.types';

/**
 * Renders a core service card with direct access action.
 */
export function ServiceCard({ service }: ServiceCardProps) {
  return (
    <article className="service-card" data-reveal>
      <div className="service-top">
        <div className="icon-box">
          <service.icon />
        </div>
        <span className="service-status">{service.status}</span>
      </div>

      <h3>{service.title}</h3>
      <p>{service.description}</p>

      <div className="credential-grid">
        {service.credentials.map((credential) => (
          <div className="credential" key={`${service.id}-${credential.label}`}>
            <span>{credential.label}</span>
            <span>{credential.value}</span>
          </div>
        ))}
      </div>

      <div className="card-actions">
        <a className="button" href={service.action.href} rel="noreferrer" target="_blank">
          {service.action.label}
        </a>
      </div>

      {service.note ? <p className="service-note">{service.note}</p> : null}
    </article>
  );
}
