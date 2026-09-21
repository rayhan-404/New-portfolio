"use client";

import { useState } from "react";
import { AuroraBackground } from "./aurora-background";
import { GlassNav } from "./glass-nav";
import { Hero } from "./hero";
import { AboutSection } from "./about-section";
import { ProjectsSection } from "./projects-section";
import { SkillsSection } from "./skills-section";
import { ContactSection } from "./contact-section";
import { Footer } from "./footer";
import ResumeDialog from "./resume-dialog";

export function PortfolioApp() {
  const [resumeOpen, setResumeOpen] = useState(false);

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <>
      <AuroraBackground />
      <GlassNav onResume={() => setResumeOpen(true)} />

      <main className="flex-1">
        <Hero
          onResume={() => setResumeOpen(true)}
          onContact={() => scrollTo("contact")}
          onProjects={() => scrollTo("projects")}
        />
        <AboutSection onResume={() => setResumeOpen(true)} />
        <ProjectsSection />
        <SkillsSection />
        <ContactSection />
      </main>

      <Footer />
      <ResumeDialog open={resumeOpen} onOpenChange={setResumeOpen} />
    </>
  );
}
