"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Seamless marquee. Children are duplicated once and the track translates by
 * exactly -50%, so the loop has no seam at any content width. Pauses on hover;
 * stands still under reduced motion.
 */
export function Marquee({
  children,
  seconds = 38,
  reverse = false,
  className = "",
}: {
  children: ReactNode;
  seconds?: number;
  reverse?: boolean;
  className?: string;
}) {
  const track = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let x = reverse ? -50 : 0;
    let last = performance.now();
    let rate = 1;
    const per = 50 / seconds; // percent per second

    const step = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      x += (reverse ? per : -per) * dt * rate;
      if (x <= -50) x += 50;
      if (x >= 0) x -= 50;
      el.style.transform = `translate3d(${x}%,0,0)`;
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);

    const slow = () => { rate = 0.16; };
    const full = () => { rate = 1; };
    el.addEventListener("pointerenter", slow);
    el.addEventListener("pointerleave", full);

    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointerenter", slow);
      el.removeEventListener("pointerleave", full);
    };
  }, [seconds, reverse]);

  return (
    <div className={`overflow-hidden ${className}`}>
      <div ref={track} className="flex w-max will-change-transform">
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden="true">{children}</div>
      </div>
    </div>
  );
}
