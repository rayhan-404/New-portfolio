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
      <DialogContent className="max-h-[85vh] gap-0 overflow-y-auto rounded-[1.75rem] border-white/25 bg-[rgba(58,13,5,0.72)] backdrop-blur-2xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:max-w-xl">
        <DialogHeader className="items-start gap-1.5 text-left">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-2">
            <DialogTitle className="font-display text-lg tracking-tight">
              Rayhan&apos;s Resume
            </DialogTitle>
            <span className="glass-chip font-tag shrink-0 rounded-full px-2.5 py-1 text-[9px] text-gold-bright">
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
          <h3 className="font-tag text-[9.5px] text-white/55">Professional Experience</h3>
          <ol className="mt-4">
            {experience.map((item, index) => (
              <li
                key={`${item.company}-${item.period}`}
                className={`relative border-l border-white/20 pl-5 ${
                  index < experience.length - 1 ? "pb-5" : ""
                }`}
              >
                <span className="absolute -left-[3px] top-1.5">
                  {item.current ? (
                    <span className="status-dot inline-block" />
                  ) : (
                    <span className="inline-block size-[7px] rounded-full bg-white/40 opacity-70" />
                  )}
                </span>
                <p className="text-sm font-medium text-foreground">{item.role}</p>
                <p className="mt-0.5 text-xs text-white/60">
                  {item.company} · {item.period}
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-white/70">
                  {item.description}
                </p>
              </li>
            ))}
          </ol>
        </section>

        <div className="glass-divider mt-5" />

        {/* Core Skills */}
        <section className="mt-5">
          <h3 className="font-tag text-[9.5px] text-white/55">Core Skills</h3>
          <div className="mt-4 flex flex-col gap-3">
            {SKILL_ROWS.map((row) => (
              <div
                key={row.label}
                className="flex flex-col gap-1.5 sm:flex-row sm:items-baseline sm:gap-3"
              >
                <span className="w-24 shrink-0 text-xs text-white/60">{row.label}</span>
                <div className="flex flex-wrap gap-1.5">
                  {row.items.map((item) => (
                    <span
                      key={item}
                      className="glass-chip rounded-full px-2 py-0.5 text-[11px] text-foreground/90"
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
            className="glass-chip inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-foreground transition hover:bg-white/20 active:scale-[0.98]"
          >
            <Download className="size-4 text-gold" />
            Download PDF
          </button>
          <button
            type="button"
            onClick={handleHireClick}
            className="btn-light inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold"
          >
            Hire Rayhan
          </button>
          <span className="ml-auto hidden items-center gap-2 text-xs text-white/60 sm:inline-flex">
            <span className="status-dot inline-block" />
            {person.availability}
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
