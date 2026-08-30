import { highlights } from "@/data/conference";

/**
 * CONCEPT 2's below-fold signature: the eight highlights as stacked strata,
 * echoing the fibre layers of the myocardial band in the hero. Each band
 * carries its three points, so real content density is handled rather than
 * truncated to a card.
 */
export default function Strata() {
  return (
    <section id="highlights" className="border-t border-[var(--hair)] py-[clamp(4rem,10vh,9rem)]">
      <div className="u-shell">
        <header className="max-w-3xl">
          <p className="u-eyebrow flex items-center gap-3" data-r>
            <span className="text-gold">02</span> Scientific Highlights
          </p>
          <h2
            className="mt-5 text-[clamp(1.9rem,4.4vw,3.6rem)] font-extrabold leading-[1.02] tracking-[-0.025em]"
            data-r
          >
            Eight strata, <span className="u-serif">one continuous band</span>
          </h2>
        </header>
      </div>

      <div className="mt-[clamp(2rem,5vh,3.5rem)]">
        {highlights.map((h, i) => {
          const depth = i / (highlights.length - 1); // 0 outer → 1 inner
          return (
            <article
              key={h.title}
              data-r
              className="group border-t border-[var(--hair)] transition-colors duration-500 hover:bg-white/[0.02]"
              style={{
                // each stratum sits slightly deeper, like fibre layers
                paddingLeft: `calc(var(--gutter) + ${(depth * 5).toFixed(1)}vw)`,
                paddingRight: "var(--gutter)",
              }}
            >
              <div className="grid items-baseline gap-x-[clamp(1rem,2.5vw,2.5rem)] gap-y-2 py-[clamp(1.1rem,2.6vh,1.9rem)] lg:grid-cols-[auto_minmax(0,22%)_minmax(0,1fr)]">
                <span className="font-mono text-[0.66rem] tabular-nums text-gold">
                  {String(i + 1).padStart(2, "0")}
                </span>

                <h3 className="text-[clamp(1.05rem,1.9vw,1.55rem)] font-bold leading-tight tracking-[-0.015em] transition-colors duration-500 group-hover:text-crimson-lift">
                  {h.title}
                </h3>

                <div>
                  <p className="u-eyebrow">{h.sub}</p>
                  <ul className="mt-2.5 grid list-none gap-1.5 p-0 sm:grid-cols-3">
                    {h.points.map((p) => (
                      <li key={p} className="text-[0.82rem] leading-snug text-muted">
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <span
                aria-hidden
                className="block h-px w-0 bg-gold/60 transition-all duration-700 ease-[var(--ease-out-expo)] group-hover:w-full"
              />
            </article>
          );
        })}
      </div>
    </section>
  );
}
