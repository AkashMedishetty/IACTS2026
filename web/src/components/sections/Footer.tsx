import { EVENT_INFO } from "@/lib/constants";
import { conference, secretariat, venues, closingPromises } from "@/data/conference";

/** Single-stroke Hyderabad skyline: Durgam Cheruvu cable-stayed bridge,
    Charminar, the Buddha statue at Hussain Sagar, T-Hub. Drawn with
    stroke-dasharray so it can draw itself in. */
function Skyline() {
  return (
    <svg viewBox="0 0 900 120" className="w-full" fill="none" aria-hidden="true"
      stroke="rgba(193,141,33,.34)" strokeWidth="1.1">
      {/* cable-stayed bridge */}
      <path d="M20 108h150M84 108V34M84 40 26 104M84 40l58 64M84 52 44 104M84 52l40 52" />
      {/* Charminar */}
      <path d="M250 108V60h96v48M250 74h96M262 60V38m0 0a6 6 0 1 1 12 0v22M322 60V38m0 0a6 6 0 1 1 12 0v22M286 108V84h24v24" />
      {/* Buddha statue on its plinth */}
      <path d="M430 108h72M448 108V90h36v18M466 90V56m0 0c-9 0-14 8-14 16h28c0-8-5-16-14-16Zm0 0V44a7 7 0 1 1 0 0Z" />
      {/* T-Hub */}
      <path d="M580 108V52l70-14v70zM580 70h70M580 88h70M665 108V64l52-10v54z" />
      {/* Kakatiya Kala Thoranam */}
      <path d="M780 108V56h14v52M846 108V56h14v52M794 62c14-16 38-16 52 0" />
    </svg>
  );
}

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
            <p className="text-[0.9rem] text-muted">{EVENT_INFO.city}</p>
          </div>
          {venues.map((v) => (
            <div key={v.id} data-r>
              <p className="u-eyebrow text-gold-lift">{v.name}</p>
              <p className="mt-2 text-[0.9rem] text-muted">{v.hosts}</p>
            </div>
          ))}
          <div data-r>
            <p className="u-eyebrow text-gold-lift">Secretariat</p>
            <p className="mt-2 text-[0.9rem] text-muted">{secretariat.department}</p>
            <p className="text-[0.9rem] text-muted">{secretariat.city}</p>
            <a href={`mailto:${secretariat.email}`}
              className="mt-2 inline-block text-[0.9rem] text-bone underline decoration-[var(--hair-gold)] underline-offset-4 transition-colors duration-500 hover:text-gold-lift">
              {secretariat.email}
            </a>
            {secretariat.phones.length === 0 ? (
              <p className="mt-2 font-mono text-[0.64rem] uppercase tracking-[0.14em] text-crimson-lift">
                Telephone numbers to be announced
              </p>
            ) : null}
          </div>
        </div>

        <p className="mt-[clamp(2rem,5vh,3rem)] u-eyebrow" data-r>
          Organised by {conference.organisedBy}
        </p>
      </div>

      <div className="mt-[clamp(1.5rem,4vh,3rem)] opacity-70">
        <Skyline />
      </div>
    </footer>
  );
}
