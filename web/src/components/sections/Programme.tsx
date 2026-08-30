import { days } from "@/data/conference";

/**
 * The two days differ in character — day one is hands-on and instrument-led,
 * day two is podium-led — so they are not rendered as matching cards. The
 * stage word holds sticky while its item list scrolls past it.
 *
 * Capacity: the wet-lab tracks are genuinely capacity-limited but we have no
 * numbers, so this states that places are limited without printing a count.
 */
export default function Programme() {
  return (
    <section id="programme" className="u-shell py-[clamp(4rem,10vh,9rem)]">
      <header className="max-w-3xl">
        <p className="u-eyebrow flex items-center gap-3" data-r>
          <span className="text-gold">01</span> The Programme
        </p>
        <h2
          className="mt-5 text-[clamp(1.9rem,4.4vw,3.6rem)] font-extrabold leading-[1.02] tracking-[-0.025em]"
          data-r
        >
          Three days, two venues,
          <span className="u-serif"> one operative sequence</span>
        </h2>
        <p className="mt-5 max-w-xl text-[0.95rem] leading-relaxed text-muted" data-r>
          October 23 is hands-on at NIMS. October 24 and 25 move to the Dr. MCR
          HRD Institute auditorium, where the field states what it currently
          knows and argues about the rest.
        </p>
      </header>

      <div className="mt-[clamp(2.5rem,6vh,5rem)] grid gap-[clamp(2.5rem,6vh,6rem)]">
        {days.map((day, di) => (
          <article key={day.id} className="grid gap-[clamp(1rem,3vw,3.5rem)] lg:grid-cols-[minmax(0,26%)_minmax(0,1fr)]">
            <div className="lg:sticky lg:top-24 lg:self-start">
              <p
                className="text-[clamp(2rem,4.6vw,4rem)] font-extrabold uppercase leading-none tracking-[-0.03em]"
                style={
                  di === 0
                    ? { color: "#C18D21" }
                    : { color: "transparent", WebkitTextStroke: "1px #C18D21" }
                }
                data-r
              >
                {day.stage}
              </p>
              <p className="u-eyebrow mt-4 text-bone" data-r>{day.date}</p>
              <p className="u-eyebrow mt-1.5" data-r>{day.kicker}</p>
              <p className="mt-4 max-w-xs text-[0.82rem] leading-relaxed text-muted" data-r>
                {day.venue}
              </p>
            </div>

            <div>
              <p className="max-w-lg text-[0.95rem] leading-relaxed text-muted" data-r>
                {day.blurb}
              </p>
              <ul className="mt-[clamp(1.5rem,4vh,2.5rem)] list-none border-t border-[var(--hair)] p-0">
                {day.items.map((item, i) => (
                  <li
                    key={item.title}
                    data-r
                    className="group grid grid-cols-[auto_1fr_auto] items-baseline gap-[clamp(0.9rem,2.5vw,2.5rem)] border-b border-[var(--hair)] py-[clamp(0.85rem,2.2vh,1.4rem)]"
                  >
                    <span className="font-mono text-[0.62rem] text-gold">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-[clamp(0.95rem,1.5vw,1.35rem)] font-medium transition-colors duration-500 group-hover:text-crimson-lift">
                      {item.title}
                    </span>
                    <span className="u-eyebrow text-faint">{item.tag}</span>
                  </li>
                ))}
              </ul>
              {di === 0 ? (
                <p className="mt-5 font-mono text-[0.68rem] uppercase tracking-[0.16em] text-crimson-lift">
                  Places limited · allocation opens with registration
                </p>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
