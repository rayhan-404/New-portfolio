/* ═══════════════════════════════════════════════════════════════
   Site defaults — shared by the server store AND the client hooks.
   Pure data: no db / node imports, safe in browser bundles.
   ═══════════════════════════════════════════════════════════════ */

export const DEFAULT_ACCENT = "mono";
export const DEFAULT_THEME = "dark";
/** First-run admin passcode — change it in Admin → Design. */
export const DEFAULT_PASSCODE = "rayhan";

export interface DesignSettings {
  accent: string;
  theme: "dark" | "light";
}

export interface BioParagraph {
  /** lead → Fraunces italic deck · body → book weight · closing → semibold */
  style: "lead" | "body" | "closing";
  /** **bold** spans supported; emojis auto-wrapped for the mono theme */
  text: string;
}

export interface HeroContent {
  greeting: string;
  name: string;
  role: string;
  paragraphs: BioParagraph[];
}

export interface GithubSettings {
  username: string;
  /** fine-grained or classic PAT — raises the rate limit to 5000/h */
  token: string;
}

/* ── Projects (v91) — admin-added projects, shown beside the live
   GitHub repositories. Curated case studies were retired. ─────── */

export interface CustomProject {
  id: string;
  title: string;
  description: string;
  /** small mono chip, e.g. "Production SaaS" */
  tag?: string;
  tech: string[];
  /** live URL — opened in a new tab when the card is clicked */
  link?: string;
  /** repo name (without owner) — wires the card to the repo browser */
  repo?: string;
  featured?: boolean;
}

/* ── Contact (v91) — the "Reach me" section's channels ────────── */

export interface ContactSocial {
  label: string;
  href: string;
}

export interface ContactContent {
  email: string;
  phone: string;
  location: string;
  socials: ContactSocial[];
}

/* ── Skills (v91) — the arsenal, admin-editable ───────────────── */

export interface SkillMeterDef {
  name: string;
  /** 0–100 */
  level: number;
}

export interface SkillsContent {
  meters: SkillMeterDef[];
  chips: string[];
}

export const DEFAULT_CONTACT: ContactContent = {
  email: "rayhan6355@gmail.com",
  /** set the real number in Admin → Contact — it renders as-is */
  phone: "+880 1XXX-XXXXXX",
  location: "Khulna, Bangladesh",
  socials: [
    { label: "GitHub", href: "https://github.com/rayhan-404" },
    { label: "LinkedIn", href: "https://linkedin.com/in/rayhan-404" },
    { label: "X / Twitter", href: "https://x.com/rayhan_404" },
    { label: "Dribbble", href: "https://dribbble.com/rayhan404" },
  ],
};

export const DEFAULT_SKILLS: SkillsContent = {
  meters: [
    { name: "React & Next.js", level: 92 },
    { name: "TypeScript", level: 90 },
    { name: "Tailwind CSS", level: 94 },
    { name: "Node.js & Express", level: 82 },
    { name: "MongoDB & SQL", level: 78 },
    { name: "UI/UX & Figma", level: 85 },
  ],
  chips: [
    "Git & GitHub", "Docker", "Vercel", "REST APIs",
    "Prisma", "Firebase", "Framer Motion", "Zustand",
    "Socket.io", "Linux", "Postman", "Accessibility",
  ],
};

export const DEFAULT_PROJECTS: CustomProject[] = [];

export const DEFAULT_HERO: HeroContent = {
  greeting: "Hello..",
  name: "M Rayhan",
  role: "CSE Student · North Western University",
  paragraphs: [
    {
      style: "lead",
      text: "I'm a CSE student at **North Western University, Khulna**, and originally from **Shyamnagar, Satkhira, Bangladesh**.",
    },
    {
      style: "body",
      text: "I'm basically a boring and curious guy who wants to know **how everything works, from my cell, brain, everything surrounding me, to the universe, and what's going on behind the screen** 🤔 If I find something interesting, there's a pretty good chance I'll spend hours trying to figure it out and understand how it works.",
    },
    {
      style: "body",
      text: "I like learning new things, trying random ideas, and building stuff just to see if I can actually make it work. I've already built a few small projects because of this habit, and honestly, I enjoy the process more than the final result, and it satisfies me more than anything.",
    },
    {
      style: "body",
      text: "Sometimes I build something useful. Sometimes I build something completely unnecessary. And sometimes I break something and then spend the next few hours figuring out how it actually works. 🧐",
    },
    {
      style: "body",
      text: "If you ask, **what is this guy interested in?** 🤨 Then I'm interested in **Artificial Intelligence, Robotics, Electronics, new gadgets and technologies**. I don't know where this curiosity will take me yet, but I'm having fun finding out.",
    },
    {
      style: "closing",
      text: "I'm curious about almost everything, and I love building things just to see what happens.",
    },
  ],
};
