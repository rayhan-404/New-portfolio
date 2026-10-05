/**
 * Admin open channel — a 20-line module so the gear button can ask
 * for the control room WITHOUT statically importing the 1,700-line
 * AdminPanel (which next/dynamic then ships as an on-demand chunk).
 *
 * Event name kept identical to the pre-v93 constant ("mr-open-admin").
 */

export const ADMIN_OPEN_EVENT = "mr-open-admin";

/* Sticky pending flag — when the panel's chunk is still loading, the
   dispatch can fire before the panel has attached its listener. The
   panel consumes this flag on mount so the summon is never lost. */
let pendingOpen = false;

/** Nav-rail hook: dispatch this to open the panel from anywhere. */
export function openAdminPanel(): void {
  pendingOpen = true;
  window.dispatchEvent(new Event(ADMIN_OPEN_EVENT));
}

/** ?admin=1 deep link — should the panel mount immediately? */
export function wantsAdminDeepLink(): boolean {
  try {
    return new URLSearchParams(window.location.search).get("admin") === "1";
  } catch {
    return false;
  }
}

/** Panel-side: true once after openAdminPanel() was called. */
export function consumePendingOpen(): boolean {
  const p = pendingOpen;
  pendingOpen = false;
  return p;
}
