"use client";

import { useEffect } from "react";

/* ────────────────────────────────────────────────────────────────
   SPOTLIGHT — the v92 card recipe's tracking sheen.

   <Spotlight /> drops an invisible radial wash inside a card that
   follows the cursor. The card itself opts in with `spot-host group`
   (group-hover fades the wash in; the driver below feeds --mx/--my).
   Without the driver (touch devices, reduced JS) the wash rests at a
   gentle fixed position, so the hover still reads as a lift-glow.
   ──────────────────────────────────────────────────────────────── */

export function Spotlight() {
  return (
    <span
      aria-hidden="true"
      className="spot-light pointer-events-none absolute inset-0 z-[2] rounded-[inherit] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
    />
  );
}

/* One document-level listener feeds coordinates to whichever
   .spot-host the cursor is over — no per-card React state. */
export function SpotlightDriver() {
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    let raf = 0;
    const onMove = (e: MouseEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const host = (e.target as Element | null)?.closest?.(
          ".spot-host"
        ) as HTMLElement | null;
        if (!host) return;
        const r = host.getBoundingClientRect();
        host.style.setProperty("--mx", `${e.clientX - r.left}px`);
        host.style.setProperty("--my", `${e.clientY - r.top}px`);
      });
    };
    document.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      document.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);
  return null;
}
