"use client";

import dynamic from "next/dynamic";
import { Check, Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import type { Project } from "@/lib/portfolio-data";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { playSound } from "@/lib/sound";

const PulseAIDemo = dynamic(() => import("./demos/pulseai-demo"));
const AuraDemo = dynamic(() => import("./demos/aura-demo"));
const EcoTrackDemo = dynamic(() => import("./demos/ecotrack-demo"));
const DevCanvasDemo = dynamic(() => import("./demos/devcanvas-demo"));

function Demo({ id }: { id: string }) {
  switch (id) {
    case "pulseai":
      return <PulseAIDemo />;
    case "auraui":
      return <AuraDemo />;
    case "ecotrack":
      return <EcoTrackDemo />;
    case "devcanvas":
      return <DevCanvasDemo />;
    default:
      return null;
  }
}

export function ProjectDialog({
  project,
  open,
  onOpenChange,
}: {
  project: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!project) return null;

  const copyRepo = () => {
    playSound("pop");
    navigator.clipboard
      ?.writeText(`https://github.com/rayhan-dev/${project.id}`)
      .then(() =>
        toast.success("Source repository link copied", {
          description: "github.com/rayhan-dev/" + project.id,
        })
      )
      .catch(() => toast.error("Could not access clipboard"));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[86vh] max-w-2xl gap-0 overflow-y-auto rounded-3xl border border-[var(--line-strong)] bg-popover p-0">
        <div className="p-6 sm:p-8">
          <span className="font-tag inline-flex items-center gap-1.5 rounded-full border border-ember/40 bg-ember/10 px-3 py-1 text-[9px] text-ember-bright">
            {project.tag}
          </span>
          <DialogTitle className="font-display mt-4 text-2xl tracking-tight">
            {project.title}
            <span className="text-muted-foreground/60"> · {project.subtitle}</span>
          </DialogTitle>
          <DialogDescription className="mt-3 text-[14.5px] leading-relaxed text-muted-foreground">
            {project.description}
          </DialogDescription>

          {/* Metrics */}
          <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-3">
            {project.metrics.map((m) => (
              <div
                key={m}
                className="rounded-2xl border border-[var(--line)] bg-[rgba(243,236,227,0.04)] px-4 py-3 text-center text-xs font-semibold"
              >
                {m}
              </div>
            ))}
          </div>

          {/* Live demo */}
          <div className="mt-6">
            <p className="font-tag mb-3 text-[9.5px] text-muted-foreground">Live Interactive Demo</p>
            <Demo id={project.id} />
          </div>

          {/* Features */}
          <div className="mt-6">
            <p className="font-tag mb-3 text-[9.5px] text-muted-foreground">Key Features</p>
            <ul className="space-y-2" role="list">
              {project.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                  <span className="mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full border border-ember/40 bg-ember/10">
                    <Check className="h-3 w-3 text-ember-bright" />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Tech */}
          <div className="mt-6 flex flex-wrap gap-1.5">
            {project.tech.map((t) => (
              <span
                key={t}
                className="font-tag rounded-full border border-[var(--line)] px-3 py-1.5 text-[9.5px] text-muted-foreground"
              >
                {t}
              </span>
            ))}
          </div>

          {/* Actions */}
          <div className="mt-7 flex flex-col gap-2.5 sm:flex-row">
            <button
              onClick={copyRepo}
              className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full border border-[var(--line-strong)] text-sm font-semibold transition-all duration-300 hover:scale-[1.02] hover:border-ember/60 active:scale-95"
            >
              <Copy className="h-4 w-4" />
              Copy Repo Link
            </button>
            <button
              onClick={() => {
                playSound("tap");
                onOpenChange(false);
                setTimeout(
                  () => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" }),
                  120
                );
              }}
              className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-ember text-sm font-semibold text-white transition-all duration-300 hover:scale-[1.02] hover:bg-ember-bright active:scale-95"
            >
              <ExternalLink className="h-4 w-4" />
              Discuss This Build
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
