/**
 * Portfolio content layer — single source of truth.
 * M Rayhan · CSE Student, North Western University Khulna
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
  longBio: "I'm M Rayhan, a CSE student at North Western University, Khulna, originally from Shyamnagar, Satkhira, Bangladesh. I'm interested in Artificial Intelligence, Robotics, Electronics, new gadgets and technologies — and I love building things just to see what happens.",
  philosophy: "I'm curious about almost everything, and I love building things just to see what happens.",
  location: "Khulna, Bangladesh",
  availability: "Open to internships & collabs",
  responseTime: "Fast 24h response",
} as const;

export const heroAward = {
  count: 12,
  lines: ["Awards", "Celebrate", "Innovation"],
} as const;

export const socials = [
  { label: "GitHub", handle: "@rayhan-ahmed", href: "https://github.com" },
  { label: "LinkedIn", handle: "/in/rayhan-ahmed", href: "https://linkedin.com" },
  { label: "X / Twitter", handle: "@rayhan_builds", href: "https://x.com" },
  { label: "Dribbble", handle: "@rayhan.ahmed", href: "https://dribbble.com" },
] as const;

export interface ServiceItem {
  index: string;
  title: string;
  description: string;
  deliverables: string[];
}

export const services: ServiceItem[] = [
  {
    index: "01",
    title: "Full-Stack Development",
    description:
      "End-to-end product engineering — from database schema to deploy pipeline. Type-safe, tested, and built to scale past your first hundred thousand users.",
    deliverables: ["Next.js / React Apps", "APIs & Integrations", "PostgreSQL / Prisma"],
  },
  {
    index: "02",
    title: "UI/UX & Interface Design",
    description:
      "Interfaces engineered like products, not decoration. Design systems, motion language, and accessibility baked in from the first wireframe.",
    deliverables: ["Design Systems", "Prototyping", "WCAG 2.1 AA"],
  },
  {
    index: "03",
    title: "SaaS & MVP Builds",
    description:
      "Ship a validated MVP in weeks, not quarters. Opinionated architecture, billing, auth, and analytics wired on day one.",
    deliverables: ["Rapid Scoping", "Stripe & Auth", "Analytics Ready"],
  },
  {
    index: "04",
    title: "Technical Consulting",
    description:
      "Architecture reviews, performance audits, and team enablement. Honest engineering talk — no slides, just measurable outcomes.",
    deliverables: ["Perf Audits", "Architecture Review", "Team Mentoring"],
  },
];

export const stats = [
  { label: "Years Craft", value: 4, suffix: "+", detail: "35+ shipped apps" },
  { label: "Apps Shipped", value: 35, suffix: "+", detail: "production builds" },
  { label: "Satisfaction", value: 99.8, suffix: "%", detail: "client score" },
] as const;

export const heroBadges = [
  { icon: "code", label: "Full-Stack Engineer" },
  { icon: "palette", label: "UI/UX Specialist" },
  { icon: "zap", label: "High Performance" },
] as const;

export const coreStack = [
  "React & Next.js 15",
  "TypeScript",
  "Tailwind CSS",
  "Node.js / Express",
  "PostgreSQL",
  "Design Systems",
] as const;

export const marqueeStack = [
  "TypeScript", "React 19", "Next.js 15", "Tailwind CSS", "Node.js", "PostgreSQL",
  "Prisma", "GraphQL", "Framer Motion", "Docker", "Figma", "Vitest",
  "Zustand", "Redis", "WebSocket", "CI/CD",
] as const;

export interface ExperienceItem {
  period: string;
  role: string;
  company: string;
  description: string;
  current?: boolean;
}

export const experience: ExperienceItem[] = [
  {
    period: "2024 — Present",
    role: "Senior Full-Stack Engineer",
    company: "TechFlow Studios",
    description:
      "Architected micro-frontend systems in Next.js 15 and TypeScript, cutting initial load times by 48%. Managed PostgreSQL clusters with Prisma ORM and led design-system scaling.",
    current: true,
  },
  {
    period: "2022 — 2024",
    role: "Product Engineer & UI Architect",
    company: "Pulse Digital",
    description:
      "Designed and deployed high-traffic client portals, real-time analytics pipelines, and accessible multi-brand Figma-to-React design systems.",
  },
  {
    period: "2021 — 2022",
    role: "Software Developer",
    company: "Open Source & Consulting",
    description:
      "Built custom web tools, REST/GraphQL APIs, and contributed to modern developer toolkits.",
  },
];

export type ProjectCategory = "all" | "fullstack" | "design";

/* ── Journey — the life story timeline ─────────────────────────── */
export interface Era {
  period: string;
  title: string;
  /** monochrome emoji shown inline before the title */
  emoji: string;
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
    emoji: "👶",
    place: "Tiny Human Era",
    description:
      "No school. No homework. No responsibilities. Just sleeping, eating and professionally doing nothing.",
    tag: "Life was easy",
  },
  {
    period: "2007 — 2011",
    title: "Home Sweet Home",
    emoji: "🏡",
    place: "The Family Headquarters",
    description:
      "Started discovering the world from the safest possible location. Basically, childhood with unlimited Wi-Fi from the universe.",
    tag: "Origin story",
  },
  {
    period: "2011 — 2015",
    title: "Sundarban Kindergarten",
    emoji: "🧸",
    place: "First School Arc",
    location: "Nowabeki, Shyamnagar, Satkhira",
    description:
      "First official encounter with education. Came for learning, stayed for the snacks and friends.",
    tag: "Quest started",
  },
  {
    period: "2016 — 2020",
    title: "Henchi Adarsha High School",
    emoji: "🏫",
    place: "The School Years",
    location: "Henchi, Shyamnagar, Satkhira",
    description:
      'Exams, friends, homework, random punishments and the classic "Sir, homework kori nai."',
    tag: "Character development",
  },
  {
    period: "2021 — 2023",
    title: "Ahsanullah College",
    emoji: "📚",
    place: "College Mode",
    location: "Khulna, Bangladesh",
    description:
      "New city. New people. A little more freedom. And, surprisingly, even more assignments.",
    tag: "Level up",
  },
  {
    period: "2024 — Present",
    title: "North Western University",
    emoji: "🎓",
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
  emoji: "🚀",
  description: "Degree first. What happens next? Let's find out.",
} as const;

export interface Project {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  category: Exclude<ProjectCategory, "all">;
  flagship?: boolean;
  description: string;
  metrics: string[];
  tech: string[];
  features: string[];
  accent: "green" | "mint" | "orange" | "rose";
}

export const projects: Project[] = [
  {
    id: "pulseai",
    title: "PulseAI",
    subtitle: "Workflow Analytics Suite",
    tag: "Production SaaS",
    category: "fullstack",
    flagship: true,
    description:
      "PulseAI is a mission-critical observability and developer productivity hub engineered with Next.js 15, PostgreSQL, and streaming telemetry pipelines. It translates raw commit streams, build logs, and pull request activity into predictive delivery forecasts.",
    metrics: ["+140% Pipeline Velocity", "99.9% Uptime", "Sub-50ms API Latency"],
    tech: ["Next.js 15", "TypeScript", "Tailwind CSS", "PostgreSQL", "Prisma", "Recharts", "Docker"],
    features: [
      "Live telemetry ingestion engine supporting webhook payloads",
      "Granular team role-based access control (RBAC)",
      "Automated CI/CD build bottleneck detection",
      "Interactive dark & light theme tokens",
    ],
    accent: "green",
  },
  {
    id: "auraui",
    title: "Aura UI",
    subtitle: "Component System",
    tag: "Design System",
    category: "design",
    description:
      "Aura UI provides 60+ headless and pre-styled React primitives designed from the ground up for strict accessibility (WCAG 2.1 AA), keyboard navigability, and seamless theme token overrides.",
    metrics: ["60+ Components", "Zero Bundle Bloat", "100% Type-Safe"],
    tech: ["React 19", "TypeScript", "Tailwind CSS", "Framer Motion", "Radix UI", "Figma"],
    features: [
      "Full keyboard navigation & screen-reader ARIA semantics",
      "Automated design token sync with Figma API",
      "Compound component patterns with full slot customization",
      "Micro-interaction spring animation physics",
    ],
    accent: "mint",
  },
  {
    id: "ecotrack",
    title: "EcoTrack",
    subtitle: "Carbon Ledger",
    tag: "PWA Platform",
    category: "fullstack",
    description:
      "EcoTrack enables companies to benchmark Scope 1, 2, and 3 emissions through intuitive D3.js visualization dashboards and automated environmental compliance PDF generation.",
    metrics: ["-28% Footprint Avg.", "Offline-First Sync", "D3.js Charts"],
    tech: ["React", "TypeScript", "D3.js", "Tailwind CSS", "IndexedDB", "Service Workers"],
    features: [
      "Offline data capture with background synchronization",
      "Interactive Sankey and Treemap emission visualizations",
      "Exportable SEC & ESG compliant audit reports",
      "Target milestone forecasting calculators",
    ],
    accent: "green",
  },
  {
    id: "devcanvas",
    title: "DevCanvas",
    subtitle: "Realtime Sandbox",
    tag: "Open Source",
    category: "design",
    description:
      "DevCanvas combines a multi-cursor interactive canvas with in-browser TypeScript compilation and live synchronized state over lightweight WebSockets.",
    metrics: ["Real-time Multi-Cursor", "< 15ms Latency", "WebAssembly"],
    tech: ["TypeScript", "WebSockets", "HTML5 Canvas", "Tailwind CSS", "Monaco Editor"],
    features: [
      "Conflict-free replicated data types (CRDT) for concurrent edits",
      "Real-time presence avatars and live cursor tracking",
      "Instant playground execution with sandboxed evaluation",
      "1-click export to GitHub repositories",
    ],
    accent: "orange",
  },
];

export interface SkillMeter {
  name: string;
  level: number;
}

export const skillMeters: SkillMeter[] = [
  { name: "React & Next.js 15", level: 98 },
  { name: "TypeScript", level: 95 },
  { name: "Tailwind CSS Architecture", level: 96 },
  { name: "Node.js & Express", level: 90 },
  { name: "PostgreSQL & Firestore", level: 88 },
  { name: "UI/UX & Figma Prototyping", level: 92 },
];

export const skillChips = [
  "Git & GitHub", "Docker", "Vercel & Cloud", "REST / GraphQL",
  "Vitest & Jest", "Framer Motion", "Zustand & Redux", "Design Tokens",
  "Accessibility", "CI/CD Pipelines",
] as const;

export const projectTypes = [
  "Full-Stack App",
  "UI/UX Redesign",
  "SaaS MVP",
  "Consulting",
] as const;

export const bookingTopics = [
  "New Project / MVP Scoping",
  "Full-Time / Contract Engineering",
  "UI/UX & Architecture Review",
  "General Collaboration",
] as const;

export const bookingSlots = [
  "10:00 — 10:30 AM (UTC)",
  "02:00 — 02:30 PM (UTC)",
  "05:00 — 05:30 PM (UTC)",
  "08:00 — 08:30 PM (UTC)",
] as const;
