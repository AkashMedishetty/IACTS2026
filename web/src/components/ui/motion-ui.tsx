"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap, registerGsap, prefersReducedMotion, useReveal } from "@/lib/motion";

/** Wrap any subtree; its [data-reveal] children stagger in on scroll. */
export function Reveal({
  children,
  className = "",
  stagger,
  start,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
  start?: string;
}) {
  const ref = useReveal<HTMLDivElement>({ stagger, start });
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

/**
 * Seamless marquee. Duplicates its children once and translates by exactly
 * -50%, so the loop has no visible seam regardless of content width.
 * Pauses on hover and honours reduced-motion by simply not moving.
 */
export function Marquee({
  children,
  speed = 34,
  reverse = false,
  className = "",
}: {
  children: ReactNode;
  speed?: number;
  reverse?: boolean;
  className?: string;
}) {
  const track = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    if (prefersReducedMotion()) return;
    registerGsap();

    const tween = gsap.to(el, {
      xPercent: reverse ? 50 : -50,
      ease: "none",
      duration: speed,
      repeat: -1,
    });
    if (reverse) gsap.set(el, { xPercent: -50 });

    const enter = () => tween.timeScale(0.18);
    const leave = () => tween.timeScale(1);
    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointerleave", leave);

    return () => {
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointerleave", leave);
      tween.kill();
    };
  }, [speed, reverse]);

  return (
    <div className={`overflow-hidden ${className}`}>
      <div ref={track} className="flex w-max will-change-transform">
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
}

/**
 * Magnetic hover: the element leans toward the pointer and springs back.
 * Pointer-fine only — on touch it would fire on every tap and feel broken.
 */
export function Magnetic({
  children,
  strength = 0.28,
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
    if (prefersReducedMotion()) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      gsap.to(el, {
        x: (e.clientX - (r.left + r.width / 2)) * strength,
        y: (e.clientY - (r.top + r.height / 2)) * strength,
        duration: 0.55,
        ease: "power3.out",
      });
    };
    const reset = () =>
      gsap.to(el, { x: 0, y: 0, duration: 0.75, ease: "elastic.out(1, 0.42)" });

    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", reset);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", reset);
      gsap.killTweensOf(el);
    };
  }, [strength]);

  return (
    <span ref={ref} className={`inline-block ${className}`}>
      {children}
    </span>
  );
}

/** Link with a crimson underline that wipes in from the left. */
export function WipeLink({
  href,
  children,
  className = "",
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <a
      href={href}
      className={`group relative inline-block ${className}`}
    >
      <span>{children}</span>
      <span
        aria-hidden="true"
        className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-crimson transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:scale-x-100 group-focus-visible:scale-x-100"
      />
    </a>
  );
}
