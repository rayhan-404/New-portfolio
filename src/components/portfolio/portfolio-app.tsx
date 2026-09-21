"use client";

import { AppBackground } from "./app-background";
import { NAV_ITEMS, scrollToSection, useActiveSection } from "./nav";
import { SidebarNotchNav, type NavCategory } from "@/components/SidebarNotchNav";
import { SideRailRight } from "./side-rails";
import { playSound } from "@/lib/sound";
import { HeroSection } from "./hero-section";
import { ProjectsSection } from "./projects-section";
import { AboutSection } from "./about-section";
import { SkillsSection } from "./skills-section";
import { ServicesSection } from "./services-section";
import { ContactSection } from "./contact-section";
import { Footer } from "./footer";

const CATEGORIES: NavCategory[] = NAV_ITEMS.map((n) => ({
  id: n.id,
  label: n.label,
}));

export function PortfolioApp() {
  const active = useActiveSection();
  const activeIndex = Math.max(
    0,
    NAV_ITEMS.findIndex((n) => n.id === active)
  );

  return (
    <>
      <AppBackground />

      {/* Glassmorphic sidebar with sliding notch — visible on mobile (54px) too */}
      <SidebarNotchNav
        categories={CATEGORIES}
        activeIndex={activeIndex}
        onSelectCategory={(index) => {
          playSound("tap");
          scrollToSection(NAV_ITEMS[index].id);
        }}
        savedCount={2}
        onOpenContact={() => {
          playSound("chime");
          scrollToSection("contact");
        }}
      />

      {/* Utility rail (socials / status / CTA) — desktop only */}
      <SideRailRight />

      {/* Content column: left pad = notch sidebar width, right pad = rail */}
      <div className="flex min-h-svh flex-col pl-[54px] sm:pl-[62px] md:pl-[74px] md:pr-[88px]">
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
