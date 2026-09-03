import { EVENT_INFO } from "@/lib/constants";
import { conference, secretariat, venues, closingPromises } from "@/data/conference";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-[var(--hair)] bg-ink-2">
      <div className="u-shell pt-[clamp(3.5rem,8vh,7rem)]">
        <h2 className="max-w-4xl text-[clamp(1.6rem,4.4vw,3.4rem)] font-extrabold leading-[1.05] tracking-[-0.03em]" data-r>
          {conference.closing.split(",")[0]},
          <span className="u-serif block">{conference.closing.split(",")[1]?.trim()}</span>
        </h2>

        <ul className="mt-[clamp(2rem,5vh,3.5rem)] grid list-none grid-cols-2 gap-0 border-t border-[var(--hair)] p-0 md:grid-cols-5">
          {closingPromises.map((p) => (
            <li key={p} data-r
              className="border-b border-[var(--hair)] py-4 pr-4 md:border-b-0 md:border-r md:border-r-[var(--hair)] md:pl-4 md:first:pl-0 md:last:border-r-0">
              <span className="u-eyebrow">{p}</span>
            </li>
          ))}
        </ul>

        <div className="mt-[clamp(2.5rem,6vh,4rem)] grid gap-[clamp(1.5rem,3vw,3rem)] sm:grid-cols-2 lg:grid-cols-4">
          <div data-r>
            <p className="u-eyebrow text-gold-lift">Dates</p>
            <p className="mt-2 text-[0.9rem]">{EVENT_INFO.dateLabel}</p>
            <p className="text-[0.9rem] text-muted-foreground">{EVENT_INFO.city}</p>
          </div>
          {venues.map((v) => (
            <div key={v.id} data-r>
              <p className="u-eyebrow text-gold-lift">{v.name}</p>
              <p className="mt-2 text-[0.9rem] text-muted-foreground">{v.hosts}</p>
            </div>
          ))}
          <div data-r>
            <p className="u-eyebrow text-gold-lift">Secretariat</p>
            <p className="mt-2 text-[0.9rem] text-muted-foreground">{secretariat.department}</p>
            <p className="text-[0.9rem] text-muted-foreground">{secretariat.city}</p>
            <a href={`mailto:${secretariat.email}`}
              className="mt-2 inline-block text-[0.9rem] text-bone underline decoration-[var(--hair-gold)] underline-offset-4 transition-colors duration-500 hover:text-gold-lift">
              {secretariat.email}
            </a>
            {secretariat.phones.map((p) => (
              <a
                key={p.number}
                href={`tel:+91${p.number}`}
                className="mt-2 block font-mono text-[0.64rem] uppercase leading-[1.7] tracking-[0.12em] text-[#b3122a] no-underline"
              >
                {p.name} · +91 {p.number}
              </a>
            ))}
          </div>
        </div>

        <p className="mt-[clamp(2rem,5vh,3rem)] u-eyebrow" data-r>
          Organised by {conference.organisedBy}
        </p>
      </div>

      <div className="mt-[clamp(2rem,5vh,4rem)] border-t border-[#b3122a]/20">
        <div className="u-shell flex flex-wrap items-baseline justify-between gap-4 py-6">
          <p className="font-mono text-[clamp(.95rem,1.5vw,1.35rem)] font-medium uppercase tracking-[.34em] text-[#b3122a]">
            IACTS 2026
          </p>
          <p className="font-mono text-[9px] uppercase tracking-[.2em] text-[#7d656c]">
            Technocollege CME · Hyderabad, India
          </p>
        </div>
        <div className="h-1.5 bg-[#b3122a]" />
      </div>
    </footer>
  );
}
