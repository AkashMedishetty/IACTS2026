import type { ReactNode } from "react";
import SiteHeader from "@/components/site/SiteHeader";
import Footer from "@/components/sections/Footer";
import { conference } from "@/data/conference";

export default function PageShell({
  eyebrow,
  title,
  accent,
  lede,
  children,
}: {
  eyebrow?: string;
  title: string;
  accent?: string;
  lede?: string;
  children: ReactNode;
}) {
  return (
    <div className="conference-site relative isolate min-h-svh">
      <SiteHeader />
      <main id="main" className="relative z-10 pb-20 pt-[104px]">
        {/* Same column as every section card below it, so the page title starts
            at exactly the same x as the body copy. It used to sit in its own
            1180px column and was indented ~50px further in than the content. */}
        <header className="u-shell">
          <div className="w-full border-b border-[var(--hair)] pb-8">
            <p className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[.22em] text-[#6a545a]">
              <span aria-hidden className="h-px w-8 bg-[#b3122a]" />{" "}
              {eyebrow || `${conference.dates.label} · ${conference.city}`}
            </p>
            <h1 className="mt-4 text-[clamp(2.2rem,6vw,4.2rem)] font-black uppercase leading-[.88] tracking-[-.055em] text-[#160a0d]">
              {title} {accent ? <span className="text-[#b3122a]">{accent}</span> : null}
            </h1>
            {lede ? <p className="mt-4 max-w-[58ch] text-[clamp(1rem,1.1vw,1.08rem)] leading-[1.8] text-[#614d53]">{lede}</p> : null}
          </div>
        </header>
        <div className="conference-content conference-content--page">{children}</div>
      </main>
      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
}
