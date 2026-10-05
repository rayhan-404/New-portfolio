"use client";

import { useCallback, useEffect, useState } from "react";
import { journey, type Era } from "@/lib/portfolio-data";
import {
  DEFAULT_CONTACT,
  DEFAULT_HERO,
  DEFAULT_PROJECTS,
  DEFAULT_SKILLS,
  type BioParagraph,
  type ContactContent,
  type CustomProject,
  type DesignSettings,
  type HeroContent,
  type SkillsContent,
} from "@/lib/site-defaults";

/* ═══════════════════════════════════════════════════════════════
   Client-side readers for the admin panel's data. Every hook
   renders the static defaults until the fetch lands, so the site
   works with zero backend and re-renders live when the admin saves
   (a "mr-site-data" window event triggers a refetch).
   ═══════════════════════════════════════════════════════════════ */

export const SITE_DATA_EVENT = "mr-site-data";

/** Fire after any admin save → all hooks refetch. */
export function emitSiteDataChanged(): void {
  window.dispatchEvent(new Event(SITE_DATA_EVENT));
}

function useSiteDataEvent(refetch: () => void) {
  useEffect(() => {
    window.addEventListener(SITE_DATA_EVENT, refetch);
    return () => window.removeEventListener(SITE_DATA_EVENT, refetch);
  }, [refetch]);
}

/* ── Journey stops ────────────────────────────────────────────── */

export interface Stop extends Era {
  id?: string;
}

function rowToStop(r: Record<string, unknown>): Stop {
  return {
    id: typeof r.id === "string" ? r.id : undefined,
    period: String(r.period ?? ""),
    title: String(r.title ?? ""),
    icon: String(r.icon ?? "rocket"),
    place: String(r.place ?? ""),
    location: r.location ? String(r.location) : undefined,
    description: String(r.description ?? ""),
    tag: String(r.tag ?? ""),
    degree: r.degree ? String(r.degree) : undefined,
    current: Boolean(r.current),
  };
}

/** Journey timeline stops — static defaults until the API answers. */
export function useJourneyStops(): { stops: Stop[]; ready: boolean } {
  const [stops, setStops] = useState<Stop[]>(() => journey as Stop[]);
  const [ready, setReady] = useState(false);

  const refetch = useCallback(async () => {
    try {
      const res = await fetch("/api/journey", { cache: "no-store" });
      const data = (await res.json()) as { stops?: Record<string, unknown>[] };
      if (Array.isArray(data.stops) && data.stops.length > 0) {
        setStops(data.stops.map(rowToStop));
      }
    } catch {
      /* keep current (defaults) */
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await Promise.resolve();
      if (!cancelled) await refetch();
    })();
    return () => {
      cancelled = true;
    };
  }, [refetch]);
  useSiteDataEvent(refetch);

  return { stops, ready };
}

/* ── Design + hero content ────────────────────────────────────── */

export interface SiteContent {
  design: DesignSettings;
  hero: HeroContent;
  projects: CustomProject[];
  contact: ContactContent;
  skills: SkillsContent;
}

const FALLBACK: SiteContent = {
  design: { accent: "mono", theme: "dark" },
  hero: DEFAULT_HERO,
  projects: DEFAULT_PROJECTS,
  contact: DEFAULT_CONTACT,
  skills: DEFAULT_SKILLS,
};

export function useSiteContent(): SiteContent {
  const [content, setContent] = useState<SiteContent>(FALLBACK);

  const refetch = useCallback(async () => {
    try {
      const res = await fetch("/api/site-settings", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as Partial<SiteContent>;
      if (
        data.design ||
        data.hero ||
        data.projects ||
        data.contact ||
        data.skills
      ) {
        setContent((prev) => ({
          design: { ...prev.design, ...(data.design ?? {}) },
          hero: {
            ...prev.hero,
            ...(data.hero ?? {}),
            paragraphs:
              Array.isArray(data.hero?.paragraphs) &&
              data.hero!.paragraphs.length > 0
                ? data.hero!.paragraphs
                : prev.hero.paragraphs,
          },
          projects: Array.isArray(data.projects) ? data.projects : prev.projects,
          contact: data.contact
            ? {
                ...prev.contact,
                ...data.contact,
                socials:
                  Array.isArray(data.contact.socials) &&
                  data.contact.socials.length > 0
                    ? data.contact.socials
                    : prev.contact.socials,
              }
            : prev.contact,
          skills: data.skills
            ? {
                focus:
                  Array.isArray(data.skills.focus) && data.skills.focus.length > 0
                    ? data.skills.focus
                    : prev.skills.focus,
                groups:
                  Array.isArray(data.skills.groups) && data.skills.groups.length > 0
                    ? data.skills.groups
                    : prev.skills.groups,
                learning: Array.isArray(data.skills.learning)
                  ? data.skills.learning
                  : prev.skills.learning,
              }
            : prev.skills,
        }));
      }
    } catch {
      /* keep current */
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await Promise.resolve();
      if (!cancelled) await refetch();
    })();
    return () => {
      cancelled = true;
    };
  }, [refetch]);
  useSiteDataEvent(refetch);

  return content;
}

/* ── Project flags ────────────────────────────────────────────── */

export interface Flags {
  [id: string]: { hidden: boolean; featured: boolean };
}

export function useProjectFlags(): Flags {
  const [flags, setFlags] = useState<Flags>({});

  const refetch = useCallback(async () => {
    try {
      const res = await fetch("/api/project-flags", { cache: "no-store" });
      const data = (await res.json()) as { flags?: Flags };
      if (data.flags && typeof data.flags === "object") setFlags(data.flags);
    } catch {
      /* keep current */
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await Promise.resolve();
      if (!cancelled) await refetch();
    })();
    return () => {
      cancelled = true;
    };
  }, [refetch]);
  useSiteDataEvent(refetch);

  return flags;
}

/* ── Bio renderer ─────────────────────────────────────────────── */

const EMOJI_SPLIT =
  /(\p{Extended_Pictographic}(?:\uFE0F|\u200D\p{Extended_Pictographic})*)/u;
const EMOJI_TEST = /^\p{Extended_Pictographic}/u;

/**
 * Render one admin-edited paragraph: **bold** spans, emojis wrapped
 * in .emoji-mono (grayscaled under the mono theme), optional
 * first-letter dropcap.
 */
export function RichBio({
  paragraph,
  dropcap = false,
}: {
  paragraph: BioParagraph;
  dropcap?: boolean;
}) {
  let text = paragraph.text;
  let cap: string | null = null;
  if (dropcap && text.length > 0) {
    cap = text[0];
    text = text.slice(1);
  }

  return (
    <>
      {cap && <span className="dropcap">{cap}</span>}
      {text.split("**").map((chunk, i) => {
        const bold = i % 2 === 1;
        return (
          <span
            key={i}
            className={bold ? "font-semibold text-foreground" : undefined}
          >
            {chunk.split(EMOJI_SPLIT).map((piece, j) =>
              piece && EMOJI_TEST.test(piece) ? (
                <span key={j} className="emoji-mono">
                  {piece}
                </span>
              ) : (
                piece
              )
            )}
          </span>
        );
      })}
    </>
  );
}
