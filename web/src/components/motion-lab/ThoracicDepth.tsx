"use client";

import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";
import { useRef } from "react";
import CloudField from "@/components/field/CloudField";
import MotionMast from "@/components/motion-lab/MotionMast";

const RIBS = [126, 184, 244, 306, 370, 436, 504];

function RibHalf({ side, x }: { side: "left" | "right"; x: MotionValue<string> | number }) {
  return (
    <motion.svg
      viewBox="0 0 500 650"
      preserveAspectRatio="none"
      className={`absolute top-[14%] h-[72%] w-[48%] ${side === "left" ? "left-0" : "right-0 -scale-x-100"}`}
      style={{ x }}
      aria-hidden
    >
      <g fill="none" stroke="#7a0e14" strokeOpacity=".24" strokeWidth="2">
        {RIBS.map((y, i) => (
          <path key={y} d={`M500 ${y - 34} C${390 - i * 8} ${y - 76},${205 - i * 8} ${y - 48},${56 + i * 5} ${y + 16}`} />
        ))}
        <path d="M492 55 C426 202 424 438 484 610" strokeOpacity=".34" strokeWidth="4" />
      </g>
    </motion.svg>
  );
}

export default function ThoracicDepth() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const px = useSpring(useTransform(mx, [-.5, .5], [-18, 18]), { stiffness: 90, damping: 22 });
  const py = useSpring(useTransform(my, [-.5, .5], [-12, 12]), { stiffness: 90, damping: 22 });
  const ribLeft = useTransform(scrollYProgress, [0, .72], ["0vw", "-13vw"]);
  const ribRight = useTransform(scrollYProgress, [0, .72], ["0vw", "13vw"]);
  const heartScale = useTransform(scrollYProgress, [0, .72], [.72, 1.16]);
  const heartY = useTransform(scrollYProgress, [0, .72], [70, -8]);
  const aperture = useTransform(scrollYProgress, [0, .68], [
    "inset(45% 46% 45% 46% round 50%)",
    "inset(3% 3% 3% 3% round 46%)",
  ]);
  const firstOut = useTransform(scrollYProgress, [0, .32], [1, 0]);
  const finalIn = useTransform(scrollYProgress, [.5, .82], [0, 1]);
  const scanY = useTransform(scrollYProgress, [0, 1], ["12%", "88%"]);

  return (
    <section ref={ref} id="thoracic-depth" className="relative h-[190svh] bg-[#fbfbfc]">
      <div
        className="sticky top-0 h-svh min-h-[700px] overflow-hidden"
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          mx.set((e.clientX - r.left) / r.width - .5);
          my.set((e.clientY - r.top) / r.height - .5);
        }}
      >
        <MotionMast index="01 / Thoracic depth" />
        <div className="absolute inset-0 pt-[72px]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_49%,rgba(179,18,28,.13),transparent_30%)]" />
          <motion.div className="absolute inset-x-0 top-0 z-20 h-px bg-crimson/55 shadow-[0_0_22px_rgba(179,18,28,.55)]" style={{ top: scanY }} />

          <RibHalf side="left" x={reduced ? 0 : ribLeft} />
          <RibHalf side="right" x={reduced ? 0 : ribRight} />

          <motion.div
            className="absolute inset-[10%] z-10 overflow-hidden"
            style={{
              clipPath: reduced ? "inset(3% 3% 3% 3% round 46%)" : aperture,
              x: reduced ? 0 : px,
              y: reduced ? 0 : heartY,
              scale: reduced ? 1 : heartScale,
            }}
          >
            <CloudField className="absolute inset-0" />
          </motion.div>

          <motion.div className="absolute left-[clamp(1rem,5vw,5rem)] top-[18%] z-30" style={{ opacity: reduced ? 0 : firstOut }}>
            <p className="font-mono text-[.58rem] uppercase tracking-[.24em] text-crimson">Scroll to enter the field</p>
            <h2 className="mt-4 max-w-[7ch] text-[clamp(4rem,10vw,11rem)] font-black uppercase leading-[.78] tracking-[-.08em]">
              Open the thorax<span className="text-crimson">.</span>
            </h2>
          </motion.div>

          <motion.div className="absolute inset-x-[clamp(1rem,4vw,4rem)] bottom-[6%] z-30 grid gap-5 md:grid-cols-[1fr_auto] md:items-end" style={{ opacity: reduced ? 1 : finalIn }}>
            <div>
              <p className="font-mono text-[.58rem] uppercase tracking-[.22em] text-crimson">IACTS Technocollege CME · Hyderabad</p>
              <h1 className="mt-3 max-w-[9ch] text-[clamp(3.2rem,8vw,9rem)] font-black uppercase leading-[.8] tracking-[-.075em]">
                The future is <span className="font-display font-normal italic normal-case text-crimson">inside.</span>
              </h1>
            </div>
            <p className="max-w-[30ch] text-[clamp(.78rem,1vw,1rem)] leading-[1.6] text-muted-foreground md:text-right">
              Drape. Thorax. Myocardium. Technology.<br />One scroll, four layers of surgical depth.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
