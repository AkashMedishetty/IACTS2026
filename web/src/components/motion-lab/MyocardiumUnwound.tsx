"use client";

import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { useRef } from "react";
import MotionMast from "@/components/motion-lab/MotionMast";

const FIBRE = "M-100 680 C180 770 190 190 474 286 C708 366 566 704 824 614 C1060 532 948 152 1228 206 C1412 242 1456 430 1540 566";

export default function MyocardiumUnwound() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const mx = useMotionValue(0);
  const xTilt = useSpring(useTransform(mx, [-.5, .5], [-20, 20]), { stiffness: 80, damping: 24 });
  const draw = useTransform(scrollYProgress, [0, .72], [0, 1]);
  const drift = useTransform(scrollYProgress, [0, 1], [-90, 40]);
  const wordX = useTransform(scrollYProgress, [0, .6], [0, 0]);
  const wordOpacity = useTransform(scrollYProgress, [0, .48], [1, .12]);
  const mapOpacity = useTransform(scrollYProgress, [.42, .7], [0, 1]);
  const mapY = useTransform(scrollYProgress, [.42, .8], [30, 0]);
  const counterRotate = useTransform(scrollYProgress, [0, 1], [-3, 2]);

  return (
    <section ref={ref} id="myocardium-unwound" className="relative h-[200svh] bg-[#f6f4f1]">
      <div
        className="sticky top-0 h-svh min-h-[700px] overflow-hidden"
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          mx.set((e.clientX - r.left) / r.width - .5);
        }}
      >
        <MotionMast index="02 / Myocardium unwound" />
        <div className="absolute inset-0 pt-[72px]" style={{ backgroundImage: "linear-gradient(rgba(12,12,14,.045) 1px,transparent 1px),linear-gradient(90deg,rgba(12,12,14,.045) 1px,transparent 1px)", backgroundSize: "5vw 5vw" }}>
          <motion.div
            className="absolute inset-0"
            style={{ x: reduced ? 0 : xTilt, rotate: reduced ? 0 : counterRotate }}
          >
            <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" className="h-full w-full overflow-visible" aria-label="Myocardial fibres unwinding into a scientific timeline">
              <defs>
                <linearGradient id="motion-fibre" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0" stopColor="#7a0e14" />
                  <stop offset=".52" stopColor="#d33b45" />
                  <stop offset="1" stopColor="#2f6d9e" />
                </linearGradient>
              </defs>
              {[-36, -24, -12, 0, 12, 24, 36].map((dy, i) => (
                <motion.path
                  key={dy}
                  d={FIBRE}
                  fill="none"
                  stroke="url(#motion-fibre)"
                  strokeWidth={i === 3 ? 5 : 1.8}
                  strokeLinecap="round"
                  opacity={i === 3 ? .92 : .38}
                  transform={`translate(0 ${dy})`}
                  style={{ pathLength: reduced ? 1 : draw, x: reduced ? 0 : drift }}
                />
              ))}
            </svg>
          </motion.div>

          <motion.div className="absolute left-[clamp(1rem,4vw,4rem)] top-[18%] z-20" style={{ x: reduced ? 0 : wordX, opacity: reduced ? .12 : wordOpacity }}>
            <p className="font-mono text-[.58rem] uppercase tracking-[.23em] text-crimson">Torrent–Guasp / One continuous myocardial band</p>
            <h2 className="mt-4 text-[clamp(4.2rem,11vw,13rem)] font-black uppercase leading-[.73] tracking-[-.09em]">
              Unwind<br /><span className="text-transparent [-webkit-text-stroke:1.5px_#8d0e16]">the heart.</span>
            </h2>
          </motion.div>

          <motion.div className="absolute inset-x-[clamp(1rem,4vw,4rem)] bottom-[7%] z-30" style={{ opacity: reduced ? 1 : mapOpacity, y: reduced ? 0 : mapY }}>
            <div className="grid gap-px bg-black/15 md:grid-cols-[1.15fr_1fr_1fr]">
              {[
                ["01", "Skills", "Five equipment-led stations"],
                ["02", "Science", "Seven programme formats"],
                ["03", "Future", "One field moving forward"],
              ].map(([no, title, note]) => (
                <article key={no} className="bg-[#f6f4f1]/90 p-[clamp(1rem,2.4vw,2.3rem)] backdrop-blur-md">
                  <span className="font-mono text-[.55rem] tracking-[.18em] text-crimson">{no}</span>
                  <h3 className="mt-5 text-[clamp(1.7rem,3vw,3.5rem)] font-black uppercase leading-none tracking-[-.055em]">{title}</h3>
                  <p className="mt-2 text-[.78rem] text-muted-foreground">{note}</p>
                </article>
              ))}
            </div>
            <p className="ml-auto mt-4 max-w-[26ch] text-right font-mono text-[.5rem] uppercase leading-[1.65] tracking-[.13em] text-faint">Scroll biases the unwinding · pointer shifts the fibre plane</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
