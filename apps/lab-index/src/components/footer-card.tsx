import type { FooterCardProps } from '@/types/dashboard.types';

/**
 * Renders a single footer insight card.
 */
export function FooterCard({ card }: FooterCardProps) {
  return (
    <article className="footer-card" data-reveal>
      <strong>{card.label}</strong>
      <span>{card.body}</span>
    </article>
  );
}
