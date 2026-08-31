import { days } from "@/data/conference";

/**
 * Faculty.
 *
 * There is NO faculty list in the source material — the flyer says "Keynote
 * Lectures by Eminent Faculty" and names nobody. So this section does not
 * pretend to a roster. What is genuinely confirmed is the shape of the podium:
 * which formats the invited faculty will actually occupy, and the two that are
 * filled by submitted work instead. Those come straight from days[1].
 *
 * `SUBMITTED` mirrors Abstracts.tsx — the same two formats, seen from the other
 * side: there they are the routes open to you, here they are the slots the
 * invited faculty does NOT fill.
 */
const SUBMITTED = ["Paper & Video Presentations", "Young Surgeons Forum"];

export default function Faculty() {
  const podium = days[1].items.filter((i) => !SUBMITTED.includes(i.title));
  const labs = days[0].items;

  return (
    <section id="faculty" className="border-t border-[var(--hair)] u-shell py-[clamp(4rem,10vh,9rem)]">
      <div className="grid gap-[clamp(2rem,5vw,5rem)] lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)]">
        <header>
          <p className="u-eyebrow flex items-center gap-3" data-r>
            <span className="text-gold">07</span> Faculty
          </p>
          <h2
            className="mt-5 text-[clamp(1.9rem,4.4vw,3.6rem)] font-extrabold leading-[1.02] tracking-[-0.025em]"
            data-r
          >
            The podium is built. <span className="u-serif">The names come next.</span>
          </h2>
          <p className="mt-5 max-w-md text-[0.95rem] leading-relaxed text-muted" data-r>
            Five of the seven scientific formats are filled by invited faculty.
            The invitation list is not published yet — what is settled is the
            standard those sessions are held to.
          </p>
          <p
            className="mt-6 inline-block border border-[var(--hair-crimson)] px-4 py-2 font-mono text-[0.66rem] uppercase tracking-[0.16em] text-crimson-lift"
            data-r
          >
            Invited faculty to be announced
          </p>
        </header>

        <div>
          <p className="u-eyebrow text-gold-lift" data-r>Sessions led by invited faculty</p>
          <ul className="mt-4 list-none border-t border-[var(--hair)] p-0">
            {podium.map((s, i) => (
              <li
                key={s.title}
                data-r
                className="group grid grid-cols-[auto_1fr_auto] items-baseline gap-4 border-b border-[var(--hair)] py-3.5"
              >
                <span className="font-mono text-[0.62rem] tabular-nums text-faint">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-[0.95rem] transition-colors duration-500 group-hover:text-crimson-lift">
                  {s.title}
                </span>
                <span className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-gold">
                  {s.tag}
                </span>
              </li>
            ))}
          </ul>

          <p className="mt-8 u-eyebrow text-gold-lift" data-r>
            Faculty-supervised skills stations
          </p>
          <ul className="mt-4 flex list-none flex-wrap gap-2 p-0">
            {labs.map((l) => (
              <li
                key={l.title}
                data-r
                className="border border-[var(--hair)] px-3 py-1.5 text-[0.78rem] text-muted"
              >
                {l.title}
              </li>
            ))}
          </ul>
          <p className="mt-5 text-[0.82rem] text-faint">
            Every station runs under direct faculty supervision. Instructor
            names and delegate-to-station ratios follow with the timetable.
          </p>
        </div>
      </div>
    </section>
  );
}
