import { highlights } from "@/data/conference";

/**
 * Three award tracks, all real: Best Paper and E-Poster Awards and the Young
 * Surgeons' Forum both appear in the flyer's eight highlights. Their points
 * are the flyer's own words. Entry criteria, prize values and judging panels
 * are NOT published, so they are named as unpublished rather than guessed.
 */
export default function Awards() {
  const tracks = highlights.filter((h) =>
    ["Best Paper & E-Poster Awards", "Young Surgeons' Forum"].includes(h.title),
  );

  return (
    <section
      id="awards"
      className="relative overflow-hidden border-t border-[var(--hair)] bg-ink-2 py-[clamp(4rem,10vh,9rem)]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-[10vw] top-0 size-[36vw] rounded-full opacity-45 blur-[80px]"
        style={{ background: "radial-gradient(circle,rgba(179,18,42,.22) 0%,transparent 70%)" }}
      />

      <div className="relative u-shell">
        <header className="max-w-3xl">
          <p className="u-eyebrow flex items-center gap-3" data-r>
            <span className="text-gold">06</span> Recognition
          </p>
          <h2
            className="mt-5 text-[clamp(1.9rem,4.4vw,3.6rem)] font-extrabold leading-[1.02] tracking-[-0.025em]"
            data-r
          >
            Awards and <span className="u-serif">recognition</span>
          </h2>
        </header>

        <div className="mt-[clamp(2.5rem,6vh,4.5rem)] grid gap-[clamp(1.5rem,3vw,3rem)] lg:grid-cols-2">
          {tracks.map((t, i) => (
            <article key={t.title} data-r className="group border-t border-[var(--hair-gold)] pt-6">
              <div className="flex items-baseline gap-4">
                <span className="font-mono text-[0.66rem] tabular-nums text-gold">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="text-[clamp(1.15rem,2.2vw,1.8rem)] font-extrabold tracking-[-0.02em] transition-colors duration-500 group-hover:text-crimson-lift">
                  {t.title}
                </h3>
              </div>
              <p className="mt-2 u-eyebrow">{t.sub}</p>
              <ul className="mt-5 list-none border-t border-[var(--hair)] p-0">
                {t.points.map((p) => (
                  <li key={p} className="border-b border-[var(--hair)] py-2.5 text-[0.88rem] text-muted">
                    {p}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <div className="mt-[clamp(2rem,5vh,3.5rem)] grid gap-x-[clamp(1.5rem,3vw,3.5rem)] border-t border-[var(--hair)] pt-6 sm:grid-cols-3">
          {[
            ["Entry criteria", "To be published"],
            ["Judging panel", "To be announced"],
            ["Prize categories", "To be announced"],
          ].map(([t, d]) => (
            <div key={t} data-r className="py-2">
              <p className="u-eyebrow">{t}</p>
              <p className="mt-1.5 font-mono text-[0.66rem] uppercase tracking-[0.14em] text-crimson-lift">
                {d}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
