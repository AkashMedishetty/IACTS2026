"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "motion/react";
import { conference, days, secretariat } from "@/data/conference";
import { STATS } from "@/lib/constants";
import type { InteractionState } from "@/components/anatomy/AnatomyParticles";

const AnatomyScene = dynamic(() => import("@/components/anatomy/AnatomyScene"), {
  ssr: false,
});

const navigation = [
  ["About", "#about"],
  ["Programme", "#programme"],
  ["Highlights", "#highlights"],
  ["People", "#committee"],
  ["Abstracts", "#abstracts"],
  ["Venue", "#venue"],
] as const;

const chapters = [
  { short: "Cloud", label: "Point cloud", at: 0 },
  { short: "Disperse", label: "Disintegration", at: 0.16 },
  { short: "Galaxy", label: "Galaxy field", at: 0.34 },
  { short: "Travel", label: "Traversing the field", at: 0.5 },
  { short: "Return", label: "Exact return", at: 0.72 },
  { short: "Rebuilt", label: "Rebuilt surface", at: 0.88 },
] as const;

function Arrow() {
  return (
    <svg viewBox="0 0 20 20" className="size-4" fill="none" aria-hidden="true">
      <path d="M4 10h11M11 6l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Seal() {
  return (
    <span className="grid size-8 shrink-0 place-items-center rounded-full border border-[#b3122a] bg-white" aria-hidden="true">
      <svg viewBox="0 0 24 24" className="size-4 fill-[#b3122a]">
        <path d="M12 21.3S2.2 14 2.2 8.4A5.9 5.9 0 0 1 12 3.9a5.9 5.9 0 0 1 9.8 4.5c0 5.6-9.8 12.9-9.8 12.9Z" />
        <path d="M6.5 10.8h3l1.2-3.1 2.1 7.4 1.4-4.3h3.3" fill="none" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

function useCountdown() {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    const target = new Date(`${conference.dates.start}T09:00:00+05:30`).getTime();
    const update = () => setRemaining(Math.max(0, target - Date.now()));
    update();
    const timer = window.setInterval(update, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  if (remaining === null) return { days: "––", hours: "––", minutes: "––" };
  return {
    days: String(Math.floor(remaining / 86_400_000)).padStart(2, "0"),
    hours: String(Math.floor((remaining % 86_400_000) / 3_600_000)).padStart(2, "0"),
    minutes: String(Math.floor((remaining % 3_600_000) / 60_000)).padStart(2, "0"),
  };
}

export default function ConferenceHero({ children }: { children?: ReactNode }) {
  const reducedMotion = Boolean(useReducedMotion());
  const interaction = useRef<InteractionState>({
    progress: reducedMotion ? 1 : 0,
    impulse: 0,
    dragX: 0,
    dragY: 0,
    pointerX: 0,
    pointerY: 0,
  });
  const heroRef = useRef<HTMLElement>(null);
  const drag = useRef({ active: false, x: 0, y: 0 });
  const [menuOpen, setMenuOpen] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  const [wideLayout, setWideLayout] = useState(true);
  const [entryActive, setEntryActive] = useState(true);
  const [activeStage, setActiveStage] = useState(reducedMotion ? 4 : 0);
  const { scrollYProgress: pageProgress } = useScroll();
  // The aperture is tied to the HERO leaving the viewport, not to whole-page
  // progress, so the depth circle holds for the entire first screen.
  const { scrollYProgress: heroExit } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const countdown = useCountdown();
  const introVisible = entryActive && !reducedMotion;
  const apertureMask = useTransform(heroExit, (value) => {
    const radius =
      reducedMotion || !wideLayout ? 170 : 20 + Math.min(1, value / 0.55) ** 0.85 * 150;
    return `radial-gradient(circle at 50% 47%, transparent ${radius}vmax, #000 calc(${radius}vmax + 1.5px))`;
  });
  const displayedStage = reducedMotion ? chapters.length - 1 : activeStage;

  // ONE clock. Page scroll fraction drives the model directly — no remapping,
  // no station index, no second timeline that can drift out of step with this.
  useMotionValueEvent(pageProgress, "change", (value) => {
    const progress = reducedMotion ? 1 : value;
    interaction.current.progress = progress;
    let stage = 0;
    for (let index = 0; index < chapters.length; index += 1) {
      if (progress >= chapters[index].at) stage = index;
    }
    setActiveStage((current) => (current === stage ? current : stage));
  });

  useEffect(() => {
    if (reducedMotion) interaction.current.progress = 1;
  }, [reducedMotion]);



  // The circular aperture frames the CENTRE pane. Once the panes stack there is
  // no centre to frame, so the field is shown open instead of masked off-centre.
  useEffect(() => {
    const query = window.matchMedia("(min-width: 1024px)");
    const sync = () => setWideLayout(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setSceneReady(true), 180);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;
    const timer = window.setTimeout(() => setEntryActive(false), 3_450);
    return () => window.clearTimeout(timer);
  }, [reducedMotion]);

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      interaction.current.pointerX = (event.clientX / window.innerWidth) * 2 - 1;
      interaction.current.pointerY = -(event.clientY / window.innerHeight) * 2 + 1;
      if (!drag.current.active) return;
      interaction.current.dragX += event.clientX - drag.current.x;
      interaction.current.dragY += event.clientY - drag.current.y;
      drag.current.x = event.clientX;
      drag.current.y = event.clientY;
    };
    const onDown = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      const target = event.target as HTMLElement | null;
      if (target?.closest("a, button, input, summary, [role='button']")) return;
      drag.current = { active: true, x: event.clientX, y: event.clientY };
    };
    const onUp = () => {
      drag.current.active = false;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    window.addEventListener("pointercancel", onUp, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, []);

  useEffect(() => {
    if (!menuOpen && !introVisible) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setMenuOpen(false);
      setEntryActive(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen, introVisible]);

  return (
    <>
      <AnimatePresence>
        {introVisible ? (
          <motion.div
            className="fixed inset-0 z-[100] overflow-hidden"
            role="presentation"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.08, delay: 1.02 }}
          >
            <motion.div
              className="absolute inset-0 bg-[#fffdfc]"
              exit={{ scaleY: 0 }}
              transition={{ duration: 0.95, ease: [0.76, 0, 0.24, 1] }}
              style={{ transformOrigin: "50% 50%" }}
            />
            <motion.div
              className="absolute inset-x-0 top-0 h-1/2 origin-left bg-[#b3122a]"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              exit={{ y: "-102%" }}
              transition={{ scaleX: { duration: 0.72, ease: [0.76, 0, 0.24, 1] }, y: { duration: 1.05, ease: [0.76, 0, 0.24, 1] } }}
            />
            <motion.div
              className="absolute inset-x-0 bottom-0 h-1/2 origin-right bg-[#b3122a]"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              exit={{ y: "102%" }}
              transition={{ scaleX: { duration: 0.72, ease: [0.76, 0, 0.24, 1] }, y: { duration: 1.05, ease: [0.76, 0, 0.24, 1] } }}
            />

            <motion.div
              className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-between px-[var(--gutter)] py-[clamp(1.5rem,4vw,3.5rem)] text-white"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 1.06 }}
              transition={{ delay: 0.58, duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-start justify-between gap-6 font-mono text-[8px] uppercase leading-5 tracking-[.2em] text-white/70 sm:text-[10px]">
                <span>IACTS Technocollege CME 2026</span>
                <span className="text-right">23—25 October<br />Hyderabad, India</span>
              </div>

              <div className="mx-auto w-full max-w-[1720px]">
                {["The future", "Is now."].map((line, index) => (
                  <div key={line} className={`overflow-hidden py-[.06em] ${index ? "text-right" : ""}`}>
                    <motion.p
                      className="m-0 text-[clamp(2.9rem,11vw,10.5rem)] font-black uppercase leading-[1.02] tracking-[-.075em]"
                      initial={{ y: "108%" }}
                      animate={{ y: 0 }}
                      transition={{ delay: 0.72 + index * 0.16, duration: 0.86, ease: [0.16, 1, 0.3, 1] }}
                    >
                      {line}
                    </motion.p>
                  </div>
                ))}
                <motion.div
                  className="mt-[clamp(1rem,2.4vw,2rem)] h-px w-full origin-left bg-white/70"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 1.12, duration: 0.9, ease: [0.65, 0, 0.35, 1] }}
                />
              </div>

              <div className="flex items-end justify-between gap-6 font-mono text-[8px] uppercase leading-5 tracking-[.2em] text-white/65 sm:text-[10px]">
                <span>Opening the living operative field</span>
                <span className="text-right">Science · Skill · Innovation</span>
              </div>
            </motion.div>

            <motion.div
              className="absolute inset-x-0 top-1/2 z-30 h-px bg-white"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.48, duration: 1.55, ease: [0.65, 0, 0.35, 1] }}
            />

            <button
              type="button"
              onClick={() => setEntryActive(false)}
              className="absolute bottom-5 right-[var(--gutter)] z-40 min-h-11 rounded-full border border-white/35 px-5 font-mono text-[8px] uppercase tracking-[.18em] text-white transition-colors hover:bg-white hover:text-[#b3122a]"
            >
              Enter now
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_44%,rgba(227,38,70,.08),transparent_34%)]" />
        {sceneReady ? (
          <AnatomyScene interaction={interaction} reducedMotion={reducedMotion} surfaceBookends />
        ) : (
          <div className="absolute right-[13vw] top-1/2 h-[42vh] w-[24vw] -translate-y-1/2 rounded-[50%] bg-[#f8e9ed] blur-3xl" />
        )}
      </div>

      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[2] bg-[#fffdfc]"
        style={{ maskImage: apertureMask, WebkitMaskImage: apertureMask }}
      />

      <motion.div
        aria-hidden="true"
        className="fixed inset-x-0 top-0 z-[70] h-[3px] origin-left bg-[#e32646]"
        style={{ scaleX: reducedMotion ? 1 : pageProgress }}
      />

      <header className="fixed inset-x-0 top-0 z-50 border-b border-[#b3122a]/15 bg-[#fffdfc] shadow-[0_1px_12px_rgba(95,7,23,.06)]">
        <div className="mx-auto flex h-[58px] max-w-[1720px] items-center justify-between gap-5 px-[var(--gutter)]">
          <a href="#hero" className="flex items-center gap-3 no-underline" aria-label="IACTS Technocollege CME home">
            <Seal />
            <span className="text-[10px] font-semibold uppercase leading-[1.25] tracking-[.08em] text-[#160a0d] sm:text-[11px]">
              Indian Association of
              <span className="block font-normal text-[#735b62]">Cardiovascular-Thoracic Surgeons</span>
            </span>
          </a>

          <nav aria-label="Primary navigation" className="hidden items-center gap-[clamp(1rem,2vw,2rem)] xl:flex">
            {navigation.map(([label, href]) => (
              <a key={href} href={href} className="font-mono text-[9px] font-medium uppercase tracking-[.16em] text-[#614d53] no-underline transition-colors hover:text-[#b3122a]">
                {label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <a href="#register" className="hidden min-h-9 items-center gap-2 rounded-full bg-[#b3122a] px-5 font-mono text-[9px] font-medium uppercase tracking-[.16em] text-white no-underline transition-transform hover:-translate-y-0.5 sm:inline-flex">
              Registration · Soon <Arrow />
            </a>
            <button
              type="button"
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMenuOpen((open) => !open)}
              className="grid size-9 place-items-center rounded-full border border-[#b3122a]/20 bg-white xl:hidden"
            >
              <span className="relative block h-3 w-5" aria-hidden="true">
                <span className={`absolute left-0 top-0.5 h-px w-full bg-[#b3122a] transition-transform ${menuOpen ? "translate-y-[5px] rotate-45" : ""}`} />
                <span className={`absolute bottom-0.5 left-0 h-px w-full bg-[#b3122a] transition-transform ${menuOpen ? "-translate-y-[5px] -rotate-45" : ""}`} />
              </span>
            </button>
          </div>
        </div>
      </header>

      {menuOpen ? (
        <div id="mobile-navigation" className="fixed inset-0 z-40 grid bg-[#b3122a] px-[var(--gutter)] pb-10 pt-20 text-white xl:hidden">
          <nav aria-label="Mobile navigation" className="self-center">
            {navigation.map(([label, href], index) => (
              <a key={href} href={href} onClick={() => setMenuOpen(false)} className="flex items-baseline gap-4 border-b border-white/25 py-3 text-[clamp(2rem,10vw,4.5rem)] font-black uppercase leading-none tracking-[-.055em] text-white no-underline">
                <span className="font-mono text-[9px] font-normal tracking-[.16em] text-white/60">0{index + 1}</span>
                {label}
              </a>
            ))}
          </nav>
          <div className="self-end border-t border-white/25 pt-5 font-mono text-[10px] uppercase leading-6 tracking-[.15em] text-white/70">
            {conference.dates.label}<br />{conference.city}<br />{secretariat.email}
          </div>
        </div>
      ) : null}

      <aside className="pointer-events-none fixed bottom-6 left-6 z-40 hidden items-end gap-3 2xl:flex" aria-label={`Model state: ${chapters[displayedStage].label}`}>
        <span className="font-mono text-[8px] uppercase tracking-[.18em] text-[#7d656c] [writing-mode:vertical-rl] rotate-180">Living operative field</span>
        <ol className="flex list-none flex-col gap-1 p-0">
          {chapters.map((stage, index) => (
            <li key={stage.label} className="flex items-center gap-2">
              <span className={`h-px transition-all ${displayedStage === index ? "w-7 bg-[#b3122a]" : "w-3 bg-[#b3122a]/25"}`} />
              <span className={`font-mono text-[8px] uppercase tracking-[.14em] ${displayedStage === index ? "text-[#b3122a]" : "text-[#947e84]"}`}>{stage.short}</span>
            </li>
          ))}
        </ol>
      </aside>

      <section ref={heroRef} id="hero" className="relative z-10 flex min-h-svh scroll-mt-16 flex-col overflow-hidden px-[var(--gutter)] pb-7 pt-16 sm:pt-20">
        <div className="mx-auto grid w-full max-w-[1720px] flex-1 items-center gap-[clamp(1.25rem,2vw,2.5rem)] xl:grid-cols-[minmax(0,1fr)_minmax(0,1.02fr)_minmax(0,.92fr)]">
          <div className="relative z-10 order-2 grid gap-2.5 xl:order-none">
            <div className="border border-[#b3122a]/15 bg-white/[0.93] p-[clamp(1rem,1.5vw,1.6rem)] backdrop-blur-sm">
              <p className="flex items-center gap-3 font-mono text-[9px] uppercase tracking-[.2em] text-[#7d656c]">
                <span className="h-px w-8 bg-[#b3122a]" /> Technocollege CME · Hyderabad
              </p>
              <h1 className="mt-4 font-black uppercase leading-[.8] tracking-[-.08em] text-[#b3122a]">
                <span className="block text-[clamp(3.2rem,8vw,7.2rem)]">IACTS</span>
                <span className="mt-1 block text-[clamp(1rem,2.1vw,1.95rem)] tracking-[-.05em] text-[#160a0d]">
                  Technocollege CME <span className="text-[#b3122a]">2026</span>
                </span>
              </h1>
              <p className="mt-4 font-display text-[clamp(1.35rem,2.4vw,2.5rem)] italic leading-[1.04] tracking-[-.03em] text-[#160a0d]">
                The future is <span className="text-[#b3122a]">now.</span>
              </p>
            </div>

            <div className="border-l-2 border-[#b3122a] bg-white/[0.93] p-[clamp(1rem,1.4vw,1.4rem)] backdrop-blur-sm">
              <p className="max-w-[48ch] text-[clamp(.82rem,.95vw,.98rem)] leading-[1.7] text-[#614d53]">
                A three-day Technocollege CME convened by the Department of CTVS, NIMS Hyderabad — hands-on surgical
                training, next-generation technology and scientific exchange for cardiovascular and thoracic surgeons.
              </p>
              <ul className="mt-4 flex list-none flex-wrap gap-x-5 gap-y-1 p-0">
                {conference.pillars.map((pillar) => (
                  <li key={pillar} className="font-mono text-[9px] uppercase tracking-[.18em] text-[#b3122a]">
                    {pillar}
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid gap-2.5 sm:grid-cols-2">
              <a href="#programme" className="flex min-h-12 items-center justify-between gap-3 bg-[#b3122a] px-5 font-mono text-[9px] font-medium uppercase tracking-[.15em] text-white no-underline transition-transform hover:-translate-y-0.5">
                Scientific programme <Arrow />
              </a>
              <a href="#register" className="flex min-h-12 items-center justify-between gap-3 border border-[#b3122a]/30 bg-white/[0.93] px-5 font-mono text-[9px] font-medium uppercase tracking-[.15em] text-[#b3122a] no-underline backdrop-blur-sm transition-colors hover:bg-[#f8e9ed]">
                Delegate registration <Arrow />
              </a>
            </div>
          </div>

          <div className="relative z-10 order-first flex items-center justify-center py-[clamp(.5rem,3vh,3rem)] xl:order-none">
            <div className="relative grid aspect-square w-full max-w-[min(68vw,34vh)] place-items-center xl:w-[min(34vw,62vh)] xl:max-w-none">
              <span aria-hidden="true" className="absolute inset-0 hidden rounded-full border border-[#b3122a]/25 xl:block" />
              <span aria-hidden="true" className="absolute inset-[7%] hidden rounded-full border border-dashed border-[#b3122a]/15 xl:block" />
              <span aria-hidden="true" className="absolute left-1/2 top-0 h-3 w-px -translate-x-1/2 hidden bg-[#b3122a]/40 xl:block" />
              <span aria-hidden="true" className="absolute bottom-0 left-1/2 h-3 w-px -translate-x-1/2 hidden bg-[#b3122a]/40 xl:block" />
              <span aria-hidden="true" className="absolute left-0 top-1/2 h-px w-3 -translate-y-1/2 hidden bg-[#b3122a]/40 xl:block" />
              <span aria-hidden="true" className="absolute right-0 top-1/2 h-px w-3 -translate-y-1/2 hidden bg-[#b3122a]/40 xl:block" />
              <p className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[8px] uppercase tracking-[.2em] text-[#7d656c]">
                Cardiothoracic point cloud · 70,000 samples
              </p>
            </div>
          </div>

          <div className="relative z-10 order-3 grid gap-2.5 xl:order-none">
            <div className="border-l-2 border-[#b3122a] bg-white/[0.9] p-[clamp(1rem,1.4vw,1.4rem)] backdrop-blur-sm">
              <p className="font-mono text-[8px] uppercase tracking-[.18em] text-[#b3122a]">Conference dates</p>
              <p className="mt-2 text-[clamp(1.5rem,2.4vw,2.5rem)] font-black uppercase leading-[.92] tracking-[-.045em] text-[#160a0d]">
                23—25<br /><span className="text-[#b3122a]">October 2026</span>
              </p>
              <p className="mt-2 font-mono text-[9px] uppercase leading-5 tracking-[.14em] text-[#614d53]">Hyderabad, India</p>
            </div>

            <div className="grid grid-cols-3 border border-[#b3122a]/15 bg-white/[0.9] backdrop-blur-sm">
              {(["days", "hours", "minutes"] as const).map((unit) => (
                <div key={unit} className="border-r border-[#b3122a]/15 px-2 py-3 text-center last:border-r-0">
                  <span className="block text-xl font-black tabular-nums text-[#b3122a]">{countdown[unit]}</span>
                  <span className="mt-1 block font-mono text-[7px] uppercase tracking-[.14em] text-[#7d656c]">{unit}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {STATS.map((stat) => (
                <div key={stat.label} className="border border-[#b3122a]/15 bg-white/[0.9] px-3 py-3 backdrop-blur-sm">
                  <span className="block text-xl font-black text-[#b3122a]">{stat.value}</span>
                  <span className="mt-0.5 block font-mono text-[7px] uppercase tracking-[.15em] text-[#614d53]">{stat.label}</span>
                </div>
              ))}
            </div>

            <div className="border border-[#b3122a]/15 bg-white/[0.9] px-3 py-3 backdrop-blur-sm">
              <p className="font-mono text-[8px] uppercase tracking-[.16em] text-[#7d656c]">
                Registration status<br /><span className="text-[#b3122a]">Opening soon · fees to be announced</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="relative z-10 overflow-hidden bg-[#b3122a] py-3 text-white" aria-label={conference.values.join(" ")}>
        <div className="conference-marquee flex min-w-max items-center gap-8 whitespace-nowrap font-mono text-[9px] uppercase tracking-[.22em]">
          {[...conference.values, ...conference.values, ...conference.values].map((value, index) => (
            <span key={`${value}-${index}`} className="flex items-center gap-8"><span>{value}</span><span className="size-1 rotate-45 bg-white/55" /></span>
          ))}
        </div>
      </div>

      {children}

      <div className="sr-only">
        {days.map((day) => <span key={day.id}>{day.date}: {day.venue}</span>)}
      </div>
    </>
  );
}
