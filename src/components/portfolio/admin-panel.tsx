"use client";

import { ADMIN_OPEN_EVENT, consumePendingOpen } from "./admin-open";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDown,
  ArrowUp,
  Check,
  Eye,
  EyeOff,
  FolderKanban,
  Github,
  Inbox,
  Loader2,
  Lock,
  Map,
  Palette,
  Phone,
  Plus,
  Save,
  Settings2,
  Trash2,
  UserRound,
  Wrench,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { playSound } from "@/lib/sound";
import { ACCENT_POOL, applyAccent } from "@/lib/accent-pool";
import {
  DEFAULT_PASSCODE,
  type BioParagraph,
  type ContactContent,
  type CustomProject,
  type HeroContent,
  type SkillsContent,
} from "@/lib/site-defaults";
import {
  emitSiteDataChanged,
  type Flags,
  type Stop,
} from "@/lib/use-site-data";

/* ═══════════════════════════════════════════════════════════════
   AdminPanel — the site's control room.

   Opens via  ?admin=1 , the nav-rail gear button, or Ctrl+Shift+A.
   Passcode-gated (first run: "rayhan" — change it in Design tab).
   Every save PUTs to the API with the passcode as x-admin-key and
   fires SITE_DATA_EVENT so the live site re-renders immediately.
   ═══════════════════════════════════════════════════════════════ */

const KEY_STORE = "mr-admin-key";
/* open channel lives in the tiny admin-open module so the nav rail
   never statically imports this whole panel (v93 chunk split) */
const OPEN_EVENT = ADMIN_OPEN_EVENT;

type TabId =
  | "design"
  | "hero"
  | "journey"
  | "projects"
  | "skills"
  | "contact"
  | "github"
  | "messages";

const TABS: { id: TabId; label: string; icon: typeof Palette }[] = [
  { id: "design", label: "Design", icon: Palette },
  { id: "hero", label: "Hero", icon: UserRound },
  { id: "journey", label: "Journey", icon: Map },
  { id: "projects", label: "Projects", icon: FolderKanban },
  { id: "skills", label: "Skills", icon: Wrench },
  { id: "contact", label: "Contact", icon: Phone },
  { id: "github", label: "GitHub", icon: Github },
  { id: "messages", label: "Messages", icon: Inbox },
];

const ICON_CHOICES = [
  "baby", "home", "shapes", "school", "book", "gradcap", "rocket",
] as const;

const PARA_STYLES: { value: BioParagraph["style"]; label: string }[] = [
  { value: "lead", label: "Lead (italic deck)" },
  { value: "body", label: "Body" },
  { value: "closing", label: "Closing (semibold)" },
];

/* ── tiny fetch helper with the admin header ──────────────────── */

function adminFetch(
  url: string,
  key: string,
  init?: RequestInit
): Promise<Response> {
  return fetch(url, {
    ...init,
    cache: "no-store",
    headers: {
      "content-type": "application/json",
      ...(init?.headers ?? {}),
      "x-admin-key": key,
    },
  });
}

/* ── shared field styling (site's own glass recipe) ───────────── */

const FIELD =
  "w-full rounded-xl border border-border bg-[var(--bg2)] px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary/50";

export function AdminPanel() {
  const [open, setOpen] = useState(false);
  const [key, setKey] = useState<string | null>(null);
  const [checkingKey, setCheckingKey] = useState(true);
  const [tab, setTab] = useState<TabId>("design");

  /* open triggers: ?admin=1, gear button event, Ctrl+Shift+A.
     v93: the panel now mounts lazily, so an open dispatch may land
     BEFORE this effect runs — consumePendingOpen() catches that. */
  useEffect(() => {
    if (
      new URLSearchParams(window.location.search).get("admin") === "1" ||
      consumePendingOpen()
    ) {
      queueMicrotask(() => setOpen(true));
    }
    const onOpen = () => setOpen(true);
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "a") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener(OPEN_EVENT, onOpen);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener(OPEN_EVENT, onOpen);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  /* restore a saved session on mount */
  useEffect(() => {
    (async () => {
      await Promise.resolve();
      const saved = sessionStorage.getItem(KEY_STORE);
      if (!saved) {
        setCheckingKey(false);
        return;
      }
      try {
        const res = await adminFetch("/api/admin/verify", saved);
        const data = (await res.json()) as { ok?: boolean };
        setKey(data.ok ? saved : null);
        if (!data.ok) sessionStorage.removeItem(KEY_STORE);
      } catch {
        /* stay logged out */
      }
      setCheckingKey(false);
    })();
  }, []);

  const login = async (candidate: string) => {
    const res = await fetch("/api/admin/verify", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ key: candidate }),
    });
    const data = (await res.json()) as { ok?: boolean };
    if (data.ok) {
      sessionStorage.setItem(KEY_STORE, candidate);
      setKey(candidate);
      playSound("chime");
      return true;
    }
    playSound("pop");
    return false;
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
          role="dialog"
          aria-label="Admin panel"
        >
          <motion.div
            initial={{ y: 28, opacity: 0, scale: 0.985 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.985 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-x-2 inset-y-2 sm:inset-4 lg:inset-x-[8%] lg:inset-y-[6%]"
          >
            <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-[var(--bg)] shadow-[var(--shadow-neu-lg)] md:rounded-3xl">
              {checkingKey ? (
                <div className="flex flex-1 items-center justify-center">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : !key ? (
                <LoginScreen onLogin={login} onClose={() => setOpen(false)} />
              ) : (
                <Shell
                  tab={tab}
                  setTab={setTab}
                  onClose={() => setOpen(false)}
                  adminKey={key}
                />
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ═══════════════ Login ═══════════════ */

function LoginScreen({
  onLogin,
  onClose,
}: {
  onLogin: (key: string) => Promise<boolean>;
  onClose: () => void;
}) {
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);

  return (
    <div className="relative flex flex-1 flex-col items-center justify-center gap-6 p-8">
      <button
        type="button"
        onClick={onClose}
        aria-label="Close admin panel"
        className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:text-foreground"
      >
        <X className="h-4 w-4" />
      </button>

      <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-[var(--bg2)] shadow-[var(--shadow-neu)]">
        <Lock className="h-5 w-5 text-primary" aria-hidden="true" />
      </span>
      <div className="text-center">
        <h2
          className="leading-[0.95] tracking-[-0.04em] text-foreground"
          style={{
            fontFamily: "var(--font-geist-sans), ui-sans-serif, sans-serif",
            fontWeight: 900,
            fontSize: "clamp(24px, 3vw, 34px)",
          }}
        >
          Admin panel
        </h2>
        <p className="font-tag mt-2 text-[10px] tracking-[0.25em] text-muted-foreground">
          PASSCODE REQUIRED
        </p>
      </div>

      <form
        className="flex w-full max-w-xs flex-col gap-3"
        onSubmit={async (e) => {
          e.preventDefault();
          if (busy) return;
          setBusy(true);
          const ok = await onLogin(value);
          setBusy(false);
          if (!ok) setError(true);
        }}
      >
        <Input
          type="password"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setError(false);
          }}
          placeholder="Passcode"
          aria-label="Admin passcode"
          aria-invalid={error}
          className="h-11 rounded-xl border-border bg-[var(--bg2)] text-center"
        />
        {error && (
          <p className="text-center text-[12px] font-medium text-(--err)">
            Wrong passcode — try again
          </p>
        )}
        <Button type="submit" disabled={busy || !value} className="h-11 rounded-xl">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Unlock"}
        </Button>
      </form>
      <p className="font-tag text-[9px] tracking-[0.2em] text-muted-foreground/70">
        FIRST RUN DEFAULT: {DEFAULT_PASSCODE.toUpperCase()} — CHANGE IT IN DESIGN
      </p>
    </div>
  );
}

/* ═══════════════ Shell ═══════════════ */

function Shell({
  tab,
  setTab,
  onClose,
  adminKey,
}: {
  tab: TabId;
  setTab: (t: TabId) => void;
  onClose: () => void;
  adminKey: string;
}) {
  const [savedFlash, setSavedFlash] = useState(false);
  const flash = useCallback(() => {
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1800);
  }, []);

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* header */}
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-[var(--bg2)]">
            <Settings2 className="h-4 w-4 text-primary" aria-hidden="true" />
          </span>
          <div>
            <p
              className="leading-none tracking-[-0.03em] text-foreground"
              style={{
                fontFamily: "var(--font-geist-sans), ui-sans-serif, sans-serif",
                fontWeight: 900,
                fontSize: "17px",
              }}
            >
              Control room
            </p>
            <p className="font-tag mt-1 text-[8.5px] tracking-[0.25em] text-muted-foreground">
              EVERYTHING ON THIS SITE, LIVE
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <AnimatePresence>
            {savedFlash && (
              <motion.span
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="font-tag flex items-center gap-1.5 rounded-full border border-(--success)/40 bg-(--success)/10 px-3 py-1.5 text-[9px] tracking-[0.2em] text-(--success-text)"
              >
                <Check className="h-3 w-3" /> SAVED
              </motion.span>
            )}
          </AnimatePresence>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close admin panel"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col sm:flex-row">
        {/* tabs */}
        <nav
          aria-label="Admin sections"
          className="flex shrink-0 gap-1 overflow-x-auto border-b border-border p-2 sm:w-44 sm:flex-col sm:overflow-y-auto sm:border-b-0 sm:border-r sm:p-3"
        >
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                playSound("tap");
                setTab(t.id);
              }}
              aria-current={tab === t.id}
              className={`flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-left text-[13px] font-medium transition-colors ${
                tab === t.id
                  ? "bg-[rgba(var(--primary-rgb)/0.12)] text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <t.icon
                className={`h-4 w-4 ${tab === t.id ? "text-primary" : ""}`}
                aria-hidden="true"
              />
              {t.label}
            </button>
          ))}
        </nav>

        {/* body */}
        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
          {tab === "design" && <DesignTab adminKey={adminKey} onSaved={flash} />}
          {tab === "hero" && <HeroTab adminKey={adminKey} onSaved={flash} />}
          {tab === "journey" && <JourneyTab adminKey={adminKey} onSaved={flash} />}
          {tab === "projects" && <ProjectsTab adminKey={adminKey} onSaved={flash} />}
          {tab === "skills" && <SkillsTab adminKey={adminKey} onSaved={flash} />}
          {tab === "contact" && <ContactTab adminKey={adminKey} onSaved={flash} />}
          {tab === "github" && <GithubTab adminKey={adminKey} onSaved={flash} />}
          {tab === "messages" && <MessagesTab adminKey={adminKey} />}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════ Design tab ═══════════════ */

function DesignTab({ adminKey, onSaved }: { adminKey: string; onSaved: () => void }) {
  const [accent, setAccent] = useState("mono");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [passcode, setPasscode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/site-settings", { cache: "no-store" });
        const data = (await res.json()) as {
          design?: { accent?: string; theme?: "dark" | "light" };
        };
        if (data.design) {
          setAccent(data.design.accent ?? "mono");
          setTheme(data.design.theme === "light" ? "light" : "dark");
        }
      } catch {
        /* defaults */
      }
    })();
  }, []);

  const save = async () => {
    setBusy(true);
    setError("");
    try {
      const body: Record<string, unknown> = {
        design: { accent, theme },
      };
      if (passcode.trim()) body.passcode = passcode.trim();
      const res = await adminFetch("/api/site-settings", adminKey, {
        method: "PUT",
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("save failed");
      playSound("chime");
      onSaved();
      setPasscode("");
    } catch {
      setError("Could not save — check the passcode and try again.");
      playSound("pop");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex max-w-xl flex-col gap-7">
      <Section
        title="Default accent"
        hint="What new visitors see on load. Click a swatch to preview it live — saving pins it as the boot default."
      >
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
          {ACCENT_POOL.map((hue, i) => (
            <button
              key={hue.id}
              type="button"
              onClick={() => {
                applyAccent(i);
                setAccent(hue.id);
                playSound("tap");
              }}
              aria-pressed={accent === hue.id}
              className={`group flex flex-col items-center gap-1.5 rounded-xl border p-2 transition-all ${
                accent === hue.id
                  ? "border-primary/60 bg-[rgba(var(--primary-rgb)/0.08)]"
                  : "border-border hover:border-primary/30"
              }`}
            >
              <span
                className="h-7 w-7 rounded-full border border-black/10 shadow-inner"
                style={{
                  background: `linear-gradient(135deg, ${hue.light[0]}, ${hue.light[2]})`,
                }}
                aria-hidden="true"
              />
              <span className="font-tag w-full truncate text-center text-[7.5px] tracking-[0.12em] text-muted-foreground">
                {hue.label}
              </span>
            </button>
          ))}
        </div>
      </Section>

      <Section title="Default theme" hint="Visitors who pick a theme themselves keep their choice.">
        <div className="flex gap-2">
          {(["dark", "light"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTheme(t)}
              aria-pressed={theme === t}
              className={`min-h-11 flex-1 rounded-xl border px-4 py-2.5 text-sm font-medium capitalize transition-colors ${
                theme === t
                  ? "border-primary/60 bg-[rgba(var(--primary-rgb)/0.08)] text-foreground"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Change passcode" hint="At least 4 characters. Leave blank to keep the current one.">
        <div className="flex gap-2">
          <Input
            type="password"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            placeholder="New passcode"
            className="h-11 rounded-xl border-border bg-[var(--bg2)]"
          />
        </div>
      </Section>

      <SaveBar busy={busy} error={error} onSave={save} />
    </div>
  );
}

/* ═══════════════ Hero tab ═══════════════ */

function HeroTab({ adminKey, onSaved }: { adminKey: string; onSaved: () => void }) {
  const [draft, setDraft] = useState<HeroContent | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/site-settings", { cache: "no-store" });
        const data = (await res.json()) as { hero?: HeroContent };
        if (data.hero) setDraft(data.hero);
      } catch {
        /* keep null */
      }
    })();
  }, []);

  if (!draft) return <LoadingBlock />;

  const set = (patch: Partial<HeroContent>) =>
    setDraft({ ...draft, ...patch });
  const setPara = (i: number, patch: Partial<BioParagraph>) =>
    set({
      paragraphs: draft.paragraphs.map((p, j) => (j === i ? { ...p, ...patch } : p)),
    });
  const movePara = (i: number, dir: -1 | 1) => {
    const next = [...draft.paragraphs];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    set({ paragraphs: next });
  };

  const save = async () => {
    setBusy(true);
    setError("");
    try {
      const res = await adminFetch("/api/site-settings", adminKey, {
        method: "PUT",
        body: JSON.stringify({ hero: draft }),
      });
      if (!res.ok) throw new Error();
      playSound("chime");
      onSaved();
      emitSiteDataChanged();
    } catch {
      setError("Could not save the hero content.");
      playSound("pop");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex max-w-2xl flex-col gap-7">
      <Section title="Identity" hint="The script wordmark, the big greeting and the photo nameplate.">
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Greeting">
            <Input value={draft.greeting} onChange={(e) => set({ greeting: e.target.value })} className={FIELD} />
          </Field>
          <Field label="Name">
            <Input value={draft.name} onChange={(e) => set({ name: e.target.value })} className={FIELD} />
          </Field>
          <Field label="Role line">
            <Input value={draft.role} onChange={(e) => set({ role: e.target.value })} className={FIELD} />
          </Field>
        </div>
      </Section>

      <Section
        title="Intro paragraphs"
        hint="**double stars make bold text** — emojis render automatically. Lead = italic deck, Closing = semibold."
      >
        <div className="flex flex-col gap-3">
          {draft.paragraphs.map((p, i) => (
            <div key={i} className="rounded-2xl border border-border bg-[var(--bg2)] p-3">
              <div className="mb-2 flex items-center gap-2">
                <select
                  value={p.style}
                  onChange={(e) =>
                    setPara(i, { style: e.target.value as BioParagraph["style"] })
                  }
                  aria-label={`Paragraph ${i + 1} style`}
                  className="font-tag rounded-lg border border-border bg-[var(--bg)] px-2.5 py-1.5 text-[10px] tracking-[0.1em] text-foreground outline-none"
                >
                  {PARA_STYLES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
                <div className="ml-auto flex items-center gap-1">
                  <MiniBtn label="Move up" onClick={() => movePara(i, -1)} disabled={i === 0}>
                    <ArrowUp className="h-3.5 w-3.5" />
                  </MiniBtn>
                  <MiniBtn
                    label="Move down"
                    onClick={() => movePara(i, 1)}
                    disabled={i === draft.paragraphs.length - 1}
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </MiniBtn>
                  <MiniBtn
                    label="Delete paragraph"
                    onClick={() =>
                      set({ paragraphs: draft.paragraphs.filter((_, j) => j !== i) })
                    }
                    danger
                    disabled={draft.paragraphs.length <= 1}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </MiniBtn>
                </div>
              </div>
              <Textarea
                value={p.text}
                onChange={(e) => setPara(i, { text: e.target.value })}
                rows={3}
                className="resize-y border-border bg-[var(--bg)] text-[13px] leading-relaxed"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() => set({ paragraphs: [...draft.paragraphs, { style: "body", text: "" }] })}
            className="font-tag flex min-h-11 items-center justify-center gap-2 rounded-xl border border-dashed border-border py-2.5 text-[10px] tracking-[0.2em] text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
          >
            <Plus className="h-3.5 w-3.5" /> ADD PARAGRAPH
          </button>
        </div>
      </Section>

      <SaveBar busy={busy} error={error} onSave={save} />
    </div>
  );
}

/* ═══════════════ Journey tab ═══════════════ */

function JourneyTab({ adminKey, onSaved }: { adminKey: string; onSaved: () => void }) {
  const [stops, setStops] = useState<Stop[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/journey", { cache: "no-store" });
        const data = (await res.json()) as { stops?: Stop[] };
        if (data.stops?.length) setStops(data.stops);
      } catch {
        /* keep null */
      }
    })();
  }, []);

  if (!stops) return <LoadingBlock />;

  const set = (i: number, patch: Partial<Stop>) =>
    setStops(stops.map((s, j) => (j === i ? { ...s, ...patch } : s)));
  const move = (i: number, dir: -1 | 1) => {
    const next = [...stops];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    setStops(next);
  };

  const save = async () => {
    setBusy(true);
    setError("");
    try {
      const res = await adminFetch("/api/journey", adminKey, {
        method: "PUT",
        body: JSON.stringify({
          stops: stops.map(({ id: _id, ...rest }) => rest),
        }),
      });
      const data = (await res.json()) as { stops?: Stop[] };
      if (!res.ok) throw new Error();
      if (data.stops?.length) setStops(data.stops);
      playSound("chime");
      onSaved();
      emitSiteDataChanged();
    } catch {
      setError("Could not save the journey — check every stop has a period + title.");
      playSound("pop");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <Section
        title="Timeline stops"
        hint="Drag order with the arrows. The newest stop renders last, before the 2028 'Loading…' node."
      >
        <div className="flex flex-col gap-4">
          {stops.map((s, i) => (
            <div key={s.id ?? i} className="rounded-2xl border border-border bg-[var(--bg2)] p-4">
              <div className="mb-3 flex items-center gap-2">
                <span className="font-tag flex h-7 w-7 items-center justify-center rounded-full bg-[rgba(var(--primary-rgb)/0.12)] text-[9px] text-foreground">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <select
                  value={s.icon}
                  onChange={(e) => set(i, { icon: e.target.value })}
                  aria-label={`Stop ${i + 1} icon`}
                  className="font-tag rounded-lg border border-border bg-[var(--bg)] px-2.5 py-1.5 text-[10px] text-foreground outline-none"
                >
                  {ICON_CHOICES.map((ic) => (
                    <option key={ic} value={ic}>
                      {ic}
                    </option>
                  ))}
                </select>
                <label className="font-tag ml-auto flex cursor-pointer items-center gap-2 text-[9px] tracking-[0.15em] text-muted-foreground">
                  CURRENT
                  <Switch
                    checked={Boolean(s.current)}
                    onCheckedChange={(v) => set(i, { current: v })}
                  />
                </label>
                <div className="flex items-center gap-1">
                  <MiniBtn label="Move up" onClick={() => move(i, -1)} disabled={i === 0}>
                    <ArrowUp className="h-3.5 w-3.5" />
                  </MiniBtn>
                  <MiniBtn label="Move down" onClick={() => move(i, 1)} disabled={i === stops.length - 1}>
                    <ArrowDown className="h-3.5 w-3.5" />
                  </MiniBtn>
                  <MiniBtn
                    label="Delete stop"
                    danger
                    disabled={stops.length <= 1}
                    onClick={() => setStops(stops.filter((_, j) => j !== i))}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </MiniBtn>
                </div>
              </div>
              <div className="grid gap-2.5 sm:grid-cols-2">
                <Field label="Period">
                  <Input value={s.period} onChange={(e) => set(i, { period: e.target.value })} className={FIELD} />
                </Field>
                <Field label="Title">
                  <Input value={s.title} onChange={(e) => set(i, { title: e.target.value })} className={FIELD} />
                </Field>
                <Field label="Sub-title (place)">
                  <Input value={s.place} onChange={(e) => set(i, { place: e.target.value })} className={FIELD} />
                </Field>
                <Field label="Location">
                  <Input
                    value={s.location ?? ""}
                    onChange={(e) => set(i, { location: e.target.value || undefined })}
                    className={FIELD}
                  />
                </Field>
                <Field label="Tag chip">
                  <Input value={s.tag} onChange={(e) => set(i, { tag: e.target.value })} className={FIELD} />
                </Field>
                <Field label="Degree (optional)">
                  <Input
                    value={s.degree ?? ""}
                    onChange={(e) => set(i, { degree: e.target.value || undefined })}
                    className={FIELD}
                  />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Description">
                    <Textarea
                      value={s.description}
                      onChange={(e) => set(i, { description: e.target.value })}
                      rows={2}
                      className="resize-y border-border bg-[var(--bg)] text-[13px]"
                    />
                  </Field>
                </div>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              setStops([
                ...stops,
                {
                  period: "20XX — 20XX",
                  title: "New chapter",
                  icon: "rocket",
                  place: "What happened",
                  description: "Tell the story…",
                  tag: "New stop",
                  location: undefined,
                  degree: undefined,
                  current: false,
                },
              ])
            }
            className="font-tag flex min-h-11 items-center justify-center gap-2 rounded-xl border border-dashed border-border py-2.5 text-[10px] tracking-[0.2em] text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
          >
            <Plus className="h-3.5 w-3.5" /> ADD STOP
          </button>
        </div>
      </Section>

      <SaveBar busy={busy} error={error} onSave={save} />
    </div>
  );
}

/* ═══════════════ Projects tab ═══════════════ */

function ProjectsTab({ adminKey, onSaved }: { adminKey: string; onSaved: () => void }) {
  const [custom, setCustom] = useState<CustomProject[] | null>(null);
  const [flags, setFlags] = useState<Flags>({});
  const [repos, setRepos] = useState<
    { name: string; description: string | null; stars: number }[]
  >([]);
  const [repoError, setRepoError] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const loadRepos = useCallback(async () => {
    setRepoError("");
    try {
      const res = await fetch("/api/github/repos", { cache: "no-store" });
      const data = (await res.json()) as {
        repos?: { name: string; description: string | null; stars: number }[];
        error?: string;
      };
      setRepos(data.repos ?? []);
      if (data.error && (data.repos?.length ?? 0) === 0) setRepoError(data.error);
    } catch {
      setRepoError("Could not reach the GitHub service.");
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/site-settings", { cache: "no-store" });
        const data = (await res.json()) as { projects?: CustomProject[] };
        setCustom(Array.isArray(data.projects) ? data.projects : []);
      } catch {
        setCustom([]);
      }
      try {
        const res = await fetch("/api/project-flags", { cache: "no-store" });
        const data = (await res.json()) as { flags?: Flags };
        if (data.flags) setFlags(data.flags);
      } catch {
        /* defaults */
      }
    })();
    void loadRepos();
  }, [loadRepos]);

  if (!custom) return <LoadingBlock />;

  const setP = (i: number, patch: Partial<CustomProject>) =>
    setCustom(custom.map((p, j) => (j === i ? { ...p, ...patch } : p)));
  const moveP = (i: number, dir: -1 | 1) => {
    const next = [...custom];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    setCustom(next);
  };
  const addP = () => {
    const id = `cp_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
    setCustom([
      ...custom,
      { id, title: "New project", description: "", tech: [] },
    ]);
  };

  const toggle = (id: string, field: "hidden" | "featured") => {
    const cur = flags[id] ?? { hidden: false, featured: false };
    setFlags({ ...flags, [id]: { ...cur, [field]: !cur[field] } });
  };

  const save = async () => {
    setBusy(true);
    setError("");
    try {
      const res = await adminFetch("/api/site-settings", adminKey, {
        method: "PUT",
        body: JSON.stringify({ projects: custom }),
      });
      if (!res.ok) throw new Error();
      const resFlags = await adminFetch("/api/project-flags", adminKey, {
        method: "PUT",
        body: JSON.stringify({ flags }),
      });
      if (!resFlags.ok) throw new Error();
      playSound("chime");
      onSaved();
      emitSiteDataChanged();
    } catch {
      setError("Could not save the projects — check every project has a title.");
      playSound("pop");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex max-w-2xl flex-col gap-7">
      <Section
        title={`Hand-added projects (${custom.length})`}
        hint="Cards you write yourself — they sit above the live GitHub repos. A link opens the project site; a repo name wires the card into the file browser."
      >
        <div className="flex flex-col gap-4">
          {custom.map((p, i) => (
            <div key={p.id} className="rounded-2xl border border-border bg-[var(--bg2)] p-4">
              <div className="mb-3 flex items-center gap-2">
                <span className="font-tag flex h-7 w-7 items-center justify-center rounded-full bg-[rgba(var(--primary-rgb)/0.12)] text-[9px] text-foreground">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <label className="font-tag flex cursor-pointer items-center gap-2 text-[9px] tracking-[0.15em] text-muted-foreground">
                  ★ FEATURED
                  <Switch
                    checked={Boolean(p.featured)}
                    onCheckedChange={(v) => setP(i, { featured: v })}
                  />
                </label>
                <div className="ml-auto flex items-center gap-1">
                  <MiniBtn label="Move up" onClick={() => moveP(i, -1)} disabled={i === 0}>
                    <ArrowUp className="h-3.5 w-3.5" />
                  </MiniBtn>
                  <MiniBtn
                    label="Move down"
                    onClick={() => moveP(i, 1)}
                    disabled={i === custom.length - 1}
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </MiniBtn>
                  <MiniBtn
                    label="Delete project"
                    danger
                    onClick={() => setCustom(custom.filter((_, j) => j !== i))}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </MiniBtn>
                </div>
              </div>
              <div className="grid gap-2.5 sm:grid-cols-2">
                <Field label="Title">
                  <Input value={p.title} onChange={(e) => setP(i, { title: e.target.value })} className={FIELD} />
                </Field>
                <Field label="Tag chip (optional)">
                  <Input
                    value={p.tag ?? ""}
                    onChange={(e) => setP(i, { tag: e.target.value || undefined })}
                    placeholder="Production SaaS"
                    className={FIELD}
                  />
                </Field>
                <Field label="Link URL (optional)">
                  <Input
                    value={p.link ?? ""}
                    onChange={(e) => setP(i, { link: e.target.value || undefined })}
                    placeholder="https://…"
                    className={FIELD}
                  />
                </Field>
                <Field label="Repo name (optional)">
                  <Input
                    value={p.repo ?? ""}
                    onChange={(e) => setP(i, { repo: e.target.value || undefined })}
                    placeholder="exact GitHub repo name"
                    className={FIELD}
                  />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Tech (comma separated)">
                    <Input
                      value={p.tech.join(", ")}
                      onChange={(e) =>
                        setP(i, {
                          tech: e.target.value
                            .split(",")
                            .map((t) => t.trim())
                            .filter(Boolean)
                            .slice(0, 10),
                        })
                      }
                      placeholder="Next.js, TypeScript, Tailwind CSS"
                      className={FIELD}
                    />
                  </Field>
                </div>
                <div className="sm:col-span-2">
                  <Field label="Description">
                    <Textarea
                      value={p.description}
                      onChange={(e) => setP(i, { description: e.target.value })}
                      rows={2}
                      placeholder="What is it, what does it do…"
                      className="resize-y border-border bg-[var(--bg)] text-[13px]"
                    />
                  </Field>
                </div>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addP}
            className="font-tag flex min-h-11 items-center justify-center gap-2 rounded-xl border border-dashed border-border py-2.5 text-[10px] tracking-[0.2em] text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
          >
            <Plus className="h-3.5 w-3.5" /> ADD PROJECT
          </button>
        </div>
      </Section>

      <Section
        title="Live GitHub repositories"
        hint="Pulled from the GitHub API — featured repos pin to the front with a star badge."
      >
        {repoError && (
          <p className="mb-3 rounded-xl border border-(--warn)/40 bg-(--warn)/10 px-3.5 py-2.5 text-[12px] text-foreground/80">
            {repoError} — paste a token in the GitHub tab to lift the rate limit.
          </p>
        )}
        <div className="flex flex-col gap-2">
          {repos.map((r) => {
            const f = flags[`repo:${r.name}`] ?? { hidden: false, featured: false };
            return (
              <FlagRow
                key={r.name}
                title={r.name}
                subtitle={r.description ?? ""}
                stars={r.stars}
                hidden={f.hidden}
                featured={f.featured}
                onToggle={(field) => toggle(`repo:${r.name}`, field)}
              />
            );
          })}
          {repos.length === 0 && !repoError && <LoadingBlock small />}
        </div>
      </Section>

      <SaveBar busy={busy} error={error} onSave={save} />
    </div>
  );
}

/* ═══════════════ Skills tab ═══════════════ */

function SkillsTab({ adminKey, onSaved }: { adminKey: string; onSaved: () => void }) {
  const [draft, setDraft] = useState<SkillsContent | null>(null);
  const [chipDraft, setChipDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/site-settings", { cache: "no-store" });
        const data = (await res.json()) as { skills?: SkillsContent };
        if (data.skills) setDraft(data.skills);
      } catch {
        /* keep null */
      }
    })();
  }, []);

  if (!draft) return <LoadingBlock />;

  const setMeter = (i: number, patch: Partial<{ name: string; level: number }>) =>
    setDraft({ ...draft, meters: draft.meters.map((m, j) => (j === i ? { ...m, ...patch } : m)) });
  const moveMeter = (i: number, dir: -1 | 1) => {
    const next = [...draft.meters];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    setDraft({ ...draft, meters: next });
  };
  const addMeter = () =>
    setDraft({ ...draft, meters: [...draft.meters, { name: "New skill", level: 50 }] });

  const addChip = () => {
    const c = chipDraft.trim();
    if (!c || draft.chips.includes(c)) return;
    setDraft({ ...draft, chips: [...draft.chips, c] });
    setChipDraft("");
  };

  const save = async () => {
    setBusy(true);
    setError("");
    try {
      const res = await adminFetch("/api/site-settings", adminKey, {
        method: "PUT",
        body: JSON.stringify({ skills: draft }),
      });
      if (!res.ok) throw new Error();
      playSound("chime");
      onSaved();
      emitSiteDataChanged();
    } catch {
      setError("Could not save the skills.");
      playSound("pop");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex max-w-2xl flex-col gap-7">
      <Section
        title={`Proficiency meters (${draft.meters.length})`}
        hint="The ledger rows in the Skills section. The first three also render as ring gauges. Level: 1–100."
      >
        <div className="flex flex-col gap-4">
          {draft.meters.map((m, i) => (
            <div
              key={i}
              className="grid items-end gap-2.5 rounded-2xl border border-border bg-[var(--bg2)] p-4 sm:grid-cols-[1fr_110px_auto]"
            >
              <Field label="Skill">
                <Input value={m.name} onChange={(e) => setMeter(i, { name: e.target.value })} className={FIELD} />
              </Field>
              <Field label="Level %">
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={m.level}
                  onChange={(e) => setMeter(i, { level: Number(e.target.value) })}
                  className={FIELD}
                />
              </Field>
              <div className="flex items-center gap-1 pb-0.5">
                <MiniBtn label="Move up" onClick={() => moveMeter(i, -1)} disabled={i === 0}>
                  <ArrowUp className="h-3.5 w-3.5" />
                </MiniBtn>
                <MiniBtn
                  label="Move down"
                  onClick={() => moveMeter(i, 1)}
                  disabled={i === draft.meters.length - 1}
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </MiniBtn>
                <MiniBtn
                  label="Delete skill"
                  danger
                  disabled={draft.meters.length <= 1}
                  onClick={() =>
                    setDraft({ ...draft, meters: draft.meters.filter((_, j) => j !== i) })
                  }
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </MiniBtn>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addMeter}
            className="font-tag flex min-h-11 items-center justify-center gap-2 rounded-xl border border-dashed border-border py-2.5 text-[10px] tracking-[0.2em] text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
          >
            <Plus className="h-3.5 w-3.5" /> ADD SKILL
          </button>
        </div>
      </Section>

      <Section title={`Toolbox chips (${draft.chips.length})`} hint="The tool cloud under the meters.">
        <div className="flex flex-wrap gap-2">
          {draft.chips.map((c, i) => (
            <span
              key={`${c}-${i}`}
              className="flex items-center gap-1.5 rounded-full border border-border bg-[var(--bg2)] py-1.5 pl-3 pr-1.5 text-[12px] text-foreground"
            >
              {c}
              <button
                type="button"
                onClick={() =>
                  setDraft({ ...draft, chips: draft.chips.filter((_, j) => j !== i) })
                }
                aria-label={`Remove ${c}`}
                className="flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-(--err)/10 hover:text-(--err)"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <Input
            value={chipDraft}
            onChange={(e) => setChipDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addChip();
              }
            }}
            placeholder="Add a tool…"
            className="h-11 rounded-xl border-border bg-[var(--bg2)]"
          />
          <Button
            type="button"
            variant="outline"
            onClick={addChip}
            className="h-11 gap-2 rounded-xl"
          >
            <Plus className="h-4 w-4" /> Add
          </Button>
        </div>
      </Section>

      <SaveBar busy={busy} error={error} onSave={save} />
    </div>
  );
}

/* ═══════════════ Contact tab ═══════════════ */

function ContactTab({ adminKey, onSaved }: { adminKey: string; onSaved: () => void }) {
  const [draft, setDraft] = useState<ContactContent | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/site-settings", { cache: "no-store" });
        const data = (await res.json()) as { contact?: ContactContent };
        if (data.contact) setDraft(data.contact);
      } catch {
        /* keep null */
      }
    })();
  }, []);

  if (!draft) return <LoadingBlock />;

  const setSocial = (i: number, patch: Partial<{ label: string; href: string }>) =>
    setDraft({
      ...draft,
      socials: draft.socials.map((s, j) => (j === i ? { ...s, ...patch } : s)),
    });
  const moveSocial = (i: number, dir: -1 | 1) => {
    const next = [...draft.socials];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    setDraft({ ...draft, socials: next });
  };

  const save = async () => {
    setBusy(true);
    setError("");
    try {
      const res = await adminFetch("/api/site-settings", adminKey, {
        method: "PUT",
        body: JSON.stringify({ contact: draft }),
      });
      if (!res.ok) throw new Error();
      playSound("chime");
      onSaved();
      emitSiteDataChanged();
    } catch {
      setError("Could not save the contact info.");
      playSound("pop");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex max-w-2xl flex-col gap-7">
      <Section title="Direct channels" hint="The email and phone cards in the Reach me section.">
        <div className="grid gap-3">
          <Field label="Email">
            <Input
              type="email"
              value={draft.email}
              onChange={(e) => setDraft({ ...draft, email: e.target.value })}
              className={FIELD}
            />
          </Field>
          <Field label="Phone (shown exactly as typed)">
            <Input
              value={draft.phone}
              onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
              placeholder="+880 1XXX-XXXXXX"
              className={FIELD}
            />
          </Field>
          <Field label="Location line">
            <Input
              value={draft.location}
              onChange={(e) => setDraft({ ...draft, location: e.target.value })}
              className={FIELD}
            />
          </Field>
        </div>
      </Section>

      <Section
        title={`Social links (${draft.socials.length})`}
        hint="The brand tiles under the email/phone cards. Label picks the icon: GitHub, LinkedIn, X/Twitter, Dribbble, Facebook, Instagram, YouTube…"
      >
        <div className="flex flex-col gap-2.5">
          {draft.socials.map((s, i) => (
            <div key={i} className="grid items-end gap-2 rounded-2xl border border-border bg-[var(--bg2)] p-3 sm:grid-cols-[150px_1fr_auto]">
              <Field label="Label">
                <Input
                  value={s.label}
                  onChange={(e) => setSocial(i, { label: e.target.value })}
                  className={FIELD}
                />
              </Field>
              <Field label="URL">
                <Input
                  value={s.href}
                  onChange={(e) => setSocial(i, { href: e.target.value })}
                  className={FIELD}
                />
              </Field>
              <div className="flex items-center gap-1 pb-0.5">
                <MiniBtn label="Move up" onClick={() => moveSocial(i, -1)} disabled={i === 0}>
                  <ArrowUp className="h-3.5 w-3.5" />
                </MiniBtn>
                <MiniBtn
                  label="Move down"
                  onClick={() => moveSocial(i, 1)}
                  disabled={i === draft.socials.length - 1}
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </MiniBtn>
                <MiniBtn
                  label="Delete social"
                  danger
                  disabled={draft.socials.length <= 1}
                  onClick={() =>
                    setDraft({ ...draft, socials: draft.socials.filter((_, j) => j !== i) })
                  }
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </MiniBtn>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              setDraft({ ...draft, socials: [...draft.socials, { label: "New link", href: "https://" }] })
            }
            className="font-tag flex min-h-11 items-center justify-center gap-2 rounded-xl border border-dashed border-border py-2.5 text-[10px] tracking-[0.2em] text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
          >
            <Plus className="h-3.5 w-3.5" /> ADD SOCIAL LINK
          </button>
        </div>
      </Section>

      <SaveBar busy={busy} error={error} onSave={save} />
    </div>
  );
}

function FlagRow({
  title,
  subtitle,
  stars,
  hidden,
  featured,
  onToggle,
}: {
  title: string;
  subtitle?: string;
  stars?: number;
  hidden: boolean;
  featured: boolean;
  onToggle: (field: "hidden" | "featured") => void;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-xl border border-border bg-[var(--bg2)] px-3.5 py-2.5 transition-opacity ${
        hidden ? "opacity-50" : ""
      }`}
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-semibold text-foreground">{title}</p>
        {subtitle && (
          <p className="truncate text-[11.5px] text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {typeof stars === "number" && (
        <span className="font-tag shrink-0 text-[9px] tabular-nums text-muted-foreground">
          ★ {stars}
        </span>
      )}
      <label className="font-tag flex shrink-0 cursor-pointer items-center gap-1.5 text-[9px] tracking-[0.15em] text-muted-foreground">
        <Eye className="h-3 w-3" aria-hidden="true" />
        <Switch checked={!hidden} onCheckedChange={() => onToggle("hidden")} />
      </label>
      <label className="font-tag flex shrink-0 cursor-pointer items-center gap-1.5 text-[9px] tracking-[0.15em] text-muted-foreground">
        ★
        <Switch checked={featured} onCheckedChange={() => onToggle("featured")} />
      </label>
    </div>
  );
}

/* ═══════════════ GitHub tab ═══════════════ */

function GithubTab({ adminKey, onSaved }: { adminKey: string; onSaved: () => void }) {
  const [username, setUsername] = useState("");
  const [token, setToken] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [status, setStatus] = useState<{ source?: string; count?: number; error?: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/github/repos", { cache: "no-store" });
        const data = (await res.json()) as {
          login?: string;
          source?: string;
          repos?: unknown[];
          error?: string;
        };
        setUsername(data.login ?? "");
        setStatus({
          source: data.source,
          count: data.repos?.length,
          error: data.error,
        });
      } catch {
        /* ignore */
      }
    })();
  }, []);

  const save = async () => {
    setBusy(true);
    setError("");
    try {
      const res = await adminFetch("/api/site-settings", adminKey, {
        method: "PUT",
        body: JSON.stringify({ github: { username, token } }),
      });
      if (!res.ok) throw new Error();
      playSound("chime");
      onSaved();
      emitSiteDataChanged();
      /* re-probe with the new identity */
      const probe = await fetch("/api/github/repos", { cache: "no-store" });
      const data = (await probe.json()) as {
        login?: string;
        source?: string;
        repos?: unknown[];
        error?: string;
      };
      setStatus({ source: data.source, count: data.repos?.length, error: data.error });
    } catch {
      setError("Could not save the GitHub settings.");
      playSound("pop");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex max-w-xl flex-col gap-7">
      <Section
        title="Repository source"
        hint="The project section's live repos come from this account through the server-side API proxy."
      >
        <div className="grid gap-3">
          <Field label="GitHub username">
            <Input value={username} onChange={(e) => setUsername(e.target.value)} className={FIELD} />
          </Field>
          <Field label="Personal access token (optional but recommended)">
            <div className="relative">
              <Input
                type={showToken ? "text" : "password"}
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="github_pat_… / ghp_…"
                className={`${FIELD} pr-11`}
              />
              <button
                type="button"
                onClick={() => setShowToken((v) => !v)}
                aria-label={showToken ? "Hide token" : "Show token"}
                className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground"
              >
                {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </Field>
        </div>
        <p className="mt-3 text-[12px] leading-relaxed text-muted-foreground">
          GitHub allows 60 anonymous requests/hour per IP — shared networks burn
          that instantly. A token (even a fine-grained one with only
          “public repositories” read access) raises it to 5,000/h. Create one at
          github.com/settings/tokens — it is stored server-side and never sent
          to the browser.
        </p>
        {status && (
          <p className="font-tag mt-3 rounded-xl border border-border bg-[var(--bg2)] px-3.5 py-2.5 text-[9.5px] tracking-[0.15em] text-muted-foreground">
            STATUS: {status.error ? "ERROR" : "OK"} · SOURCE {status.source ?? "?"} ·{" "}
            {status.count ?? 0} REPOS
            {status.error ? ` · ${status.error}` : ""}
          </p>
        )}
      </Section>

      <SaveBar busy={busy} error={error} onSave={save} />
    </div>
  );
}

/* ═══════════════ Messages tab ═══════════════ */

interface InboxMessage {
  id: string;
  name: string;
  email: string;
  eventType: string;
  message: string;
  createdAt: string;
}
interface InboxBooking {
  id: string;
  topic: string;
  date: string;
  timeSlot: string;
  email: string;
  createdAt: string;
}

function MessagesTab({ adminKey }: { adminKey: string }) {
  const [messages, setMessages] = useState<InboxMessage[] | null>(null);
  const [bookings, setBookings] = useState<InboxBooking[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await adminFetch("/api/admin/messages", adminKey);
        const data = (await res.json()) as {
          messages?: InboxMessage[];
          bookings?: InboxBooking[];
        };
        setMessages(data.messages ?? []);
        setBookings(data.bookings ?? []);
      } catch {
        setMessages([]);
      }
    })();
  }, [adminKey]);

  if (messages === null) return <LoadingBlock />;

  return (
    <div className="flex max-w-2xl flex-col gap-7">
      <Section title={`Contact messages (${messages.length})`} hint="From the contact form — newest first.">
        <div className="flex flex-col gap-2.5">
          {messages.length === 0 && <Empty text="No messages yet." />}
          {messages.map((m) => (
            <div key={m.id} className="rounded-2xl border border-border bg-[var(--bg2)] p-4">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <p className="text-[13px] font-semibold text-foreground">{m.name}</p>
                <a href={`mailto:${m.email}`} className="text-[12px] text-primary hover:underline">
                  {m.email}
                </a>
                <span className="font-tag ml-auto text-[8.5px] tracking-[0.15em] text-muted-foreground">
                  {new Date(m.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="font-tag mt-1 text-[8.5px] tracking-[0.2em] text-muted-foreground">
                {m.eventType}
              </p>
              <p className="mt-2 whitespace-pre-wrap text-[13px] leading-relaxed text-foreground/80">
                {m.message}
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Section title={`Booking requests (${bookings.length})`} hint="From the booking widget.">
        <div className="flex flex-col gap-2.5">
          {bookings.length === 0 && <Empty text="No bookings yet." />}
          {bookings.map((b) => (
            <div
              key={b.id}
              className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-border bg-[var(--bg2)] px-3.5 py-2.5"
            >
              <p className="text-[13px] font-semibold text-foreground">{b.topic}</p>
              <span className="font-tag text-[9px] text-muted-foreground">
                {b.date} · {b.timeSlot}
              </span>
              <a href={`mailto:${b.email}`} className="text-[12px] text-primary hover:underline">
                {b.email}
              </a>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

/* ═══════════════ shared bits ═══════════════ */

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="text-[15px] font-semibold tracking-tight text-foreground">{title}</h3>
      {hint && <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">{hint}</p>}
      <div className="mt-3.5">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="font-tag mb-1.5 block text-[9px] tracking-[0.2em] text-muted-foreground">
        {label.toUpperCase()}
      </span>
      {children}
    </label>
  );
}

function MiniBtn({
  label,
  onClick,
  children,
  danger,
  disabled,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  danger?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30 ${
        danger ? "hover:border-(--err)/50 hover:text-(--err)" : ""
      }`}
    >
      {children}
    </button>
  );
}

function SaveBar({
  busy,
  error,
  onSave,
}: {
  busy: boolean;
  error: string;
  onSave: () => void;
}) {
  return (
    <div className="sticky bottom-0 -mx-1 flex flex-col gap-2 bg-gradient-to-t from-[var(--bg)] via-[var(--bg)] px-1 pb-1 pt-3">
      {error && <p className="text-[12px] font-medium text-(--err)">{error}</p>}
      <Button onClick={onSave} disabled={busy} className="h-11 gap-2 rounded-xl">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        Save changes
      </Button>
    </div>
  );
}

function LoadingBlock({ small }: { small?: boolean }) {
  return (
    <div className={`flex items-center justify-center text-muted-foreground ${small ? "py-6" : "py-16"}`}>
      <Loader2 className="h-5 w-5 animate-spin" />
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <p className="rounded-xl border border-dashed border-border px-3.5 py-4 text-center text-[12px] text-muted-foreground">
      {text}
    </p>
  );
}


