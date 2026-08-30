"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/* Registered once, guarded so Fast Refresh cannot double-register. */
let registered = false;
export function registerGsap() {
  if (registered || typeof window === "undefined") return;
  gsap.registerPlugin(ScrollTrigger);
  registered = true;
}

export const EASE = {
  field: "power3.out",
  expo: "expo.out",
  quint: "power4.inOut",
} as const;

export function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Staggered reveal for any subtree containing [data-reveal] elements.
 * Reduced-motion visitors get the final state immediately (globals.css
 * already neutralises the hidden start), so nothing is ever stranded.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(opts?: {
  stagger?: number;
  y?: number;
  start?: string;
  duration?: number;
}) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    if (prefersReducedMotion()) return;
    registerGsap();

    const targets = root.querySelectorAll<HTMLElement>("[data-reveal]");
    if (!targets.length) return;

    const ctx = gsap.context(() => {
      gsap.to(targets, {
        opacity: 1,
        y: 0,
        duration: opts?.duration ?? 1.05,
        ease: EASE.expo,
        stagger: opts?.stagger ?? 0.075,
        scrollTrigger: {
          trigger: root,
          start: opts?.start ?? "top 82%",
          once: true,
        },
      });
    }, root);

    return () => ctx.revert();
  }, [opts?.stagger, opts?.y, opts?.start, opts?.duration]);

  return ref;
}

/**
 * Depth parallax. `depth` is a multiplier: negative moves against the
 * scroll (reads as further away), positive moves with it.
 * Transform-only, so it stays on the compositor.
 */
export function useParallax<T extends HTMLElement = HTMLDivElement>(depth = 0.18) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) return;
    registerGsap();

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { yPercent: -depth * 50 },
        {
          yPercent: depth * 50,
          ease: "none",
          scrollTrigger: {
            trigger: el.parentElement ?? el,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        },
      );
    });

    return () => ctx.revert();
  }, [depth]);

  return ref;
}

/**
 * Per-character or per-word entrance for a heading.
 * Splits in the DOM (no paid plugin) and preserves the accessible text
 * by keeping the original string in an aria-label on the host element.
 */
export function useSplitReveal<T extends HTMLElement = HTMLHeadingElement>(
  mode: "char" | "word" = "word",
) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const original = el.textContent ?? "";
    if (prefersReducedMotion()) return;
    registerGsap();

    el.setAttribute("aria-label", original);
    const units = mode === "char" ? original.split("") : original.split(/(\s+)/);

    el.textContent = "";
    const spans: HTMLSpanElement[] = [];
    for (const unit of units) {
      if (/^\s+$/.test(unit)) {
        el.appendChild(document.createTextNode(unit));
        continue;
      }
      const outer = document.createElement("span");
      outer.style.display = "inline-block";
      outer.style.overflow = "hidden";
      outer.style.verticalAlign = "top";
      const inner = document.createElement("span");
      inner.style.display = "inline-block";
      inner.textContent = unit;
      outer.appendChild(inner);
      outer.setAttribute("aria-hidden", "true");
      el.appendChild(outer);
      spans.push(inner);
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        spans,
        { yPercent: 108, rotate: 1.5 },
        {
          yPercent: 0,
          rotate: 0,
          duration: 1.15,
          ease: EASE.expo,
          stagger: mode === "char" ? 0.022 : 0.06,
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        },
      );
    });

    return () => {
      ctx.revert();
      el.textContent = original;
      el.removeAttribute("aria-label");
    };
  }, [mode]);

  return ref;
}

export { gsap, ScrollTrigger };
