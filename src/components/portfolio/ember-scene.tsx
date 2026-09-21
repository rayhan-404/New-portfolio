"use client";

/**
 * Fixed ambient scene behind everything: warm ember glows + film grain.
 * Purely decorative — pointer-events disabled, sits at negative z-index.
 */
export function EmberScene() {
  return (
    <>
      <div className="ember-scene" aria-hidden="true" />
      <div className="ember-grain" aria-hidden="true" />
    </>
  );
}
