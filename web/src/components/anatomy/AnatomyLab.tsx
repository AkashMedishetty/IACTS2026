"use client";

import dynamic from "next/dynamic";
import { motion, useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";
import { useRef, useState, type PointerEvent } from "react";
import type { InteractionState } from "./AnatomyParticles";

const AnatomyScene = dynamic(() => import("./AnatomyScene"), { ssr: false });

const stages = [
  ["01", "Anatomical form", "Seventy thousand coordinates hold the exact sampled cardiothoracic surface."],
  ["02", "Angular disassembly", "Twelve directional sectors separate coherently—never a random spherical explosion."],
  ["03", "Free canvas placement", "The persistent field relocates independently while the document continues beneath it."],
  ["04", "Interaction field", "Pointer proximity bends the field. Drag changes orientation. Press anywhere for an impulse."],
  ["05", "Exact reformation", "Every particle returns to its source coordinate, then resolves into a lit, source-colored solid surface."],
] as const;

export default function AnatomyLab() {
  const root = useRef<HTMLElement>(null);
  const reducedMotion = Boolean(useReducedMotion());
  const interaction = useRef<InteractionState>({ progress: reducedMotion ? 1 : 0, impulse: 0, dragX: 0, dragY: 0 });
  const pointer = useRef({ x: 0, y: 0, dragging: false });
  const [active, setActive] = useState(reducedMotion ? 4 : 0);
  const { scrollYProgress } = useScroll({ target: root, offset: ["start start", "end end"] });

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    if (reducedMotion) return;
    interaction.current.progress = value;
    const next = Math.min(4, Math.floor(value * 5));
    setActive((current) => current === next ? current : next);
  });

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    pointer.current = { x: event.clientX, y: event.clientY, dragging: true };
    interaction.current.impulse += 1;
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!pointer.current.dragging) return;
    interaction.current.dragX += event.clientX - pointer.current.x;
    interaction.current.dragY += event.clientY - pointer.current.y;
    pointer.current.x = event.clientX;
    pointer.current.y = event.clientY;
  };
  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    pointer.current.dragging = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };

  return (
    <main ref={root} id="main" className="relative isolate bg-[#07080a] text-[#f2f3f5]">
      <div
        className="fixed inset-0 z-0 cursor-grab active:cursor-grabbing"
        style={{ touchAction: "pan-y" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <AnatomyScene interaction={interaction} reducedMotion={reducedMotion} />
      </div>

      <header className="pointer-events-none fixed inset-x-0 top-0 z-30 flex h-16 items-center justify-between border-b border-white/10 px-[clamp(1rem,3vw,3rem)] backdrop-blur-sm">
        <p className="font-mono text-[.58rem] uppercase tracking-[.2em] text-white/65">IACTS / Anatomy interaction R&amp;D</p>
        <button
          type="button"
          onClick={() => { interaction.current.impulse += 1; }}
          className="pointer-events-auto min-h-11 rounded-full border border-white/20 bg-black/25 px-5 font-mono text-[.55rem] uppercase tracking-[.18em] text-white transition-colors hover:bg-white hover:text-black"
        >
          Apply impulse
        </button>
      </header>

      <nav aria-label="Interaction stages" className="pointer-events-auto fixed right-3 top-1/2 z-30 flex -translate-y-1/2 flex-col gap-2 md:right-8">
        {stages.map(([number, title], index) => (
          <a key={number} href={`#anatomy-stage-${index + 1}`} aria-label={`Jump to ${title}`} className={`grid size-9 place-items-center rounded-full border font-mono text-[.52rem] no-underline transition-colors ${active === index ? "border-white bg-white text-black" : "border-white/15 bg-black/20 text-white/45 hover:text-white"}`}>
            {number}
          </a>
        ))}
      </nav>

      <motion.div aria-hidden className="fixed left-0 top-0 z-40 h-1 w-full origin-left bg-white" style={{ scaleX: reducedMotion ? 1 : scrollYProgress }} />

      <div className="relative z-10 pointer-events-none">
        {stages.map(([number, title, note], index) => (
          <section key={number} id={`anatomy-stage-${index + 1}`} className="flex min-h-[110svh] items-center px-[clamp(1rem,6vw,7rem)] py-24">
            <div
              className={`relative w-full max-w-[min(92vw,960px)] py-10 pr-14 md:pr-0 ${index % 2 === 0 ? "md:pr-[18vw]" : "md:ml-auto md:pl-[18vw] md:text-right"}`}
              style={{ background: "radial-gradient(ellipse at center,rgba(7,8,10,.96) 0%,rgba(7,8,10,.76) 58%,rgba(7,8,10,0) 82%)" }}
            >
              <div className="relative z-10">
                <p className="font-mono text-[.58rem] uppercase tracking-[.22em] text-white/45">{number} / Mechanics only</p>
                <h1 className="mt-4 max-w-[12ch] text-[clamp(2.15rem,7vw,7.5rem)] font-black uppercase leading-[.82] tracking-[-.07em] [overflow-wrap:anywhere] [text-wrap:balance] md:[overflow-wrap:normal]" style={{ marginLeft: index % 2 ? "auto" : undefined }}>{title}</h1>
                <p
                  className="mt-6 max-w-[34ch] text-[clamp(.78rem,1.1vw,1rem)] leading-[1.65] text-white/72"
                  style={{ marginLeft: index % 2 ? "auto" : undefined, textShadow: "0 2px 14px #07080a,0 0 8px #07080a" }}
                >
                  {note}
                </p>
              </div>
            </div>
          </section>
        ))}
      </div>

      <p className="pointer-events-none fixed bottom-5 left-[clamp(1rem,3vw,3rem)] z-30 font-mono text-[.52rem] uppercase tracking-[.18em] text-white/40">Scroll · drag · press / No website art direction applied</p>
    </main>
  );
}