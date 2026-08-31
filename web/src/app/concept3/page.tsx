import EcgTrace from "@/components/field/EcgTrace";
import Ribbon from "@/components/site/Ribbon";
import Programme from "@/components/sections/Programme";
import Capabilities from "@/components/sections/Capabilities";
import Committee from "@/components/sections/Committee";
import Venues from "@/components/sections/Venues";
import Abstracts from "@/components/sections/Abstracts";
import Awards from "@/components/sections/Awards";
import Faculty from "@/components/sections/Faculty";
import Sponsors from "@/components/sections/Sponsors";
import RegisterCta from "@/components/sections/RegisterCta";
import Footer from "@/components/sections/Footer";
import CinematicLoader from "@/components/site/CinematicLoader";
import Dock from "@/components/site/Dock";
import { EVENT_INFO, STATS, NAV_ITEMS } from "@/lib/constants";
import { highlights } from "@/data/conference";

export default function Concept3() {
  return (
    <>
      <CinematicLoader />
      <Dock />
      <main id="main">
      <section className="relative flex h-svh max-h-[980px] min-h-[620px] flex-col overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute -top-[10vw] left-1/2 size-[46vw] -translate-x-1/2 rounded-full opacity-50 blur-[90px]"
          style={{ background: "radial-gradient(circle,rgba(179,18,28,.4) 0%,transparent 70%)" }} />

        <div className="relative z-[4] flex h-full flex-col u-shell py-[clamp(0.9rem,2vh,1.6rem)]">
          <nav className="flex shrink-0 items-center justify-between gap-6">
            <p className="m-0 text-[clamp(8.5px,.72vw,12px)] font-semibold leading-[1.35]">
              Indian Association of
              <span className="block font-normal text-muted">Cardiovascular-Thoracic Surgeons</span>
            </p>
            <div className="hidden items-center gap-[clamp(14px,1.8vw,30px)] lg:flex">
              {NAV_ITEMS.map((n) => (
                <a key={n.href} href={n.href} className="u-eyebrow no-underline hover:text-bone">{n.label}</a>
              ))}
            </div>
            <p className="u-eyebrow text-crimson-lift">Registration opens soon</p>
          </nav>

          <div className="flex min-h-0 flex-1 flex-col justify-center">
            <p className="u-eyebrow" data-r>
              {EVENT_INFO.dateLabel} · {EVENT_INFO.city} · Lead II, 25 mm/s
            </p>
            <h1 className="u-word m-0 mt-4 text-[clamp(58px,12.5vw,196px)]" data-r>
              {EVENT_INFO.acronym}
            </h1>

            {/* the trace runs straight through the lockup — it IS the rule */}
            <EcgTrace rhythm="sinus" className="-mt-[1vh] w-full" height={170} />

            <p className="m-0 text-[clamp(15px,3vw,42px)] font-extrabold leading-none tracking-[-0.012em]" data-r>
              TECHNOCOLLEGE CME <span className="text-gold-lift">2026</span>
            </p>
            <p className="u-serif m-0 mt-[clamp(10px,1.8vh,22px)] text-[clamp(20px,3.8vw,54px)] leading-none" data-r>
              {EVENT_INFO.theme}
            </p>

            <div className="mt-[clamp(16px,2.6vh,34px)] flex flex-wrap gap-[clamp(18px,3.4vw,54px)]">
              {STATS.map((s) => (
                <div key={s.label} data-r>
                  <div className="text-[clamp(20px,2.5vw,44px)] font-extrabold leading-none text-gold-lift">{s.value}</div>
                  <div className="u-eyebrow mt-1.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* rhythm changes with the argument: panels are where the field disagrees */}
      <section id="highlights" className="border-y border-[var(--hair)] bg-ink-2">
        <div className="u-shell pt-[clamp(3rem,7vh,6rem)]">
          <p className="u-eyebrow flex items-center gap-3" data-r>
            <span className="text-gold">02</span> Scientific Highlights
          </p>
          <h2 className="mt-5 max-w-3xl text-[clamp(1.8rem,4.2vw,3.4rem)] font-extrabold leading-[1.04] tracking-[-0.025em]" data-r>
            Eight strands, <span className="u-serif">one argument</span>
          </h2>
        </div>

        <EcgTrace rhythm="fib" className="mt-[clamp(1.5rem,3vh,2.5rem)] w-full" height={130} />

        <ul className="u-shell grid list-none grid-cols-1 gap-x-[clamp(1.5rem,3vw,3.5rem)] gap-y-0 p-0 pb-[clamp(3rem,7vh,6rem)] md:grid-cols-2">
          {highlights.map((h, i) => (
            <li key={h.title} data-r className="group border-b border-[var(--hair)] py-[clamp(1.1rem,2.6vh,1.8rem)]">
              <div className="flex items-baseline gap-4">
                <span className="font-mono text-[0.62rem] text-gold">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="m-0 text-[clamp(1.05rem,1.8vw,1.5rem)] font-bold transition-colors duration-500 group-hover:text-crimson-lift">
                  {h.title}
                </h3>
              </div>
              <p className="mt-1.5 pl-[calc(0.62rem+1rem)] text-[0.84rem] text-muted">{h.sub}</p>
            </li>
          ))}
        </ul>
      </section>

      <Ribbon />
      <Capabilities variant="telemetry" />
      <Programme />
      <Abstracts />
      <Committee />
      <Faculty />
      <Venues />
      <Awards />
      <Sponsors />
      <RegisterCta />
    </main>
      <Footer />
    </>
  );
}
