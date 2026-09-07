import { conference, venues } from "@/data/conference";

/**
 * About.
 *
 * This existed as a hole. NAV_ITEMS carried an "About" link pointing at
 * `#about`, which no section had — a dead click on all three routes. More to
 * the point, nothing anywhere on the site said what this conference IS or who
 * should come, which is the first thing a surgeon deciding whether to spend
 * three days in Hyderabad wants to know.
 *
 * Everything here was already in conference.ts and simply unused: `positioning`,
 * `pillars`, `closingPromises`, `organisedBy`, `association`. The hero only ever
 * used acronym / city / theme, so none of this duplicates it.
 */
export default function About() {
  const structure = [
    ["01", `Day one`, `Pre-Conference Workshop`, venues[0].name],
    ["02", `Days two & three`, `Scientific Programme`, venues[1].name],
  ];

  return (
    <section
      id="about"
      className="relative overflow-hidden border-t border-[var(--hair)] u-shell py-[clamp(4rem,10vh,9rem)]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -left-[14vw] top-[10%] size-[32vw] rounded-full opacity-35 blur-[100px]"
        style={{ background: "radial-gradient(circle,rgba(179,18,28,.4) 0%,transparent 70%)" }}
      />

      <div className="relative mx-auto max-w-3xl">
        <p className="u-eyebrow flex items-center gap-3" data-r>
          <span className="text-gold">01</span> About the CME
        </p>
        <h2
          className="mt-5 text-[clamp(2rem,5vw,3.6rem)] font-extrabold leading-[1] tracking-[-0.03em]"
          data-r
        >
          <span className="u-word">A three-day cardiothoracic surgery CME in Hyderabad.</span>
        </h2>
        <p className="mt-6 max-w-2xl text-[1.05rem] leading-relaxed text-muted-foreground" data-r>
          Convened by {conference.organisedBy} under the aegis of the {conference.association} —
          a hands-on pre-conference workshop followed by two days of scientific
          sessions.
        </p>

        <div className="mt-10 border-t border-[var(--hair)]">
          {structure.map(([n, when, what, where]) => (
            <div
              key={n}
              data-r
              className="grid grid-cols-[auto_1fr] items-baseline gap-x-4 border-b border-[var(--hair)] py-4 sm:grid-cols-[auto_1fr_auto_auto] sm:gap-x-6"
            >
              <span className="font-mono text-[0.62rem] tabular-nums text-faint">{n}</span>
              <span className="text-[1rem] font-semibold">{when}</span>
              <span className="col-start-2 text-[0.92rem] text-muted-foreground sm:col-start-auto">
                {what}
              </span>
              <span className="col-start-2 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-gold sm:col-start-auto">
                {where}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
