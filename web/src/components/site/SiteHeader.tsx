"use client";

import { useState } from "react";
import { conference, secretariat } from "@/data/conference";
import { NAV_ITEMS } from "@/lib/constants";

export function Arrow() {
  return (
    <svg viewBox="0 0 20 20" className="size-4 shrink-0" fill="none" aria-hidden="true">
      <path d="M4 10h11M11 6l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Seal() {
  return (
    <span className="grid size-8 shrink-0 place-items-center rounded-full border border-[#b3122a] bg-white" aria-hidden="true">
      <svg viewBox="0 0 24 24" className="size-4 fill-[#b3122a]">
        <path d="M12 21.3S2.2 14 2.2 8.4A5.9 5.9 0 0 1 12 3.9a5.9 5.9 0 0 1 9.8 4.5c0 5.6-9.8 12.9-9.8 12.9Z" />
        <path d="M6.5 10.8h3l1.2-3.1 2.1 7.4 1.4-4.3h3.3" fill="none" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

export default function SiteHeader({ cta = true }: { cta?: boolean }) {
  const [open, setOpen] = useState(false);
  const nav = NAV_ITEMS.filter((n) => ["About", "Programme", "Workshops", "Abstracts", "Fees", "Venue"].includes(n.label));

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-[#b3122a]/15 bg-[#fffdfc]/95 backdrop-blur-sm">
        <div className="mx-auto flex h-[58px] max-w-[1720px] items-center justify-between gap-5 px-[var(--gutter)]">
          <a href="/" className="flex items-center gap-3 no-underline" aria-label={`${conference.acronym} home`}>
            <Seal />
            <span className="text-[10px] font-semibold uppercase leading-[1.25] tracking-[.08em] text-[#160a0d] sm:text-[11px]">
              Indian Association of
              <span className="block font-normal text-[#735b62]">Cardiovascular-Thoracic Surgeons</span>
            </span>
          </a>

          <nav aria-label="Primary" className="hidden items-center gap-[clamp(1rem,2vw,2rem)] xl:flex">
            {nav.map((n) => (
              <a key={n.path} href={n.path} className="font-mono text-[9px] font-medium uppercase tracking-[.16em] text-[#614d53] no-underline transition-colors hover:text-[#b3122a]">
                {n.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {cta ? (
              <a href="/register" className="hidden min-h-9 items-center gap-2 rounded-full bg-[#b3122a] px-5 font-mono text-[9px] font-medium uppercase tracking-[.16em] text-white no-underline transition-transform hover:-translate-y-0.5 sm:inline-flex">
                Register <Arrow />
              </a>
            ) : null}
            <button
              type="button"
              aria-expanded={open}
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((v) => !v)}
              className="grid size-9 place-items-center rounded-full border border-[#b3122a]/20 bg-white xl:hidden"
            >
              <span className="relative block h-3 w-5" aria-hidden="true">
                <span className={`absolute left-0 top-0.5 h-px w-full bg-[#b3122a] transition-transform ${open ? "translate-y-[5px] rotate-45" : ""}`} />
                <span className={`absolute bottom-0.5 left-0 h-px w-full bg-[#b3122a] transition-transform ${open ? "-translate-y-[5px] -rotate-45" : ""}`} />
              </span>
            </button>
          </div>
        </div>
      </header>

      {open ? (
        <div className="fixed inset-0 z-40 grid bg-[#b3122a] px-[var(--gutter)] pb-10 pt-20 text-white xl:hidden">
          <nav aria-label="Mobile" className="self-center">
            {NAV_ITEMS.map((n, i) => (
              <a key={n.path} href={n.path} onClick={() => setOpen(false)} className="flex items-baseline gap-4 border-b border-white/25 py-3 text-[clamp(1.6rem,7vw,3rem)] font-black uppercase leading-none tracking-[-.05em] text-white no-underline">
                <span className="font-mono text-[9px] font-normal tracking-[.16em] text-white/60">0{i + 1}</span>
                {n.label}
              </a>
            ))}
          </nav>
          <div className="self-end border-t border-white/25 pt-5 font-mono text-[10px] uppercase leading-6 tracking-[.15em] text-white/70">
            {conference.dates.label}<br />{conference.city}<br />{secretariat.email}
          </div>
        </div>
      ) : null}
    </>
  );
}
