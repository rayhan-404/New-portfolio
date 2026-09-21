"use client";

/**
 * Fixed ambient scene behind everything: the premium fiery mobile-app
 * gradient (user-provided art direction) + cinematic film grain.
 * Purely decorative — pointer-events disabled, sits at negative z-index.
 */
export function AppBackground() {
  return (
    <>
      <div className="app-background" aria-hidden="true" />
      <div className="app-grain" aria-hidden="true" />
    </>
  );
}
