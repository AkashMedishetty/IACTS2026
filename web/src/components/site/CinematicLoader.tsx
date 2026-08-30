"use client";

import { useEffect, useRef, useState } from "react";
import { EVENT_INFO } from "@/lib/constants";

/**
 * Entrance curtain. Counts to 100 on a real clock, then lifts.
 *
 * Two safeguards, because a loader that fails to dismiss is worse than no
 * loader at all: it self-dismisses on a hard timeout even if rAF stalls, and
 * under reduced motion it never mounts. It is also aria-hidden and inert —
 * screen readers and keyboard users go straight to the page.
 */
export default function CinematicLoader() {
  const [pct, setPct] = useState(0);
  const [gone, setGone] = useState(false);
  const raf = useRef(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setGone(true);
      return;
    }
    const t0 = performance.now();
    const DUR = 1500;

    const step = (now: number) => {
      const k = Math.min(1, (now - t0) / DUR);
      // ease-out-expo so it sprints then settles
      const eased = k === 1 ? 1 : 1 - Math.pow(2, -10 * k);
      setPct(Math.round(eased * 100));
      if (k < 1) raf.current = requestAnimationFrame(step);
      else setTimeout(() => setGone(true), 260);
    };
    raf.current = requestAnimationFrame(step);

    // hard backstop: never trap the page behind a stalled clock
    const bail = setTimeout(() => setGone(true), 3200);

    return () => {
      cancelAnimationFrame(raf.current);
      clearTimeout(bail);
    };
  }, []);

  if (gone) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[80] flex flex-col justify-between bg-ink px-[clamp(1rem,3vw,3.25rem)] py-[clamp(1.2rem,3vh,2.4rem)] transition-opacity duration-500"
      style={{ opacity: pct >= 100 ? 0 : 1 }}
    >
      <div className="flex items-start justify-between">
        <p className="u-eyebrow">{EVENT_INFO.acronym} · Technocollege CME 2026</p>
        <p className="u-eyebrow text-gold-lift">{EVENT_INFO.city}</p>
      </div>

      <div className="flex items-end justify-between gap-6">
        <p className="u-serif text-[clamp(1.4rem,4vw,3rem)] leading-none">
          {EVENT_INFO.theme}
        </p>
        <p
          className="font-mono text-[clamp(2.4rem,7vw,6rem)] font-medium leading-none tabular-nums text-bone"
          style={{ letterSpacing: "-0.04em" }}
        >
          {String(pct).padStart(3, "0")}
        </p>
      </div>

      <div className="mt-[clamp(0.8rem,2vh,1.4rem)] h-px w-full bg-white/10">
        <div
          className="h-px bg-crimson-lift transition-[width] duration-150 ease-linear"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
