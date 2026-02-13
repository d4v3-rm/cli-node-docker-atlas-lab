import type { SectionHeaderProps } from '@/types/dashboard.types';

/**
 * Shared section heading used by the catalog and workbench blocks.
 */
export function SectionHeader({ body, kicker, title }: SectionHeaderProps) {
  return (
    <div className="section-header">
      <div>
        <span className="section-tag">{kicker}</span>
        <h2>{title}</h2>
      </div>

      <p>{body}</p>
    </div>
  );
}
