"use client";

import { useState } from "react";
import { EmberScene } from "./ember-scene";
import { SideRail, useActiveSection } from "./side-rail";
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
      <EmberScene />
      <SideRail />
      <MobileHeader onOpenMenu={() => setMenuOpen(true)} />
      <MenuOverlay open={menuOpen} onOpenChange={setMenuOpen} active={active} />

      <div className="flex min-h-svh flex-col md:pl-20 lg:pl-24">
        <main className="flex-1">
          <HeroSection onOpenMenu={() => setMenuOpen(true)} />
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
