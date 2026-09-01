"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

const links = ["Concept", "Programme", "Faculty", "Venue"];

export default function MotionMast({ index }: { index: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="absolute inset-x-0 top-0 z-50 flex h-[72px] items-center justify-between border-b border-black/10 px-[clamp(1rem,3vw,3rem)]">
        <a href="#motion-top" className="flex items-center gap-3 text-bone no-underline">
          <span className="grid size-10 place-items-center rounded-full border border-crimson/35 font-mono text-[.58rem] font-bold tracking-[.1em] text-crimson">IA</span>
          <span className="text-[.72rem] font-semibold leading-[1.2]">
            Indian Association of
            <small className="block font-normal text-muted">Cardiovascular–Thoracic Surgeons</small>
          </span>
        </a>

        <p className="absolute left-1/2 hidden -translate-x-1/2 font-mono text-[.58rem] uppercase tracking-[.22em] text-faint 2xl:block">
          IACTS / Motion study / {index}
        </p>

        <nav className="hidden items-center gap-[clamp(1rem,2vw,2.25rem)] md:flex" aria-label="Primary">
          {links.map((label) => (
            <a key={label} href="#" className="font-mono text-[.56rem] uppercase tracking-[.18em] text-muted no-underline hover:text-crimson">
              {label}
            </a>
          ))}
          <span className="rounded-full bg-crimson px-5 py-3 font-mono text-[.55rem] uppercase tracking-[.16em] text-white">
            23—25 Oct
          </span>
        </nav>

        <button
          type="button"
          className="grid size-11 place-items-center rounded-full border border-black/15 bg-white md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label="Toggle navigation"
        >
          <span className="font-mono text-[.62rem] uppercase tracking-[.12em]">{open ? "Close" : "Menu"}</span>
        </button>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: .55, ease: [.16, 1, .3, 1] }}
            className="absolute inset-0 z-40 flex flex-col justify-center bg-[#fbfbfc] px-6 pt-[72px] md:hidden"
          >
            {links.map((label, i) => (
              <motion.a
                key={label}
                href="#"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: .12 + i * .06 }}
                className="border-b border-black/10 py-5 text-[clamp(2rem,11vw,3.5rem)] font-black uppercase leading-none tracking-[-.06em] text-bone no-underline"
              >
                {label}
              </motion.a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
