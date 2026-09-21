"use client";

import { useState } from "react";
import { AppBackground } from "./app-background";
import { useActiveSection } from "./nav";
import { MenuOverlay } from "./menu-overlay";
import { MobileHeader } from "./mobile-header";
import { SideRailLeft, SideRailRight } from "./side-rails";
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
      {/* Full-height glass side rails (desktop) */}
      <SideRailLeft active={active} onOpenMenu={() => setMenuOpen(true)} />
      <SideRailRight />
      <MobileHeader onOpenMenu={() => setMenuOpen(true)} />
      <MenuOverlay open={menuOpen} onOpenChange={setMenuOpen} active={active} />

      {/* Content column sits between the two 100%-height rails */}
      <div className="flex min-h-svh flex-col md:pl-[88px] md:pr-[88px]">
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
