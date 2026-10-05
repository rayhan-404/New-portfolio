"use client";

import { AppBackground } from "./app-background";
import { GlobalThunder } from "./global-thunder";
import { SpotlightDriver } from "./spotlight";
import { NAV_ITEMS, scrollToSection, useActiveSection } from "./nav";
import { NavRail, type NavCategory } from "./nav-rail";
import { SideRailRight } from "./side-rails";
import { playSound } from "@/lib/sound";
import { SlideSection } from "./slide-section";
import { AdminPanel } from "./admin-panel";
import { HeroSection } from "./hero-section";
import { JourneySection } from "./journey-section";
import { ProjectsSection } from "./projects-section";
import { SkillsSection } from "./skills-section";
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

      {/* Neumorphic button rail with border progress — mobile (54px) too */}
      <NavRail
        categories={CATEGORIES}
        activeIndex={activeIndex}
        onSelectCategory={(index) => {
          playSound("tap");
          scrollToSection(NAV_ITEMS[index].id);
        }}
      />

      {/* Utility rail (socials / status / CTA) — desktop only */}
      <SideRailRight />

      {/* site-wide storm — bolts + room flash over every section */}
      <GlobalThunder />

      {/* v92 spotlight driver — one listener feeds --mx/--my to every
          .spot-host card under the cursor (pointer-fine devices only) */}
      <SpotlightDriver />

      {/* control room — passcode-gated admin overlay (?admin=1 / gear / Ctrl+Shift+A) */}
      <AdminPanel />

      {/* Content column: left pad = notch sidebar width, right pad = rail */}
      <div className="flex min-h-svh flex-col pl-[54px] sm:pl-[62px] md:pl-[74px] md:pr-[88px]">
        <main className="flex-1">
          <SlideSection id="home">
            <HeroSection />
          </SlideSection>
          <SlideSection id="journey">
            <JourneySection />
          </SlideSection>
          <SlideSection id="projects">
            <ProjectsSection />
          </SlideSection>
          <SlideSection id="skills">
            <SkillsSection />
          </SlideSection>
          <SlideSection id="contact">
            <ContactSection />
          </SlideSection>
        </main>
        <Footer />
      </div>
    </>
  );
}
