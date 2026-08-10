import confetti from 'canvas-confetti';

// Confetti bursts for gamification moments (badge unlocks, level-ups) on the
// Profile page. Kept self-contained: no React, no other app imports.
//
// Every exported function bails out immediately if the user has OS-level
// "prefers-reduced-motion" enabled — some users rely on that setting for
// medical/vestibular reasons, so this is a hard requirement, not a nice-to-have.

export type CelebrationRarity = 'common' | 'rare' | 'epic' | 'legendary';

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Colors kept in sync with the badge glow colors used elsewhere for rarity — do not change.
const RARITY_COLORS: Record<CelebrationRarity, string[]> = {
  common: ['#9ca3af', '#d1d5db'],
  rare: ['#38bdf8', '#0ea5e9', '#7dd3fc'],
  epic: ['#c084fc', '#a855f7', '#e9d5ff'],
  legendary: ['#fbbf24', '#f59e0b', '#fde68a', '#ffffff'],
};

const LEVEL_UP_COLORS = [...RARITY_COLORS.legendary, '#f97316', '#facc15'];

function fireBurst(colors: string[], options: confetti.Options = {}): void {
  void confetti({
    origin: { y: 0.6 },
    disableForReducedMotion: true,
    colors,
    ...options,
  });
}

// Fires a confetti burst scaled by badge rarity: common is a small, quick
// sprinkle; legendary is a big, multi-burst, wide-spread celebration.
export function celebrateBadgeUnlock(rarity: CelebrationRarity): void {
  if (prefersReducedMotion()) return;

  const colors = RARITY_COLORS[rarity];

  switch (rarity) {
    case 'common':
      fireBurst(colors, { particleCount: 30, spread: 50, startVelocity: 30 });
      break;

    case 'rare':
      fireBurst(colors, { particleCount: 60, spread: 60, startVelocity: 40 });
      break;

    case 'epic':
      fireBurst(colors, { particleCount: 100, spread: 70, startVelocity: 45 });
      window.setTimeout(() => fireBurst(colors, { particleCount: 50, spread: 90, startVelocity: 35 }), 150);
      break;

    case 'legendary':
      fireBurst(colors, { particleCount: 180, spread: 100, startVelocity: 55 });
      window.setTimeout(() => fireBurst(colors, { particleCount: 90, spread: 120, startVelocity: 45, scalar: 1.1 }), 150);
      window.setTimeout(() => fireBurst(colors, { particleCount: 60, spread: 140, startVelocity: 35 }), 350);
      break;
  }
}

// A bigger, more dramatic effect than any single badge unlock — twin side
// cannons plus a center burst — because leveling up is the biggest moment
// in the system. Uses a warm/gold-leaning mixed palette.
export function celebrateLevelUp(): void {
  if (prefersReducedMotion()) return;

  fireBurst(LEVEL_UP_COLORS, { particleCount: 150, spread: 110, startVelocity: 55, origin: { y: 0.6 } });

  window.setTimeout(() => {
    fireBurst(LEVEL_UP_COLORS, { particleCount: 80, angle: 60, spread: 65, startVelocity: 55, origin: { x: 0, y: 0.65 } });
    fireBurst(LEVEL_UP_COLORS, { particleCount: 80, angle: 120, spread: 65, startVelocity: 55, origin: { x: 1, y: 0.65 } });
  }, 200);

  window.setTimeout(() => {
    fireBurst(LEVEL_UP_COLORS, { particleCount: 100, spread: 160, startVelocity: 40, scalar: 1.15 });
  }, 450);
}
