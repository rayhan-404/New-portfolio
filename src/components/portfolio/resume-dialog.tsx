"use client";

import { Download } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { experience, person } from "@/lib/portfolio-data";

const SKILL_ROWS = [
  {
    label: "Languages",
    items: ["TypeScript", "JavaScript (ES2024)", "SQL", "HTML5", "CSS3"],
  },
  {
    label: "Frontend",
    items: ["React 19", "Next.js 15", "Tailwind CSS", "Framer Motion", "Zustand"],
  },
  {
    label: "Backend",
    items: ["Node.js", "Express", "PostgreSQL", "Prisma", "Firestore", "REST/GraphQL"],
  },
  {
    label: "Design & Ops",
    items: ["Figma", "Design Tokens", "Git/GitHub", "Docker", "Vercel"],
  },
] as const;

interface ResumeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ResumeDialog({ open, onOpenChange }: ResumeDialogProps) {
  const handleHireClick = () => {
    onOpenChange(false);
    // Wait for the dialog close animation + scroll lock release, then navigate.
    window.setTimeout(() => {
      document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
    }, 260);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] gap-0 overflow-y-auto rounded-2xl border-[var(--glass-border)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:max-w-xl">
        <DialogHeader className="items-start gap-1.5 text-left">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-2">
            <DialogTitle className="text-lg font-semibold tracking-tight">
              Rayhan&apos;s Resume
            </DialogTitle>
            <span className="glass shrink-0 rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-widest text-apple-green">
              2026 Edition
            </span>
          </div>
          <DialogDescription className="text-xs leading-relaxed">
            Senior Full-Stack Engineer &amp; UI/UX Specialist ·{" "}
            <span className="font-mono text-[11px]">{person.email}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="glass-divider mt-5" />

        {/* Professional Experience */}
        <section className="mt-5">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Professional Experience
          </h3>
          <ol className="mt-4">
            {experience.map((item, index) => (
              <li
                key={`${item.company}-${item.period}`}
                className={`relative border-l border-[var(--glass-border)] pl-5 ${
                  index < experience.length - 1 ? "pb-5" : ""
                }`}
              >
                <span className="absolute -left-[3px] top-1.5">
                  {item.current ? (
                    <span className="status-dot inline-block" />
                  ) : (
                    <span className="inline-block size-[7px] rounded-full bg-[var(--muted-foreground)] opacity-50" />
                  )}
                </span>
                <p className="text-sm font-medium">{item.role}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {item.company} · {item.period}
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </li>
            ))}
          </ol>
        </section>

        <div className="glass-divider mt-5" />

        {/* Core Skills */}
        <section className="mt-5">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Core Skills
          </h3>
          <div className="mt-4 flex flex-col gap-3">
            {SKILL_ROWS.map((row) => (
              <div
                key={row.label}
                className="flex flex-col gap-1.5 sm:flex-row sm:items-baseline sm:gap-3"
              >
                <span className="w-24 shrink-0 text-xs text-muted-foreground">{row.label}</span>
                <div className="flex flex-wrap gap-1.5">
                  {row.items.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-[var(--glass-border)] bg-[var(--secondary)] px-2 py-0.5 text-[11px] text-foreground/90"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Actions */}
        <div className="mt-6 flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() =>
              toast.success("Resume downloaded", {
                description: "rayhan-resume-2026.pdf",
              })
            }
            className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition hover:brightness-110 active:scale-[0.98]"
          >
            <Download className="size-4 text-apple-green" />
            Download PDF
          </button>
          <button
            type="button"
            onClick={handleHireClick}
            className="inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold transition hover:brightness-110 active:scale-[0.98]"
            style={{ backgroundColor: "var(--apple-green)", color: "#0b0b0d" }}
          >
            Hire Rayhan
          </button>
          <span className="ml-auto hidden items-center gap-2 text-xs text-muted-foreground sm:inline-flex">
            <span className="status-dot inline-block" />
            {person.availability}
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
