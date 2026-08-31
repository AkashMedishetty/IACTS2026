"use client";

import { useEffect, useState } from "react";
import Magnetic from "@/components/ui/Magnetic";
import { NAV_ITEMS } from "@/lib/constants";

/**
 * Floating dock. Appears once the hero is behind you, carries a scroll-progress
 * rule, and highlights the section currently in view.
 *
 * Real nav, not decoration: the links are anchors, they are keyboard reachable,
 * and the active state is driven by an IntersectionObserver over the actual
 * section ids rather than by scroll arithmetic that drifts.
 */
export default function Dock() {
  const [shown, setShown] = useState(false);
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState<string>("");

  useEffect(() => {
    const onScroll = () => {
      const span = Math.max(1, document.body.scrollHeight - window.innerHeight);
      setProgress(Math.min(1, window.scrollY / span));
      setShown(window.scrollY > window.innerHeight * 0.7);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    const ids = NAV_ITEMS.map((n) => n.href.slice(1));
    const els = ids
      .map((id) => document.getElementById(id))
      .filter((e): e is HTMLElement => !!e);

    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (vis) setActive(vis.target.id);
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    els.forEach((e) => io.observe(e));

    return () => {
      window.removeEventListener("scroll", onScroll);
      io.disconnect();
    };
  }, []);

  return (
    <nav
      aria-label="Sections"
      /* Centred with flex, NOT left-1/2 + -translate-x-1/2. The show/hide
         animation needs an inline transform, and an inline transform overrides
         the Tailwind translate class — the two fought each other and the whole
         pill sat half off the left edge at 360px (measured L=-156 R=180).
         inset-x-0 + justify-center cannot collide with a translateY. */
      className="pointer-events-none fixed inset-x-0 bottom-[clamp(0.9rem,2.4vh,1.8rem)] z-50 flex justify-center px-3 transition-opacity duration-700 ease-[var(--ease-out-expo)]"
      style={{ opacity: shown ? 1 : 0 }}
    >
      <div
        className="pointer-events-auto max-w-full overflow-hidden rounded-full border border-[var(--hair-gold)] bg-white/80 backdrop-blur-xl transition-transform duration-700 ease-[var(--ease-out-expo)]"
        style={{
          transform: `translateY(${shown ? "0" : "18px"})`,
          pointerEvents: shown ? "auto" : "none",
        }}
      >
        <div
          className="flex items-center gap-1 overflow-x-auto px-2 py-1.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {NAV_ITEMS.map((n) => {
            const on = active === n.href.slice(1);
            return (
              <Magnetic key={n.href} strength={0.22}>
                <a
                  href={n.href}
                  className={`block min-h-[34px] shrink-0 rounded-full px-3 py-2 font-mono text-[9.5px] uppercase tracking-[0.16em] no-underline transition-colors duration-300 ${
                    on ? "bg-crimson text-bone" : "text-muted hover:text-bone"
                  }`}
                >
                  {n.label}
                </a>
              </Magnetic>
            );
          })}
        </div>
        <div className="h-px w-full bg-white/10">
          <div
            className="h-px bg-gold transition-[width] duration-200 ease-out"
            style={{ width: `${(progress * 100).toFixed(1)}%` }}
          />
        </div>
      </div>
    </nav>
  );
}
