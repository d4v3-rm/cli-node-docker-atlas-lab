import { useEffect, useState } from 'react';
import type { MetricCardProps } from '@/types/dashboard.types';

/**
 * Animates a single metric value once the card mounts.
 */
export function MetricCard({ metric }: MetricCardProps) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const durationMs = 1200;
    const startedAt = performance.now();
    let frameId = 0;

    const tick = (timestamp: number) => {
      const elapsed = timestamp - startedAt;
      const progress = Math.min(elapsed / durationMs, 1);
      setValue(Math.round(metric.value * progress));

      if (progress < 1) {
        frameId = window.requestAnimationFrame(tick);
      }
    };

    frameId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [metric.value]);

  return (
    <div className="stat" data-reveal>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{metric.label}</div>
    </div>
  );
}
