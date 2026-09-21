/**
 * Portfolio content layer — single source of truth.
 * Migrated from the legacy HTML portfolio and enriched for production use.
 */

export const person = {
  name: "Rayhan",
  monogram: "R",
  role: "Full-Stack Engineer & UI/UX Specialist",
  email: "rayhan6355@gmail.com",
  bio: "Crafting resilient digital products, scalable web systems, and high-performance interactive interfaces.",
  longBio: "I'm Rayhan, a full-stack engineer and interface designer dedicated to building scalable web applications with meticulous user experience. I bridge the gap between complex engineering architectures and intuitive, accessible user interfaces.",
  philosophy: "Passionate Software Engineer & Designer — crafting resilient digital products.",
  location: "Worldwide · Remote",
  availability: "Available Q2–Q3 2026",
  responseTime: "Fast 24h response",
} as const;

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
