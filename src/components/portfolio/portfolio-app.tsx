"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import { AppBackground } from "./app-background";
import { GlobalThunder } from "./global-thunder";
import { SpotlightDriver } from "./spotlight";
import { NAV_ITEMS, scrollToSection, useActiveSection } from "./nav";
import { NavRail, type NavCategory } from "./nav-rail";
import { SideRailRight } from "./side-rails";
import { playSound } from "@/lib/sound";
import { SlideSection } from "./slide-section";
import { ADMIN_OPEN_EVENT, openAdminPanel, wantsAdminDeepLink } from "./admin-open";
import { HeroSection } from "./hero-section";
import { JourneySection } from "./journey-section";
import { ProjectsSection } from "./projects-section";
import { SkillsSection } from "./skills-section";
import { ContactSection } from "./contact-section";
import { Footer } from "./footer";

/* Control room — v93: split into an on-demand chunk. The 1,700-line
   panel (+ its imports) no longer sits in the critical path; the chunk
   is fetched the first time the panel is actually summoned, then the
   element stays mounted so passcode session + tab state persist. */
const AdminPanel = dynamic(
  () => import("./admin-panel").then((m) => m.AdminPanel),
  { ssr: false }
);

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

  /* v93 admin mount gate — the dynamic chunk mounts on the FIRST open
     trigger only (gear event, Ctrl+Shift+A, or ?admin=1). The panel
     keeps its own toggle/close logic once alive. */
  const [adminMounted, setAdminMounted] = useState(() => wantsAdminDeepLink());
  useEffect(() => {
    const mount = () => setAdminMounted(true);
    window.addEventListener(ADMIN_OPEN_EVENT, mount);
    /* pre-open on the keyboard shortcut: route through the open channel
       so the pending flag is set — the panel opens on its first mount */
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "a") {
        openAdminPanel();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener(ADMIN_OPEN_EVENT, mount);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

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

      {/* control room — passcode-gated admin overlay (?admin=1 / gear / Ctrl+Shift+A).
          v93: on-demand chunk, mounted at the first summons. */}
      {adminMounted && <AdminPanel />}

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
