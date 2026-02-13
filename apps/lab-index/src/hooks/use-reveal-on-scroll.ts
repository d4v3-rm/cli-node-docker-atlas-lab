import { useEffect } from 'react';

/**
 * Adds a one-shot reveal class to cards as they enter the viewport.
 */
export function useRevealOnScroll(enabled: boolean) {
  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const revealTargets = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
    if (revealTargets.length === 0) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.14
      }
    );

    revealTargets.forEach((target) => observer.observe(target));

    return () => {
      observer.disconnect();
    };
  }, [enabled]);
}
