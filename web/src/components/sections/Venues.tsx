import { venues, days } from "@/data/conference";

/** Schematic locator. Deliberately NOT a map: there is no API key, both
    addresses are null, and a grey iframe would wreck the page's atmosphere.
    This reads as a diagram, which is honest about being one. */
function Locator({ index }: { index: number }) {
  return (
    <svg viewBox="0 0 120 120" className="w-full max-w-[150px]" fill="none" aria-hidden="true">
      <circle cx="60" cy="60" r="46" stroke="rgba(179,18,42,.28)" strokeDasharray="2 6" />
      <circle cx="60" cy="60" r="30" stroke="rgba(179,18,42,.2)" />
      <path d="M60 6v22M60 92v22M6 60h22M92 60h22" stroke="rgba(179,18,42,.35)" />
      <circle cx="60" cy="60" r="4.5" fill="#E0323C" />
      <text x="60" y="118" textAnchor="middle" fill="rgba(140,134,128,.9)"
        style={{ font: "500 7px ui-monospace, monospace", letterSpacing: "1.6px" }}>
        VENUE {index + 1}
      </text>
    </svg>
  );
}

export default function Venues() {
  return (
    <section id="venue" className="border-t border-[var(--hair)] u-shell py-[clamp(4rem,10vh,9rem)]">
      <header className="max-w-3xl">
        <p className="u-eyebrow flex items-center gap-3" data-r>
          <span className="text-gold">04</span> Venue
        </p>
        <h2 className="mt-5 text-[clamp(1.9rem,4.4vw,3.6rem)] font-extrabold leading-[1.02] tracking-[-0.025em]" data-r>
          Two venues across <span className="u-serif">three days</span>
        </h2>
        <p className="mt-5 max-w-xl text-[0.95rem] leading-relaxed text-muted-foreground" data-r>
          The pre-conference workshop is held at NIMS. The scientific programme is
          held at the Dr. MCR HRD Institute auditorium.
        </p>
      </header>

      <div className="mt-[clamp(2.5rem,6vh,4.5rem)] grid gap-[clamp(2rem,4vw,4rem)] lg:grid-cols-2">
        {venues.map((v, i) => (
          <article key={v.id} data-r className="border-t border-[var(--hair-gold)] pt-6">
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="u-eyebrow text-gold-lift">
                  {i === 0 ? days[0].date : days[1].date}
                </p>
                <h3 className="mt-3 text-[clamp(1.35rem,2.6vw,2.2rem)] font-extrabold tracking-[-0.02em]">
                  {v.name}
                </h3>
                <p className="mt-1.5 text-[0.88rem] text-muted-foreground">{v.full}</p>
                <p className="mt-4 max-w-sm text-[0.9rem] leading-relaxed">{v.hosts}</p>
              </div>
              <Locator index={i} />
            </div>

            <p className="mt-6 border-t border-[var(--hair)] pt-4 font-mono text-[0.66rem] uppercase leading-[1.8] tracking-[0.14em] text-crimson-lift">
              Full address and travel guidance to be published
            </p>
          </article>
        ))}
      </div>

      <div className="mt-[clamp(2.5rem,6vh,4.5rem)] border-t border-[var(--hair)] pt-6">
        <p className="u-eyebrow" data-r>The city</p>
        <p className="mt-4 max-w-2xl text-[0.92rem] leading-relaxed text-muted-foreground" data-r>
          Hyderabad, Telangana. Both venues sit within the city, alongside the
          Charminar, Hussain Sagar, the Durgam Cheruvu bridge and T-Hub.
        </p>
        <p className="mt-4 font-mono text-[0.66rem] uppercase tracking-[0.14em] text-faint">
          Accommodation block, shuttle plan and transfer times to be announced
        </p>
      </div>
    </section>
  );
}
