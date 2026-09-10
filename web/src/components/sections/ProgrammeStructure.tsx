import { days, programmeOverview } from "@/data/conference";

/**
 * The programme's actual structure, from the committee's own programme note:
 * Day Zero hands-on at NIMS, then two days at Dr. MCR HRD Institute organised
 * around four domains, plus the Breakthrough Sessions.
 *
 * This replaced a "detailed programme announcing soon" placeholder. Session
 * timings and faculty are still unpublished, so those remain absent rather than
 * invented — the structure is confirmed, the timetable is not.
 */
export default function ProgrammeStructure() {
  const { dayZero, scientific, domains, breakthrough } = programmeOverview;

  return (
    <section
      id="structure"
      className="border-t border-[var(--hair)] u-shell py-[clamp(4rem,10vh,9rem)]"
    >
      {/* The "Structure / How the three days work / Not merely what to do but
          how to think it through" heading block was REMOVED on the
          10 September 2026 review — "this thing, take this off". The page's own
          PROGRAMME OVERVIEW heading now carries it, and this section leads
          straight into the days. Breakthrough Sessions below was explicitly
          kept: "breakthrough sessions is good." */}

      {/* DAY ZERO */}
      <div className="grid gap-[clamp(1.5rem,4vw,4rem)] lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)]">
        <div data-r>
          <p className="text-[clamp(1.5rem,3.2vw,2.6rem)] font-extrabold leading-[1.05] tracking-[-0.025em] text-[#b3122a]">
            {days[0].date}
          </p>
          <p className="mt-2 text-[clamp(1.05rem,1.9vw,1.5rem)] font-bold leading-snug tracking-[-0.015em] text-[#160a0d]">
            {dayZero.label} · {dayZero.heading}
          </p>
          <p className="mt-3 text-[1rem] text-muted-foreground">{dayZero.venue}</p>
        </div>
        <div>
          <p className="max-w-2xl text-[clamp(1rem,1.15vw,1.1rem)] leading-[1.8] text-muted-foreground" data-r>
            {dayZero.body}
          </p>
          <ul className="mt-6 grid list-none gap-x-8 border-t border-[var(--hair)] p-0 sm:grid-cols-2">
            {dayZero.skills.map((skill, i) => (
              <li
                key={skill}
                data-r
                className="flex items-baseline gap-3 border-b border-[var(--hair)] py-3"
              >
                <span className="font-mono text-[0.7rem] tabular-nums text-gold">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-[1rem]">{skill}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* SCIENTIFIC DOMAINS */}
      <div className="mt-[clamp(3rem,7vh,6rem)] grid gap-[clamp(1.5rem,4vw,4rem)] lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)]">
        <div data-r>
          <p className="text-[clamp(1.5rem,3.2vw,2.6rem)] font-extrabold leading-[1.05] tracking-[-0.025em] text-[#b3122a]">
            {days[1].date}
          </p>
          <p className="mt-2 text-[clamp(1.05rem,1.9vw,1.5rem)] font-bold leading-snug tracking-[-0.015em] text-[#160a0d]">
            {scientific.label} · {scientific.heading}
          </p>
          <p className="mt-3 text-[1rem] text-muted-foreground">{scientific.venue}</p>
        </div>
        <div>
          <p className="max-w-2xl text-[clamp(1rem,1.15vw,1.1rem)] leading-[1.8] text-muted-foreground" data-r>
            {scientific.body}
          </p>
          <ul className="mt-6 list-none border-t border-[var(--hair)] p-0">
            {domains.map((domain) => (
              <li
                key={domain.code}
                data-r
                className="group grid grid-cols-[auto_1fr] items-baseline gap-x-4 border-b border-[var(--hair)] py-4"
              >
                <span className="font-mono text-[0.66rem] tabular-nums text-gold">
                  {domain.code}
                </span>
                <span>
                  <span className="block text-[clamp(0.98rem,1.6vw,1.3rem)] font-medium transition-colors duration-500 group-hover:text-crimson-lift">
                    {domain.title}
                  </span>
                  {"note" in domain && domain.note ? (
                    <span className="mt-1 block font-mono text-[0.7rem] uppercase tracking-[0.14em] text-faint">
                      {domain.note}
                    </span>
                  ) : null}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* BREAKTHROUGH SESSIONS */}
      <div
        data-r
        className="mt-[clamp(3rem,7vh,6rem)] border-l-2 border-crimson bg-ink-2 p-[clamp(1.5rem,3vw,3rem)]"
      >
        <p className="u-eyebrow text-gold-lift">A distinctive feature</p>
        <h3 className="mt-3 text-[clamp(1.4rem,3vw,2.4rem)] font-extrabold tracking-[-0.025em]">
          {breakthrough.heading}
        </h3>
        <p className="mt-4 max-w-3xl text-[clamp(1rem,1.15vw,1.1rem)] leading-[1.8] text-muted-foreground">
          {breakthrough.body}
        </p>
      </div>

      <p className="mt-8 font-mono text-[0.74rem] uppercase tracking-[0.16em] text-crimson-lift">
        Session timings and faculty to be announced
      </p>
    </section>
  );
}
