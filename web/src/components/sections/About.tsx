import { conference, closingPromises, days, venues } from "@/data/conference";

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
    ["01", `Day one`, `${days[0].items.length} hands-on stations`, venues[0].name],
    ["02", `Days two & three`, `${days[1].items.length} session formats`, venues[1].name],
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

      <div className="relative grid gap-[clamp(2rem,5vw,5rem)] lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)]">
        <div>
          <p className="u-eyebrow flex items-center gap-3" data-r>
            <span className="text-gold">01</span> About
          </p>
          <h2
            className="mt-5 text-[clamp(2rem,5vw,4.2rem)] font-extrabold leading-[0.98] tracking-[-0.03em]"
            data-r
          >
            <span className="u-word">{conference.positioning}</span>
          </h2>
          <p className="mt-6 max-w-lg text-[1rem] leading-relaxed text-muted" data-r>
            A Technocollege CME convened by {conference.organisedBy} under the{" "}
            {conference.association} — a three-day programme in which the
            technology reshaping cardiothoracic surgery is delivered through
            hands-on training alongside the scientific sessions.
          </p>

          <ul className="mt-8 flex list-none flex-wrap items-center gap-x-6 gap-y-2 p-0" data-r>
            {conference.pillars.map((p) => (
              <li
                key={p}
                className="font-mono text-[0.72rem] uppercase tracking-[0.2em] text-gold-lift"
              >
                {p}
              </li>
            ))}
          </ul>

          <div className="mt-10 border-t border-[var(--hair)]">
            {structure.map(([n, when, what, where]) => (
              <div
                key={n}
                data-r
                className="grid grid-cols-[auto_1fr] items-baseline gap-x-4 border-b border-[var(--hair)] py-4 sm:grid-cols-[auto_1fr_auto_auto] sm:gap-x-6"
              >
                <span className="font-mono text-[0.62rem] tabular-nums text-faint">{n}</span>
                <span className="text-[0.95rem] font-semibold">{when}</span>
                <span className="col-start-2 text-[0.85rem] text-muted sm:col-start-auto">
                  {what}
                </span>
                <span className="col-start-2 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-gold sm:col-start-auto">
                  {where}
                </span>
              </div>
            ))}
          </div>
        </div>

        <aside className="lg:pt-[clamp(3rem,8vh,7rem)]">
          <p className="u-eyebrow text-gold-lift" data-r>
            What you leave with
          </p>
          <ul className="mt-4 list-none border-t border-[var(--hair-gold)] p-0">
            {closingPromises.map((c, i) => (
              <li
                key={c}
                data-r
                className="group flex items-baseline gap-4 border-b border-[var(--hair)] py-3.5"
              >
                <span className="font-mono text-[0.6rem] tabular-nums text-gold">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-[0.95rem] transition-colors duration-500 group-hover:text-crimson-lift">
                  {c}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-6 u-serif text-[clamp(1rem,1.8vw,1.35rem)] leading-snug text-muted" data-r>
            {conference.closing}
          </p>
        </aside>
      </div>
    </section>
  );
}
