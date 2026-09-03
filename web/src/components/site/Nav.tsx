"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, registerGsap, prefersReducedMotion } from "@/lib/motion";
import { conference } from "@/data/conference";

const LINKS = [
  { href: "#programme", label: "Programme" },
  { href: "#capabilities", label: "Technology" },
  { href: "#highlights", label: "Highlights" },
  { href: "#people", label: "Committee" },
  { href: "#venues", label: "Venue" },
];

function Seal() {
  return (
    <span
      aria-hidden="true"
      className="grid size-9 shrink-0 place-items-center rounded-full border-[1.5px] border-crimson"
    >
      <svg viewBox="0 0 12 12" className="size-3 fill-crimson">
        <path d="M6 11.2S0.4 7 0.4 3.8A3.4 3.4 0 0 1 6 1.2 3.4 3.4 0 0 1 11.6 3.8C11.6 7 6 11.2 6 11.2Z" />
      </svg>
    </span>
  );
}

export default function Nav() {
  const bar = useRef<HTMLElement | null>(null);
  const [open, setOpen] = useState(false);

  /* condense + hide-on-scroll-down, reveal-on-scroll-up */
  useEffect(() => {
    const el = bar.current;
    if (!el) return;
    if (prefersReducedMotion()) return;
    registerGsap();

    let last = window.scrollY;
    let hidden = false;

    const onScroll = () => {
      const y = window.scrollY;
      const condensed = y > 120;

      gsap.to(el, {
        backgroundColor: condensed ? "rgba(247,244,239,0.82)" : "rgba(247,244,239,0)",
        borderBottomColor: condensed ? "rgba(42,42,42,0.13)" : "rgba(42,42,42,0)",
        paddingTop: condensed ? 10 : 18,
        paddingBottom: condensed ? 10 : 18,
        duration: 0.45,
        ease: "power3.out",
        overwrite: "auto",
      });

      // never hide while the menu is open or focus is inside the bar
      const focusInside = el.contains(document.activeElement);
      const goingDown = y > last && y > 320;
      if (!open && !focusInside && goingDown !== hidden) {
        hidden = goingDown;
        gsap.to(el, {
          yPercent: hidden ? -100 : 0,
          duration: 0.5,
          ease: "power3.out",
          overwrite: "auto",
        });
      }
      last = y;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [open]);

  /* overlay: escape to close, lock body scroll, stagger links in */
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);

    if (!prefersReducedMotion()) {
      registerGsap();
      gsap.fromTo(
        "[data-menu-link]",
        { yPercent: 110, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 0.8, ease: "expo.out", stagger: 0.06, delay: 0.08 },
      );
    }

    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <header
        ref={bar}
        className="fixed inset-x-0 top-0 z-50 border-b border-transparent backdrop-blur-[6px] will-change-transform"
        style={{ paddingTop: 18, paddingBottom: 18 }}
      >
        <div className="u-shell flex items-center justify-between gap-6">
          <a href="#main" className="flex items-center gap-3 no-underline">
            <Seal />
            <span className="text-[11.5px] font-semibold leading-[1.3]">
              Indian Association of
              <span className="block font-medium text-ink-soft">
                Cardiovascular-Thoracic Surgeons
              </span>
            </span>
          </a>

          <nav aria-label="Sections" className="hidden items-center gap-7 lg:flex">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="u-eyebrow transition-colors duration-300 hover:text-crimson"
              >
                {l.label}
              </a>
            ))}
            <a
              href="/register"
              className="u-eyebrow border border-[var(--hair-gold)] px-3.5 py-2 text-crimson transition-colors duration-300 hover:bg-crimson hover:text-bone"
            >
              Register · Soon
            </a>
          </nav>

          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-expanded={open}
            aria-label="Open menu"
            className="u-eyebrow -mr-2 flex size-11 items-center justify-center lg:hidden"
          >
            <span aria-hidden="true" className="relative block h-2.5 w-6">
              <span className="absolute inset-x-0 top-0 h-px bg-ink" />
              <span className="absolute inset-x-0 bottom-0 h-px bg-ink" />
            </span>
          </button>
        </div>
      </header>

      {open ? (
        <div className="fixed inset-0 z-[60] flex flex-col bg-bone lg:hidden">
          <div className="u-shell flex items-center justify-between py-[18px]">
            <Seal />
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="u-eyebrow flex size-11 items-center justify-center text-crimson"
            >
              Close
            </button>
          </div>
          <nav
            aria-label="Sections"
            className="u-shell flex flex-1 flex-col justify-center gap-1 pb-16"
          >
            {LINKS.map((l, i) => (
              <span key={l.href} className="block overflow-hidden py-1">
                <a
                  data-menu-link
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="u-display block text-[clamp(2.2rem,11vw,3.4rem)] font-extrabold"
                >
                  <span className="mr-4 align-super font-mono text-[0.6rem] text-gold">
                    0{i + 1}
                  </span>
                  {l.label}
                </a>
              </span>
            ))}
            <span className="mt-8 block overflow-hidden">
              <a
                data-menu-link
                href="/register"
                onClick={() => setOpen(false)}
                className="u-eyebrow inline-block border border-[var(--hair-gold)] px-4 py-3 text-crimson"
              >
                Register · Opening soon
              </a>
            </span>
            <p className="u-eyebrow mt-10">{conference.dates.label} · {conference.city}</p>
          </nav>
        </div>
      ) : null}
    </>
  );
}
