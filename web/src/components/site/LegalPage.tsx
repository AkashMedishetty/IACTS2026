import type { ReactNode } from "react";
import SiteHeader from "@/components/site/SiteHeader";
import Footer from "@/components/sections/Footer";
import { conference } from "@/data/conference";
import { conferenceConfig } from "@/config/conference.config";

export default function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated?: string;
  children: ReactNode;
}) {
  return (
    <div className="conference-site relative isolate min-h-svh">
      <SiteHeader />
      <main id="main" className="relative z-10 px-[var(--gutter)] pb-24 pt-[92px]">
        <article className="mx-auto w-full max-w-[760px]">
          <p className="flex items-center gap-3 font-mono text-[9px] uppercase tracking-[.24em] text-[#7d656c]">
            <span aria-hidden className="h-px w-8 bg-[#b3122a]" /> {conference.name}
          </p>
          <h1 className="mt-4 text-[clamp(2rem,5vw,3.6rem)] font-black uppercase leading-[.9] tracking-[-.05em] text-[#160a0d]">
            {title}
          </h1>
          {updated ? (
            <p className="mt-3 font-mono text-[9px] uppercase tracking-[.16em] text-[#7d656c]">Last updated {updated}</p>
          ) : null}

          <div className="legal mt-9 border-t border-[var(--hair)] pt-8">{children}</div>

          <div className="mt-12 border-l-2 border-[#b3122a] bg-white px-5 py-4">
            <p className="font-mono text-[9px] uppercase tracking-[.16em] text-[#7d656c]">Conference secretariat</p>
            <p className="mt-2 text-[13px] leading-[1.8] text-[#614d53]">
              {conferenceConfig.organizationName}<br />
              {conference.organisedBy}<br />
              <a href={`mailto:${conferenceConfig.contact.email}`} className="text-[#b3122a]">{conferenceConfig.contact.email}</a>
            </p>
          </div>
        </article>
      </main>
      <div className="relative z-10"><Footer /></div>

      <style>{`
        .legal h2 { font-size: 1rem; font-weight: 800; letter-spacing: -0.01em; color: #160a0d; margin: 2rem 0 0.6rem; }
        .legal h2:first-child { margin-top: 0; }
        .legal p, .legal li { font-size: 14px; line-height: 1.8; color: #614d53; }
        .legal p { margin: 0 0 0.9rem; }
        .legal ul { margin: 0 0 1rem; padding-left: 1.1rem; }
        .legal li { margin-bottom: .35rem; }
        .legal strong { color: #160a0d; }
        .legal a { color: #b3122a; }
        .legal .tbc { border-left: 2px solid #b3122a; background: #f8e9ed; padding: .75rem 1rem; margin: 1rem 0; font-size: 13px; }
      `}</style>
    </div>
  );
}
