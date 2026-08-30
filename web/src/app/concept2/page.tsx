"use client";

import { useState } from "react";
import HelicalBand, { type BandMode } from "@/components/field/HelicalBand";
import Ribbon from "@/components/site/Ribbon";
import Programme from "@/components/sections/Programme";
import Committee from "@/components/sections/Committee";
import Venues from "@/components/sections/Venues";
import RegisterCta from "@/components/sections/RegisterCta";
import Footer from "@/components/sections/Footer";
import { EVENT_INFO, NAV_ITEMS } from "@/lib/constants";

const MODES: { id: BandMode; label: string; note: string }[] = [
  { id: "basal", label: "Basal Loop", note: "Transverse fibres encircling both ventricles" },
  { id: "apical", label: "Apical Vortex", note: "Oblique segments descending into the apical cone" },
  { id: "twist", label: "Systolic Twist", note: "Base and apex counter-rotate — the heart wrings" },
];

export default function Concept2() {
  const [mode, setMode] = useState<BandMode>("basal");
  const active = MODES.find((m) => m.id === mode)!;

  return (
    <>
      <main id="main">
      <section className="relative flex h-svh max-h-[980px] min-h-[620px] flex-col overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 size-[52vw] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60 blur-[90px]"
          style={{ background: "radial-gradient(circle,rgba(179,18,28,.34) 0%,transparent 70%)" }} />

        <HelicalBand mode={mode} className="absolute inset-0 z-[1]" />

        <div className="relative z-[4] flex h-full flex-col u-shell py-[clamp(0.9rem,2vh,1.6rem)]">
          <nav className="flex shrink-0 flex-wrap items-start justify-between gap-4">
            <p className="m-0 text-[clamp(8.5px,.72vw,12px)] font-semibold leading-[1.35]">
              Indian Association of
              <span className="block font-normal text-muted">Cardiovascular-Thoracic Surgeons</span>
            </p>

            <div role="group" aria-label="Myocardial band state"
              className="flex border border-[var(--hair-gold)] bg-white/[0.04] p-1 backdrop-blur-md">
              {MODES.map((m) => (
                <button key={m.id} type="button" onClick={() => setMode(m.id)}
                  aria-pressed={mode === m.id}
                  className={`min-h-[34px] px-3 py-2 font-mono text-[9px] uppercase tracking-[0.14em] transition-colors duration-300 ${
                    mode === m.id ? "bg-crimson text-bone" : "text-muted hover:text-bone"
                  }`}>
                  {m.label}
                </button>
              ))}
            </div>

            <div className="hidden items-center gap-[clamp(14px,1.7vw,28px)] xl:flex">
              {NAV_ITEMS.slice(0, 4).map((n) => (
                <a key={n.href} href={n.href} className="u-eyebrow no-underline hover:text-bone">{n.label}</a>
              ))}
            </div>
          </nav>

          <div className="flex min-h-0 flex-1 flex-col items-center justify-center text-center">
            <p className="u-eyebrow" data-r>{EVENT_INFO.dateLabel} · {EVENT_INFO.city}</p>
            <h1 className="u-word m-0 mt-4 text-[clamp(58px,12vw,182px)]" data-r>
              {EVENT_INFO.acronym}
            </h1>
            <p className="m-0 mt-2 text-[clamp(14px,2.7vw,38px)] font-extrabold leading-none tracking-[-0.012em]" data-r>
              TECHNOCOLLEGE CME <span className="text-gold-lift">2026</span>
            </p>
            <p className="u-serif m-0 mt-[clamp(10px,1.8vh,22px)] text-[clamp(20px,3.6vw,52px)] leading-none" data-r>
              {EVENT_INFO.theme}
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap items-end justify-between gap-6 border-t border-[var(--hair)] pt-[clamp(10px,1.6vh,20px)]">
            <p className="u-eyebrow leading-[1.9] text-faint">
              <span className="block text-bone">{active.label}</span>{active.note}
            </p>
            <p className="max-w-[38ch] text-right font-mono text-[9.5px] leading-[1.75] tracking-[0.06em] text-muted">
              <span className="block uppercase tracking-[0.14em] text-bone">What you are looking at</span>
              The ventricular myocardium as a single continuous band coiled in a
              double helix — Torrent-Guasp&apos;s helical ventricular myocardial
              band. Move the pointer to excite the fibres.
            </p>
          </div>
        </div>
      </section>

      <Ribbon />
      <Programme />
      <Committee />
      <Venues />
      <RegisterCta />
    </main>
      <Footer />
    </>
  );
}
