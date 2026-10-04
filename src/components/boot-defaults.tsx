import { getDesign } from "@/lib/site-store";

/**
 * BootDefaults — server component rendered inside <head> BEFORE the
 * theme/accent bootstrap scripts. Reads the admin panel's design
 * settings and publishes them on `window` so the pre-paint scripts
 * can honour the configured defaults (a visitor's own saved choice
 * in localStorage still wins). DB failure falls back to the built-in
 * mono/dark face.
 */
export default async function BootDefaults() {
  let accent = "mono";
  let theme = "dark";
  try {
    const design = await getDesign();
    accent = design.accent;
    theme = design.theme;
  } catch {
    /* defaults */
  }
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `window.__MR_DEFAULT_ACCENT=${JSON.stringify(
          accent
        )};window.__MR_DEFAULT_THEME=${JSON.stringify(theme)};`,
      }}
    />
  );
}
