"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Magnetic hover: the element leans toward the pointer and springs back.
 *
 * Pointer-fine only — on touch it would fire on every tap and feel broken.
 * Spring return is hand-tuned rather than a library default: overshoot then
 * settle, which is what makes it read as physical instead of eased.
 */
export default function Magnetic({
  children,
  strength = 0.3,
  className = "",
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    let raf = 0;
    let tx = 0, ty = 0, x = 0, y = 0, vx = 0, vy = 0;
    let engaged = false;

    const tick = () => {
      // critically-damped-ish spring: stiffness 0.16, damping 0.76
      vx = (vx + (tx - x) * 0.16) * 0.76;
      vy = (vy + (ty - y) * 0.16) * 0.76;
      x += vx;
      y += vy;
      el.style.transform = `translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0)`;
      if (engaged || Math.abs(x) > 0.05 || Math.abs(y) > 0.05 || Math.abs(vx) > 0.01) {
        raf = requestAnimationFrame(tick);
      } else {
        el.style.transform = "";
        raf = 0;
      }
    };

    const start = () => { if (!raf) raf = requestAnimationFrame(tick); };

    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      tx = (e.clientX - (r.left + r.width / 2)) * strength;
      ty = (e.clientY - (r.top + r.height / 2)) * strength;
      engaged = true;
      start();
    };
    const leave = () => { tx = 0; ty = 0; engaged = false; start(); };

    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, [strength]);

  return (
    <span ref={ref} className={`inline-block will-change-transform ${className}`}>
      {children}
    </span>
  );
}
