import { highlights } from "@/data/conference";

/**
 * Scientific highlights, as cards.
 *
 * The previous stratified-band layout depended on full-bleed page width and broke
 * inside the section card, so it is rebuilt as a straightforward grid.
 *
 * The marks are Unicode glyphs, not emoji: emoji render in their own fixed
 * multicolour artwork and cannot be held to the single red the brand uses.
 * These are typographic marks, so they inherit the accent colour exactly.
 */
const MARKS = ["✚", "◈", "◎", "⬡", "✦", "★", "❖", "◉"] as const;

export default function Strata() {
  return (
    <section id="highlights">
      <div>
        <header className="max-w-3xl">
          <p className="u-eyebrow flex items-center gap-3" data-r>
            <span className="text-gold">03</span> Scientific Highlights
          </p>
          <h2
            className="mt-5 text-[clamp(1.7rem,3.6vw,3rem)] font-extrabold leading-[1.05] tracking-[-0.025em]"
            data-r
          >
            Eight scientific <span className="u-serif">highlights</span>
          </h2>
          <p className="mt-4 max-w-xl text-[0.92rem] leading-relaxed text-muted-foreground" data-r>
            The eight areas the programme is built around, as published by the
            organising committee.
          </p>
        </header>

        <ul className="mt-[clamp(1.75rem,4vh,2.75rem)] grid list-none gap-3 p-0 sm:grid-cols-2 xl:grid-cols-4">
          {highlights.map((item, index) => (
            <li
              key={item.title}
              data-r
              className="group flex h-full flex-col border border-[var(--hair)] bg-white/70 p-[clamp(0.9rem,1.4vw,1.35rem)] transition-colors duration-500 hover:border-[var(--hair-crimson)]"
            >
              <div className="flex items-start justify-between gap-3">
                <span
                  aria-hidden="true"
                  className="text-[1.35rem] leading-none text-crimson"
                >
                  {MARKS[index % MARKS.length]}
                </span>
                <span className="font-mono text-[0.6rem] tabular-nums text-faint">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>

              <h3 className="mt-4 text-[clamp(0.98rem,1.5vw,1.2rem)] font-bold leading-tight tracking-[-0.015em] transition-colors duration-500 group-hover:text-crimson-lift">
                {item.title}
              </h3>
              <p className="mt-1.5 font-mono text-[0.58rem] uppercase leading-[1.6] tracking-[0.14em] text-faint">
                {item.sub}
              </p>

              <ul className="mt-3 grid list-none gap-1.5 border-t border-[var(--hair)] p-0 pt-3">
                {item.points.map((point) => (
                  <li key={point} className="text-[0.78rem] leading-snug text-muted-foreground">
                    {point}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
