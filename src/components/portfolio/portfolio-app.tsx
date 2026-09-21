"use client";

import { useState } from "react";
import { AppBackground } from "./app-background";
import { FloatingNav, useActiveSection } from "./nav";
import { MenuOverlay } from "./menu-overlay";
import { MobileHeader } from "./mobile-header";
import { HeroSection } from "./hero-section";
import { ProjectsSection } from "./projects-section";
import { AboutSection } from "./about-section";
import { SkillsSection } from "./skills-section";
import { ServicesSection } from "./services-section";
import { ContactSection } from "./contact-section";
import { Footer } from "./footer";

export function PortfolioApp() {
  const [menuOpen, setMenuOpen] = useState(false);
  const active = useActiveSection();

  return (
    <>
      <AppBackground />
      <FloatingNav />
      <MobileHeader onOpenMenu={() => setMenuOpen(true)} />
      <MenuOverlay open={menuOpen} onOpenChange={setMenuOpen} active={active} />

      <div className="flex min-h-svh flex-col">
        <main className="flex-1">
          <HeroSection />
          <ProjectsSection />
          <AboutSection />
          <SkillsSection />
          <ServicesSection />
          <ContactSection />
        </main>
        <Footer />
      </div>
    </>
  );
}
