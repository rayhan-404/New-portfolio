/**
 * Portfolio content layer — single source of truth.
 * M Rayhan · CSE Student, North Western University Khulna
 *
 * (v91) The fake case-study projects, skill meters and booking
 * copy were retired — the live site now renders admin-editable
 * content from /api/site-settings (see site-defaults.ts) plus
 * real GitHub repos. What remains here is static identity data.
 */

export const brand = {
  name: "M Rayhan",
  tagline: "Portfolio of a curious CSE student",
} as const;

export const person = {
  name: "M Rayhan",
  monogram: "MR",
  role: "CSE Student · North Western University",
  email: "rayhan6355@gmail.com",
  bio: "CSE student at North Western University, Khulna — curious about almost everything, building things just to see what happens.",
  location: "Khulna, Bangladesh",
  availability: "Open to internships & collabs",
  responseTime: "Fast 24h response",
} as const;

export const socials = [
  { label: "GitHub", handle: "@rayhan-404", href: "https://github.com/rayhan-404" },
  { label: "LinkedIn", handle: "/in/rayhan-404", href: "https://linkedin.com/in/rayhan-404" },
  { label: "X / Twitter", handle: "@rayhan_404", href: "https://x.com/rayhan_404" },
  { label: "Dribbble", handle: "@rayhan404", href: "https://dribbble.com/rayhan404" },
] as const;

export const marqueeStack = [
  "TypeScript", "React 19", "Next.js 15", "Tailwind CSS", "Node.js", "PostgreSQL",
  "Prisma", "GraphQL", "Framer Motion", "Docker", "Figma", "Vitest",
  "Zustand", "Redis", "WebSocket", "CI/CD",
] as const;

/* ── Journey — the life story timeline ─────────────────────────── */
export interface Era {
  period: string;
  title: string;
  /** lucide line icon shown inline before the title (see journey-section TITLE_ICONS) */
  icon: string;
  /** funny sub-title under the big title */
  place: string;
  /** real-world location line (mono) */
  location?: string;
  description: string;
  tag: string;
  /** degree line — only on the current chapter */
  degree?: string;
  current?: boolean;
}

export const journey: Era[] = [
  {
    period: "2005 — 2007",
    title: "Father & Mother's Lap",
    icon: "baby",
    place: "Tiny Human Era",
    description:
      "No school. No homework. No responsibilities. Just sleeping, eating and professionally doing nothing.",
    tag: "Life was easy",
  },
  {
    period: "2007 — 2011",
    title: "Home Sweet Home",
    icon: "home",
    place: "The Family Headquarters",
    description:
      "Started discovering the world from the safest possible location. Basically, childhood with unlimited Wi-Fi from the universe.",
    tag: "Origin story",
  },
  {
    period: "2011 — 2015",
    title: "Sundarban Kindergarten",
    icon: "shapes",
    place: "First School Arc",
    location: "Nowabeki, Shyamnagar, Satkhira",
    description:
      "First official encounter with education. Came for learning, stayed for the snacks and friends.",
    tag: "Quest started",
  },
  {
    period: "2016 — 2020",
    title: "Henchi Adarsha High School",
    icon: "school",
    place: "The School Years",
    location: "Henchi, Shyamnagar, Satkhira",
    description:
      'Exams, friends, homework, random punishments and the classic "Sir, homework kori nai."',
    tag: "Character development",
  },
  {
    period: "2021 — 2023",
    title: "Ahsanullah College",
    icon: "book",
    place: "College Mode",
    location: "Khulna, Bangladesh",
    description:
      "New city. New people. A little more freedom. And, surprisingly, even more assignments.",
    tag: "Level up",
  },
  {
    period: "2024 — Present",
    title: "North Western University",
    icon: "gradcap",
    place: "Currently Building.",
    location: "Khulna, Bangladesh",
    description:
      "Started learning how computers work. Still trying to figure out how life works. One bug at a time.",
    tag: "Work in progress",
    degree: "BSc · Computer Science & Engineering",
    current: true,
  },
];

export const journeyFuture = {
  year: "2028",
  label: "Next chapter",
  title: "Loading",
  icon: "rocket",
  description: "Degree first. What happens next? Let's find out.",
} as const;
