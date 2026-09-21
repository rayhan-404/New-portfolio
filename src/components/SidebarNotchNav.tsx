"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Mail, Volume2, VolumeX } from "lucide-react";
import { useSoundEngine } from "./portfolio/nav";

export interface NavCategory {
  id: string;
  label: string;
}

interface SidebarNotchNavProps {
  categories: NavCategory[];
  activeIndex: number;
  onSelectCategory: (index: number) => void;
  savedCount?: number;
  onOpenContact?: () => void;
}

/* Half of the notch height (SVG viewBox is 76 tall) — used to clamp the
   indicator strictly within the sidebar's top and bottom bounds. */
const HALF_NOTCH = 38;

/**
 * SidebarNotchNav — vertical glassmorphic sidebar navigation.
 *
 * • Glass shell: rgba(255,255,255,.08) + 1px rgba(255,255,255,.14) right
 *   border + backdrop blur(20px), fixed narrow rail (54→74px responsive).
 * • Sliding curved SVG notch: a transparent cutout path on the right border
 *   with a glowing white 1.6px stroke and a white target dot (cx 6, cy 38,
 *   r 3) that glides vertically to the active category. Position is measured
 *   dynamically via useLayoutEffect + getBoundingClientRect + ResizeObserver
 *   and animated with a 0.38s cubic-bezier(0.25, 1, 0.5, 1) top transition.
 * • Vertical category labels: writing-mode vertical-rl rotated 180° —
 *   inactive white/60, active brand-gold with offset + glow.
 * • Actions: 4-dot brand grid on top, sound toggle + quick-contact button
 *   with a live badge counter at the bottom. Visible on mobile too (54px).
 */
export function SidebarNotchNav({
  categories,
  activeIndex,
  onSelectCategory,
  savedCount = 0,
  onOpenContact,
}: SidebarNotchNavProps) {
  const [notchTop, setNotchTop] = useState<number | null>(null);
  const navContainerRef = useRef<HTMLDivElement>(null);
  const sideItemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const { soundOn, toggle } = useSoundEngine();

  /* Dynamically calculate the active item position for the sliding notch */
  const updateNotchPosition = useCallback(() => {
    const activeEl = sideItemRefs.current[activeIndex];
    const containerEl = navContainerRef.current;
    if (!activeEl || !containerEl) return;

    const itemRect = activeEl.getBoundingClientRect();
    const containerRect = containerEl.getBoundingClientRect();
    if (containerRect.height === 0) return;

    let relativeTop = itemRect.top - containerRect.top + itemRect.height / 2;

    // Keep notch clamped strictly within sidebar top and bottom bounds
    const minTop = HALF_NOTCH;
    const maxTop = Math.max(minTop, containerRect.height - HALF_NOTCH);
    relativeTop = Math.max(minTop, Math.min(relativeTop, maxTop));

    setNotchTop(relativeTop);
  }, [activeIndex]);

  useLayoutEffect(() => {
    // rAF keeps the post-layout measure out of the synchronous effect body
    const raf = requestAnimationFrame(updateNotchPosition);
    return () => cancelAnimationFrame(raf);
  }, [updateNotchPosition, activeIndex, categories.length]);

  useEffect(() => {
    const container = navContainerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(() => {
      updateNotchPosition();
    });
    resizeObserver.observe(container);
    window.addEventListener("resize", updateNotchPosition);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateNotchPosition);
    };
  }, [updateNotchPosition]);

  return (
    <aside
      id="portfolio-sidebar"
      className="fixed inset-y-0 left-0 z-30 flex w-[54px] shrink-0 flex-col items-center overflow-visible py-4 select-none sm:w-[62px] md:w-[74px]"
      style={{
        background: "rgba(255, 255, 255, 0.08)",
        borderRight: "1px solid rgba(255, 255, 255, 0.14)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      {/* Top Brand Grid Button */}
      <button
        id="sidebar-brand-btn"
        type="button"
        onClick={() => onSelectCategory(0)}
        title="Scroll to Top / Home"
        className="group relative mb-2 shrink-0 cursor-pointer p-1.5 outline-none focus-visible:ring-1 focus-visible:ring-[#ffc46b]"
      >
        <div className="grid grid-cols-2 gap-1 rounded-lg border border-white/20 bg-white/10 p-1.5 transition-all group-hover:border-[#ffc46b]/70 group-hover:shadow-[0_0_12px_rgba(255,196,107,0.4)]">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#ffc46b]" />
          <span className="h-1.5 w-1.5 rounded-full bg-white/60 group-hover:bg-white" />
          <span className="h-1.5 w-1.5 rounded-full bg-white/60 group-hover:bg-white" />
          <span className="h-1.5 w-1.5 rounded-full bg-[#ffc46b]" />
          <span className="h-1.5 w-1.5 rounded-full bg-white/60 group-hover:bg-white" />
          <span className="h-1.5 w-1.5 rounded-full bg-[#ffc46b]" />
        </div>
      </button>

      {/* Vertical Navigation Labels Container with Sliding Transparent Notch */}
      <div
        ref={navContainerRef}
        className="relative flex w-full flex-1 flex-col items-stretch justify-around overflow-visible py-2"
      >
        {/* Custom SVG Sliding Curved Notch */}
        <svg
          id="active-category-notch"
          viewBox="0 0 24 76"
          preserveAspectRatio="none"
          className="pointer-events-none absolute right-[-1px] z-[1] h-[76px] w-[26px] overflow-visible sm:w-[30px] md:w-[34px]"
          style={{
            top: notchTop !== null ? `${notchTop}px` : "50%",
            transform: "translateY(-50%)",
            transition: "top 0.38s cubic-bezier(0.25, 1, 0.5, 1)",
            willChange: "top",
          }}
        >
          {/* Notch Cutout Path (Transparent to show page background) */}
          <path
            id="active-category-notch-path"
            d="M24,0
               L20,0
               C20,9 16,13 9,19
               C3,24 0,31 0,38
               C0,45 3,52 9,57
               C16,63 20,67 20,76
               L24,76
               Z"
            fill="transparent"
            shapeRendering="geometricPrecision"
          />
          {/* Glowing White Notch Border */}
          <path
            d="M20,0
               C20,9 16,13 9,19
               C3,24 0,31 0,38
               C0,45 3,52 9,57
               C16,63 20,67 20,76"
            fill="none"
            stroke="#ffffff"
            strokeWidth="1.6"
            filter="drop-shadow(0 0 6px rgba(255,255,255,0.7))"
          />
          {/* Glowing White Indicator Target Dot */}
          <circle
            cx="6"
            cy="38"
            r="3"
            fill="#ffffff"
            filter="drop-shadow(0 0 6px #ffffff)"
          />
        </svg>

        {categories.map((cat, idx) => {
          const isActive = idx === activeIndex;
          return (
            <button
              key={cat.id}
              id={`side-nav-${cat.id}`}
              type="button"
              ref={(el) => {
                sideItemRefs.current[idx] = el;
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onSelectCategory(idx);
              }}
              aria-current={isActive ? "page" : undefined}
              className="relative z-[2] flex w-full cursor-pointer items-center justify-center rounded border-0 bg-transparent py-2.5 px-0 outline-none focus-visible:ring-1 focus-visible:ring-[#ffc46b] group"
            >
              {/* Vertical Text Label */}
              <span
                className={`pointer-events-none relative z-[2] text-[9.5px] font-bold whitespace-nowrap uppercase transition-all duration-300 ease-out sm:text-[10.5px] md:text-[11px] sm:tracking-[1.6px] tracking-[1.4px] ${
                  isActive
                    ? "-translate-x-[7px] scale-105 text-[#ffd894] drop-shadow-[0_0_8px_rgba(255,196,107,0.6)] sm:-translate-x-[9px]"
                    : "translate-x-0 text-white/60 group-hover:text-white"
                }`}
                style={{
                  writingMode: "vertical-rl",
                  transform: "rotate(180deg)",
                  fontFamily: "sans-serif",
                }}
              >
                {cat.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Bottom Action Controls */}
      <div className="mt-auto flex shrink-0 flex-col items-center gap-2 pt-2">
        <button
          id="sound-toggle-btn"
          aria-label={soundOn ? "Mute sounds" : "Unmute sounds"}
          onClick={toggle}
          className="flex h-[30px] w-[30px] items-center justify-center rounded-full border border-white/20 bg-white/10 text-white/80 backdrop-blur-sm transition-all hover:bg-white/20 hover:text-white active:scale-90 sm:h-[34px] sm:w-[34px]"
        >
          {soundOn ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
        </button>

        {onOpenContact && (
          <button
            id="quick-contact-btn"
            aria-label="Contact"
            onClick={onOpenContact}
            className="relative flex h-[30px] w-[30px] items-center justify-center rounded-full bg-gradient-to-b from-[#ffd894] to-[#ff9f2e] text-[#7c1a06] shadow-[0_0_12px_rgba(255,159,46,0.35)] transition-all hover:brightness-105 hover:shadow-[0_0_18px_rgba(255,159,46,0.6)] active:scale-90 sm:h-[34px] sm:w-[34px]"
          >
            <Mail className="h-3.5 w-3.5" />
            {savedCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 animate-bounce items-center justify-center rounded-full bg-[#ff453a] text-[8.5px] font-extrabold text-white shadow-md">
                {savedCount}
              </span>
            )}
          </button>
        )}
      </div>
    </aside>
  );
}
