"use client";

import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { useRef } from "react";
import MotionMast from "@/components/motion-lab/MotionMast";

const PULSE = "M0 440 L250 440 C300 440 316 420 340 440 L370 440 L394 482 L424 320 L452 492 L482 440 L690 440 C740 440 752 416 780 440 L814 440 L842 480 L874 292 L906 496 L936 440 L1180 440 C1228 440 1244 418 1270 440 L1310 440 L1340 478 L1370 330 L1402 486 L1430 440 L1540 440";

export default function CardiacCycle() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const px = useSpring(useTransform(mx, [-.5, .5], [-14, 14]), { stiffness: 90, damping: 24 });
  const py = useSpring(useTransform(my, [-.5, .5], [-10, 10]), { stiffness: 90, damping: 24 });
  const beat = useTransform(scrollYProgress, [0, .16, .32, .5, .7, .84, 1], [1, .8, 1.12, .91, 1.08, .96, 1]);
  const rotate = useTransform(scrollYProgress, [0, 1], [-12, 18]);
  const draw = useTransform(scrollYProgress, [0, .82], [0, 1]);
  const introOpacity = useTransform(scrollYProgress, [0, .28], [1, 0]);
  const finalOpacity = useTransform(scrollYProgress, [.58, .88], [0, 1]);
  const fillO = useTransform(scrollYProgress, [0, .13, .27], [1, 1, 0]);
  const contractO = useTransform(scrollYProgress, [.18, .3, .45], [0, 1, 0]);
  const ejectO = useTransform(scrollYProgress, [.4, .55, .7], [0, 1, 0]);
  const releaseO = useTransform(scrollYProgress, [.66, .8, .95], [0, 1, 0]);

  return (
    <section ref={ref} id="one-cycle" className="relative h-[200svh] bg-[#fbfbfc]">
      <div
        className="sticky top-0 h-svh min-h-[700px] overflow-hidden"
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          mx.set((e.clientX - r.left) / r.width - .5);
          my.set((e.clientY - r.top) / r.height - .5);
        }}
      >
        <MotionMast index="03 / One cardiac cycle" />
        <div className="absolute inset-0 pt-[72px] bg-[radial-gradient(circle_at_50%_50%,rgba(179,18,28,.12),transparent_38%)]">
          <motion.div
            className="absolute left-1/2 top-1/2 aspect-square w-[min(78vw,760px)] -translate-x-1/2 -translate-y-1/2"
            style={{ scale: reduced ? 1 : beat, rotate: reduced ? 0 : rotate, x: reduced ? 0 : px, y: reduced ? 0 : py }}
          >
            {[0, 1, 2, 3, 4].map((ring) => (
              <div
                key={ring}
                className="absolute rounded-[46%_54%_50%_50%/56%_48%_52%_44%] border border-crimson/25"
                style={{ inset: `${ring * 8}%`, transform: `rotate(${ring * 11}deg)`, opacity: 1 - ring * .13 }}
              />
            ))}
            <div className="absolute inset-[33%] rotate-[-9deg] rounded-[54%_46%_58%_42%/62%_44%_56%_38%] bg-crimson shadow-[0_0_100px_rgba(179,18,28,.25)]" />
          </motion.div>

          <svg viewBox="0 0 1440 900" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
            <motion.path d={PULSE} fill="none" stroke="#b3121c" strokeWidth="2.4" style={{ pathLength: reduced ? 1 : draw }} />
          </svg>

          <motion.div className="absolute left-[clamp(1rem,4vw,4rem)] top-[18%] z-20" style={{ opacity: reduced ? 0 : introOpacity }}>
            <p className="font-mono text-[.58rem] uppercase tracking-[.23em] text-crimson">One beat · One complete system</p>
            <h2 className="mt-4 max-w-[7ch] text-[clamp(4rem,10vw,11rem)] font-black uppercase leading-[.76] tracking-[-.085em]">
              Follow the cycle<span className="text-crimson">.</span>
            </h2>
          </motion.div>

          <div className="absolute right-[clamp(1rem,4vw,4rem)] top-[18%] z-30 flex flex-col items-end gap-2 text-right font-mono text-[clamp(.52rem,.7vw,.68rem)] uppercase tracking-[.19em]">
            {[
              ["01 / Fill", fillO],
              ["02 / Contract", contractO],
              ["03 / Eject", ejectO],
              ["04 / Release", releaseO],
            ].map(([label, opacity]) => (
              <motion.p key={label as string} className="m-0 text-crimson" style={{ opacity: reduced ? .35 : opacity }}>
                {label as string}
              </motion.p>
            ))}
          </div>

          <motion.div className="absolute inset-x-[clamp(1rem,4vw,4rem)] bottom-[7%] z-30" style={{ opacity: reduced ? 1 : finalOpacity }}>
            <p className="font-mono text-[.58rem] uppercase tracking-[.23em] text-crimson">IACTS Technocollege CME · 23—25 October 2026</p>
            <div className="mt-3 grid gap-5 md:grid-cols-[1fr_auto] md:items-end">
              <h1 className="m-0 max-w-[8ch] text-[clamp(3.2rem,8.5vw,9.5rem)] font-black uppercase leading-[.78] tracking-[-.08em]">
                One cycle.<br /><span className="font-display font-normal italic normal-case text-crimson">The future now.</span>
              </h1>
              <p className="max-w-[28ch] text-[.82rem] leading-[1.6] text-muted md:text-right">Skills on day one. Science on days two and three. One field moving as a system.</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
