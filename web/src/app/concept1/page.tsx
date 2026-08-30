import CloudField from "@/components/field/CloudField";
import Ribbon from "@/components/site/Ribbon";
import Programme from "@/components/sections/Programme";
import Capabilities from "@/components/sections/Capabilities";
import Committee from "@/components/sections/Committee";
import Venues from "@/components/sections/Venues";
import RegisterCta from "@/components/sections/RegisterCta";
import Footer from "@/components/sections/Footer";
import CinematicLoader from "@/components/site/CinematicLoader";
import Dock from "@/components/site/Dock";
import { EVENT_INFO, STATS, NAV_ITEMS } from "@/lib/constants";
import { days, secretariat } from "@/data/conference";

function Arrow() {
  return (
    <svg viewBox="0 0 24 24" className="w-[clamp(11px,1vw,15px)] shrink-0" fill="none" aria-hidden="true">
      <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Concept1() {
  return (
    <>
      <CinematicLoader />
      <Dock />
      <main id="main">
      <section className="relative flex h-svh max-h-[980px] min-h-[600px] flex-col overflow-hidden">
        {/* blurred radial colour fields — the depth layer */}
        <div aria-hidden className="pointer-events-none absolute -right-[7vw] -top-[11vw] size-[34vw] rounded-full opacity-55 blur-[70px]"
          style={{ background: "radial-gradient(circle,rgba(179,18,28,.55) 0%,transparent 68%)" }} />
        <div aria-hidden className="pointer-events-none absolute -bottom-[12vw] -left-[8vw] size-[30vw] rounded-full opacity-55 blur-[70px]"
          style={{ background: "radial-gradient(circle,rgba(193,141,33,.42) 0%,transparent 70%)" }} />

        <CloudField className="absolute inset-0 z-[1] translate-x-[12%]" />

        <div className="relative z-[4] flex h-full flex-col u-shell py-[clamp(0.9rem,2vh,1.6rem)]">
          <nav className="flex shrink-0 items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-full border border-crimson/55 bg-crimson/10">
                <svg viewBox="0 0 12 12" className="size-[42%] fill-crimson-lift" aria-hidden="true">
                  <path d="M6 11.2S.4 7 .4 3.8A3.4 3.4 0 0 1 6 1.2 3.4 3.4 0 0 1 11.6 3.8C11.6 7 6 11.2 6 11.2Z" />
                </svg>
              </span>
              <p className="m-0 text-[clamp(8.5px,.72vw,12px)] font-semibold leading-[1.35]">
                Indian Association of
                <span className="block font-normal text-muted">Cardiovascular-Thoracic Surgeons</span>
              </p>
            </div>
            <div className="hidden items-center gap-[clamp(14px,1.9vw,34px)] lg:flex">
              {NAV_ITEMS.map((n) => (
                <a key={n.href} href={n.href} className="u-eyebrow no-underline transition-colors duration-300 hover:text-bone">
                  {n.label}
                </a>
              ))}
            </div>
            <a href="#register"
              className="inline-flex items-center gap-2 rounded-full px-[clamp(15px,1.9vw,30px)] py-[clamp(9px,1.1vh,15px)] font-mono text-[clamp(9px,.75vw,12px)] font-semibold uppercase tracking-[0.14em] text-white no-underline transition-transform duration-500 hover:-translate-y-0.5"
              style={{ background: "linear-gradient(135deg,#B3121C 0%,#C18D21 130%)" }}>
              Register <Arrow />
            </a>
          </nav>

          <div className="flex min-h-0 flex-1 items-center">
            <div className="max-w-[min(96vw,1180px)]">
              <p className="u-eyebrow flex items-center gap-3" data-r>
                <span aria-hidden className="inline-block h-px w-[clamp(22px,3vw,48px)] bg-gold" />
                Technocollege CME · {EVENT_INFO.city}
              </p>

              <h1 className="u-word m-0 mt-[clamp(10px,1.6vh,20px)] text-[clamp(62px,13.5vw,208px)]" data-r>
                {EVENT_INFO.acronym}
              </h1>
              <p className="m-0 mt-[clamp(4px,.8vh,12px)] text-[clamp(15px,3.1vw,44px)] font-extrabold leading-none tracking-[-0.012em]" data-r>
                TECHNOCOLLEGE CME <span className="text-gold-lift">2026</span>
              </p>
              <p className="u-serif m-0 mt-[clamp(12px,2vh,26px)] text-[clamp(21px,4vw,58px)] leading-none" data-r>
                {EVENT_INFO.theme}
              </p>

              <div className="mt-[clamp(18px,3vh,40px)] flex flex-wrap items-start gap-[clamp(18px,3.4vw,58px)]">
                {STATS.map((s) => (
                  <div key={s.label} data-r>
                    <div className="text-[clamp(22px,2.8vw,50px)] font-extrabold leading-none"
                      style={{ background: "linear-gradient(140deg,#F5F3EF 0%,#C18D21 120%)", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                      {s.value}
                    </div>
                    <div className="u-eyebrow mt-1.5">{s.label}</div>
                  </div>
                ))}
              </div>

              <div className="mt-[clamp(20px,3.2vh,40px)] flex flex-wrap items-center gap-[clamp(12px,1.6vw,24px)]" data-r>
                <a href="#register"
                  className="inline-flex items-center gap-2 rounded-full px-[clamp(15px,1.9vw,30px)] py-[clamp(9px,1.1vh,15px)] font-mono text-[clamp(9px,.75vw,12px)] font-semibold uppercase tracking-[0.14em] text-white no-underline transition-transform duration-500 hover:-translate-y-0.5"
                  style={{ background: "linear-gradient(135deg,#B3121C 0%,#C18D21 130%)" }}>
                  Notify me when registration opens <Arrow />
                </a>
                <a href="#programme" className="u-eyebrow border-b border-muted/35 pb-1 no-underline transition-colors duration-500 hover:text-gold-lift">
                  View the programme
                </a>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-end justify-between gap-[clamp(14px,2vw,36px)] border-t border-[var(--hair)] pt-[clamp(10px,1.6vh,20px)]">
            <p className="u-eyebrow leading-[1.9] text-faint">
              <span className="block text-bone">{EVENT_INFO.dateLabel}</span>{EVENT_INFO.city}
            </p>
            {days.map((d) => (
              <p key={d.id} className="u-eyebrow leading-[1.9] text-faint">
                <span className="block text-bone">{d.kicker}</span>{d.venue.split("(")[0].trim()}
              </p>
            ))}
            <p className="u-eyebrow leading-[1.9] text-faint">
              <span className="block text-crimson-lift">Registration opens soon</span>Fees to be announced
            </p>
            <p className="u-eyebrow leading-[1.9] text-faint">
              <span className="block text-bone">Secretariat</span>{secretariat.email}
            </p>
          </div>
        </div>
      </section>

      <Ribbon />
      <Capabilities variant="instrument" />
      <Programme />
      <Committee />
      <Venues />
      <RegisterCta />
    </main>
      <Footer />
    </>
  );
}
