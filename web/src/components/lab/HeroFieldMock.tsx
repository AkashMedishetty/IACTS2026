import CloudField from "@/components/field/CloudField";
import LabHeader from "@/components/lab/LabHeader";
import { EVENT_INFO } from "@/lib/constants";

export default function HeroFieldMock() {
  return (
    <section
      id="lab-field"
      className="relative min-h-[700px] overflow-hidden bg-ink text-bone sm:min-h-[760px] lg:h-svh lg:max-h-[1080px]"
    >
      <div
        aria-hidden
        className="absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(circle at 77% 46%,rgba(179,18,28,.11),transparent 32%),linear-gradient(90deg,transparent 49.92%,rgba(12,12,14,.055) 50%,transparent 50.08%)",
        }}
      />
      <LabHeader index="01 / Operative field" />

      <div className="relative z-10 grid min-h-[calc(700px-clamp(4.5rem,9vh,7rem))] grid-cols-1 px-[clamp(1rem,3vw,3rem)] pb-4 sm:min-h-[calc(760px-clamp(4.5rem,9vh,7rem))] sm:pb-[clamp(1rem,3vh,2.5rem)] lg:h-[calc(100%-clamp(4.5rem,9vh,7rem))] lg:min-h-0 lg:grid-cols-12 lg:gap-[clamp(1rem,3vw,4rem)]">
        <div className="relative z-20 flex flex-col justify-between py-6 lg:col-span-6 lg:py-[clamp(2rem,6vh,5.5rem)]">
          <div>
            <p className="mb-[clamp(1rem,2vh,1.8rem)] flex items-center gap-3 font-mono text-[clamp(.58rem,.67vw,.7rem)] uppercase tracking-[.22em] text-crimson">
              <span className="h-px w-10 bg-crimson" />
              Technocollege CME · Hyderabad
            </p>
            <h1 className="m-0 max-w-[8ch] text-[clamp(3.8rem,7.5vw,8.8rem)] font-black uppercase leading-[.78] tracking-[-.07em]">
              The Future
              <span className="block font-display font-normal italic normal-case tracking-[-.055em] text-crimson">
                is now.
              </span>
            </h1>
            <p className="mt-[clamp(1.4rem,3vh,2.6rem)] max-w-[37ch] text-[clamp(.92rem,1.2vw,1.18rem)] leading-[1.55] text-muted">
              Three days where the next generation of cardiothoracic surgery
              moves from the screen to the surgeon&apos;s hands.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-4 border-y border-black/12 lg:mt-8 lg:max-w-[43rem]">
            {[
              ["23—25", "October 2026"],
              ["03", "Clinical days"],
              ["05", "Hands-on tracks"],
              ["07", "Session formats"],
            ].map(([value, label]) => (
              <div key={label} className="border-r border-black/12 px-1 py-3 last:border-r-0 sm:px-3 sm:py-4 sm:first:pl-0">
                <strong className="block text-[clamp(1rem,2vw,2rem)] leading-none text-bone">
                  {value}
                </strong>
                <span className="mt-2 block font-mono text-[.55rem] uppercase tracking-[.17em] text-faint">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative flex min-h-[280px] items-center justify-center pb-4 lg:col-span-6 lg:min-h-0 lg:pb-0">
          <div className="relative aspect-square w-[min(78vw,19rem)] overflow-hidden rounded-full border border-crimson/25 bg-white shadow-[0_24px_70px_rgba(122,14,20,.12)] sm:w-[min(90vw,34rem)] lg:w-[min(46vw,48rem)]">
            <div className="absolute inset-[7%] rounded-full border border-black/10" />
            <div className="absolute left-1/2 top-0 h-full w-px bg-black/[.06]" />
            <div className="absolute left-0 top-1/2 h-px w-full bg-black/[.06]" />
            <CloudField className="absolute -inset-[7%] scale-[1.08]" />
            <div className="absolute left-[7%] top-[10%] font-mono text-[.55rem] uppercase tracking-[.18em] text-crimson">
              Field 01 · Myocardium
            </div>
            <div className="absolute bottom-[9%] right-[8%] text-right font-mono text-[.52rem] uppercase leading-[1.7] tracking-[.16em] text-faint">
              Patient-derived anatomy
              <br />Interactive volume study
            </div>
          </div>
          <p className="absolute bottom-0 left-0 m-0 font-mono text-[.55rem] uppercase tracking-[.18em] text-faint lg:left-auto lg:right-0">
            {EVENT_INFO.dateLabel} · {EVENT_INFO.city}
          </p>
        </div>
      </div>
    </section>
  );
}
