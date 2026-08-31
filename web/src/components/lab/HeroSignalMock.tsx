import EcgTrace from "@/components/field/EcgTrace";
import LabHeader from "@/components/lab/LabHeader";
import { EVENT_INFO } from "@/lib/constants";

export default function HeroSignalMock() {
  return (
    <section
      id="lab-signal"
      className="relative min-h-[760px] overflow-hidden bg-ink text-bone lg:h-svh lg:max-h-[1080px]"
      style={{
        backgroundImage:
          "linear-gradient(rgba(179,18,28,.055) 1px,transparent 1px),linear-gradient(90deg,rgba(179,18,28,.055) 1px,transparent 1px)",
        backgroundSize: "22px 22px",
      }}
    >
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(251,251,252,.98)_0%,rgba(251,251,252,.7)_36%,rgba(251,251,252,.48)_64%,rgba(251,251,252,.98)_100%)]" />
      <LabHeader index="03 / The signal" />

      <div className="relative z-10 flex min-h-[calc(760px-clamp(4.5rem,9vh,7rem))] flex-col px-[clamp(1rem,3vw,3rem)] pb-[clamp(1rem,3vh,2.5rem)] lg:h-[calc(100%-clamp(4.5rem,9vh,7rem))] lg:min-h-0">
        <div className="grid flex-1 grid-cols-2 grid-rows-[auto_1fr_auto] pt-[clamp(2rem,7vh,6rem)] lg:grid-cols-12">
          <div className="col-span-2 lg:col-span-5">
            <p className="mb-4 font-mono text-[clamp(.57rem,.67vw,.7rem)] uppercase tracking-[.23em] text-crimson">
              Live signal · Lead II · 25 mm/s
            </p>
            <h1 className="m-0 max-w-[7ch] text-[clamp(3.8rem,8.8vw,10.8rem)] font-black uppercase leading-[.77] tracking-[-.08em]">
              The
              <span className="block font-display font-normal italic normal-case tracking-[-.06em] text-crimson">
                future
              </span>
            </h1>
          </div>

          <div className="col-span-2 flex items-start justify-end lg:col-span-7">
            <p className="m-0 text-right text-[clamp(4.5rem,12vw,13rem)] font-black leading-[.75] tracking-[-.09em] text-black/[.055]">
              20<span className="text-crimson/[.11]">26</span>
            </p>
          </div>

          <div className="relative col-span-2 -mx-[clamp(1rem,3vw,3rem)] self-center lg:col-span-12">
            <EcgTrace rhythm="sinus" className="w-full" height={210} />
            <div className="pointer-events-none absolute inset-x-[clamp(1rem,3vw,3rem)] top-1/2 -translate-y-1/2">
              <p className="absolute left-0 -translate-y-[calc(50%+3.8rem)] font-mono text-[.54rem] uppercase tracking-[.18em] text-faint">
                Sinus rhythm / illustrative
              </p>
              <p className="absolute right-0 translate-y-[calc(-50%+3.6rem)] text-right font-mono text-[.54rem] uppercase leading-[1.7] tracking-[.17em] text-faint">
                Science. Skill. Innovation.
                <br />Hyderabad, India
              </p>
            </div>
          </div>

          <div className="col-span-2 self-end lg:col-span-7">
            <h2 className="m-0 text-[clamp(2.1rem,5.5vw,6.5rem)] font-black uppercase leading-[.84] tracking-[-.07em]">
              Is now<span className="text-crimson">.</span>
            </h2>
            <p className="mt-4 max-w-[40ch] text-[clamp(.82rem,1vw,1rem)] leading-[1.55] text-muted">
              A three-day live reading of where cardiothoracic surgery is going—and
              the skills required to get there.
            </p>
          </div>

          <div className="col-span-2 mt-8 grid grid-cols-3 self-end border-y border-black/12 lg:col-span-5 lg:mt-0">
            {[
              ["23", "Workshop"],
              ["24", "Science"],
              ["25", "Practice"],
            ].map(([day, label]) => (
              <div key={day} className="border-r border-black/12 py-4 text-center last:border-r-0">
                <strong className="block text-[clamp(1.5rem,2.4vw,2.7rem)] leading-none text-crimson">
                  {day}
                </strong>
                <span className="mt-2 block font-mono text-[.53rem] uppercase tracking-[.17em] text-faint">
                  Oct · {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-black/12 pt-4">
          <p className="m-0 font-mono text-[.55rem] uppercase tracking-[.18em] text-faint">
            {EVENT_INFO.acronym} Technocollege CME
          </p>
          <a
            href="#programme"
            className="font-mono text-[.57rem] uppercase tracking-[.18em] text-crimson underline decoration-crimson/35 underline-offset-4"
          >
            Read the programme ↗
          </a>
        </div>
      </div>
    </section>
  );
}
