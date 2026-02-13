import type { PointerEvent } from 'react';

/**
 * Updates the hero glow variables based on the current pointer position.
 */
export function useHeroGlow() {
  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    const hero = event.currentTarget;
    const rect = hero.getBoundingClientRect();
    const offsetX = (event.clientX - rect.left) / rect.width - 0.5;
    const offsetY = (event.clientY - rect.top) / rect.height - 0.5;

    hero.style.setProperty('--glow-x', `${50 + offsetX * 18}%`);
    hero.style.setProperty('--glow-y', `${38 + offsetY * 14}%`);
  };

  const handlePointerLeave = (event: PointerEvent<HTMLElement>) => {
    event.currentTarget.style.setProperty('--glow-x', '50%');
    event.currentTarget.style.setProperty('--glow-y', '38%');
  };

  return {
    handlePointerLeave,
    handlePointerMove
  };
}
