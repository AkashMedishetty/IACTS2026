"use client";

import { useState } from "react";
import BandDiagram, { type RibbonMode } from "@/components/lab/BandDiagram";
import LabHeader from "@/components/lab/LabHeader";
import { EVENT_INFO } from "@/lib/constants";

const MODES: { id: RibbonMode; label: string; note: string }[] = [
  { id: "basal", label: "Basal loop", note: "Transverse fibres" },
  { id: "apical", label: "Apical vortex", note: "Oblique descent" },
  { id: "twist", label: "Systolic twist", note: "Counter-rotation" },
];

export default function HeroBandMock() {
  const [mode, setMode] = useState<RibbonMode>("twist");
  const active = MODES.find((m) => m.id === mode)!;

  return (
    <section
      id="lab-band"
      className="relative min-h-[780px] overflow-hidden bg-ink text-bone lg:h-svh lg:max-h-[1080px]"
      style={{
        backgroundImage:
          "linear-gradient(rgba(12,12,14,.045) 1px,transparent 1px),linear-gradient(90deg,rgba(12,12,14,.045) 1px,transparent 1px)",
        backgroundSize: "clamp(3rem,6vw,7rem) clamp(3rem,6vw,7rem)",
      }}
    >
      <LabHeader index="02 / Helical band" />

      <div className="pointer-events-none absolute inset-x-[-14%] top-[18%] z-[2] h-[64%] -rotate-[11deg] lg:inset-x-[11%] lg:top-[2%] lg:h-[98%]">
        <BandDiagram mode={mode} />
      </div>

      <div className="relative z-10 grid min-h-[calc(780px-clamp(4.5rem,9vh,7rem))] grid-cols-1 px-[clamp(1rem,3vw,3rem)] pb-[clamp(1rem,3vh,2.5rem)] lg:h-[calc(100%-clamp(4.5rem,9vh,7rem))] lg:min-h-0 lg:grid-cols-12">
        <div className="flex flex-col pt-[clamp(2rem,7vh,6rem)] lg:col-span-7">
          <p className="mb-4 font-mono text-[clamp(.57rem,.67vw,.7rem)] uppercase tracking-[.23em] text-crimson">
            Torrent–Guasp · Ventricular myocardial band
          </p>
          <h1 className="m-0 max-w-[8.5ch] text-[clamp(3.6rem,8vw,9.6rem)] font-black uppercase leading-[.8] tracking-[-.075em]">
            One band.
            <span className="block text-transparent [-webkit-text-stroke:1.5px_#8d0e16]">
              Two loops.
            </span>
            <span className="block font-display font-normal italic normal-case tracking-[-.055em] text-crimson">
              One motion.
            </span>
          </h1>
        </div>

        <div className="relative z-20 mt-auto lg:col-span-5 lg:flex lg:items-end lg:justify-end">
          <div className="w-full border-t border-black/15 bg-white/65 py-4 backdrop-blur-[7px] lg:max-w-[28rem] lg:px-5">
            <div className="flex flex-wrap gap-2" role="group" aria-label="Myocardial band state">
              {MODES.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  aria-pressed={mode === m.id}
                  onClick={() => setMode(m.id)}
                  className={`min-h-11 flex-1 border px-3 font-mono text-[.55rem] uppercase tracking-[.16em] transition-colors ${{
                    true: "border-crimson bg-crimson text-white",
                    false: "border-black/15 bg-white/70 text-muted-foreground hover:border-crimson/40",
                  }[String(mode === m.id) as "true" | "false"]}`}
                >
                  {m.label}
                </button>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-[1fr_auto] gap-4 border-t border-black/10 pt-4">
              <div>
                <p className="m-0 font-mono text-[.55rem] uppercase tracking-[.18em] text-crimson">
                  {active.label}
                </p>
                <p className="mt-1 text-[.78rem] text-muted-foreground">{active.note}</p>
              </div>
              <p className="m-0 text-right font-mono text-[.52rem] uppercase leading-[1.7] tracking-[.14em] text-faint">
                {EVENT_INFO.dateLabel}
                <br />Hyderabad, India
              </p>
            </div>
          </div>
        </div>
      </div>

      <p className="absolute right-[clamp(1rem,3vw,3rem)] top-[24%] z-20 hidden max-w-[24ch] text-right text-[clamp(.7rem,.8vw,.82rem)] leading-[1.55] text-muted-foreground lg:block">
        The ventricular myocardium as a continuous band, coiled into a double
        helix and made visible as motion.
      </p>
    </section>
  );
}
