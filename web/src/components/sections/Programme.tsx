import { days } from "@/data/conference";

/**
 * Programme overview — rebuilt to the 10 September 2026 committee review.
 *
 * Three instructions shaped this, and each removed something:
 *  - The DAY ZERO block is gone entirely. "We already have pre-conference
 *    hands-on workshop details here, so take this off — the whole thing has to
 *    go." It lives on /workshops, and duplicating it here was the complaint.
 *  - The big stage words ("APPROACH", "EXPOSURE") are gone: "just the name, not
 *    the whole thing … don't need the title exposure." The item list they
 *    labelled stays exactly as it was.
 *  - The day label and its October date are now the largest type in the block,
 *    on the instruction to "make all this day 0, day one along with October 23rd,
 *    24th a bit bigger".
 *
 * The schedule notice is deliberately the first thing after the heading: the
 * committee wanted it visible up front, because this is an overview and the
 * timetable is not final.
 */
export default function Programme() {
  /* Only the scientific days render here. days[0] is Day Zero and belongs to
     /workshops — see the note above before adding it back. */
  const scientificDays = days.slice(1);

  return (
    <section id="programme" className="u-shell py-[clamp(4rem,10vh,9rem)]">
      <header className="max-w-3xl">
        <h2
          className="text-[clamp(2.2rem,5.6vw,4.4rem)] font-extrabold uppercase leading-[1.02] tracking-[-0.03em]"
          data-r
        >
          <span className="u-word">Programme Overview</span>
        </h2>
        <p className="mt-6 max-w-2xl text-[clamp(1rem,1.2vw,1.12rem)] leading-[1.8] text-muted-foreground" data-r>
          October 23 is the hands-on pre-conference workshop at NIMS. October 24 and 25 move to the Dr. MCR HRD
          Institute auditorium for the scientific programme.
        </p>

        <p
          className="mt-6 border-l-2 border-[#b3122a] bg-white/70 px-5 py-4 text-[clamp(0.98rem,1.15vw,1.08rem)] font-semibold leading-[1.7] text-[#160a0d]"
          data-r
        >
          The full scientific schedule will be uploaded once finalised.
        </p>
      </header>

      <div className="mt-[clamp(2.5rem,6vh,5rem)] grid gap-[clamp(2.5rem,6vh,6rem)]">
        {scientificDays.map((day) => (
          <article
            key={day.id}
            className="grid gap-[clamp(1rem,3vw,3.5rem)] lg:grid-cols-[minmax(0,26%)_minmax(0,1fr)]"
          >
            <div className="lg:sticky lg:top-24 lg:self-start">
              <p
                className="text-[clamp(1.5rem,3.2vw,2.6rem)] font-extrabold leading-[1.05] tracking-[-0.025em] text-[#b3122a]"
                data-r
              >
                {day.date}
              </p>
              <p
                className="mt-3 text-[clamp(1.05rem,1.7vw,1.4rem)] font-bold leading-snug tracking-[-0.015em] text-[#160a0d]"
                data-r
              >
                {day.kicker}
              </p>
              <p className="mt-4 max-w-xs text-[0.95rem] leading-relaxed text-muted-foreground" data-r>
                {day.venue}
              </p>
            </div>

            <div>
              <p className="max-w-lg text-[1rem] leading-[1.8] text-muted-foreground" data-r>
                {day.blurb}
              </p>
              <ul className="mt-[clamp(1.5rem,4vh,2.5rem)] list-none border-t border-[var(--hair)] p-0">
                {day.items.map((item, i) => (
                  <li
                    key={item.title}
                    data-r
                    className="group grid grid-cols-[auto_1fr_auto] items-baseline gap-[clamp(0.9rem,2.5vw,2.5rem)] border-b border-[var(--hair)] py-[clamp(0.85rem,2.2vh,1.4rem)]"
                  >
                    <span className="font-mono text-[0.7rem] tabular-nums text-gold">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-[clamp(1rem,1.5vw,1.35rem)] font-medium transition-colors duration-500 group-hover:text-crimson-lift">
                      {item.title}
                    </span>
                    <span className="u-eyebrow text-faint">{item.tag}</span>
                  </li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
