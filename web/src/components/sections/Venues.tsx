import { venues, days } from "@/data/conference";

function DirectionsIcon() {
  return (
    <svg viewBox="0 0 20 20" className="size-4 shrink-0" fill="none" aria-hidden="true">
      <path d="M10 18s6-5.686 6-10A6 6 0 1 0 4 8c0 4.314 6 10 6 10Z" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="10" cy="8" r="2" stroke="currentColor" strokeWidth="1.5" />
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
        <h2 className="mt-5 u-heading" data-r>
          Two venues in <span className="u-serif">Hyderabad</span>
        </h2>
        <p className="mt-5 max-w-xl text-[1rem] leading-relaxed text-muted-foreground" data-r>
          The pre-conference workshop is held at NIMS. The scientific programme is
          held at the Dr. MCR HRD Institute auditorium.
        </p>
      </header>

      <div className="mt-[clamp(2.5rem,6vh,4.5rem)] grid gap-[clamp(2rem,4vw,4rem)] lg:grid-cols-2">
        {venues.map((v, i) => {
          const mapsSearch = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(v.mapQuery)}`;
          const mapsDir = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(v.mapQuery)}`;
          const embed = `https://maps.google.com/maps?q=${encodeURIComponent(v.mapQuery)}&z=15&output=embed`;
          return (
            <article key={v.id} data-r className="border-t border-[var(--hair-gold)] pt-6">
              {"image" in v && v.image ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={v.image as string}
                  alt={v.full}
                  loading="lazy"
                  className="mb-4 aspect-[16/10] w-full rounded-sm border border-[var(--hair)] object-cover"
                />
              ) : null}
              <iframe
                title={`Map of ${v.full}`}
                src={embed}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="mb-6 aspect-[16/9] w-full rounded-sm border border-[var(--hair)]"
              />
              <p className="u-eyebrow text-gold-lift">
                {i === 0 ? days[0].date : days[1].date}
              </p>
              <h3 className="mt-3 text-[clamp(1.4rem,2.6vw,2.2rem)] font-extrabold tracking-[-0.02em]">
                {v.name}
              </h3>
              <p className="mt-1.5 text-[0.95rem] text-muted-foreground">{v.full}</p>
              <p className="mt-3 max-w-sm text-[0.98rem] font-medium leading-relaxed text-[#160a0d]">
                {v.address}
              </p>
              <p className="mt-1.5 text-[0.9rem] text-muted-foreground">{v.hosts}</p>

              <div className="mt-5 flex flex-wrap gap-3">
                <a
                  href={mapsDir}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center gap-2 bg-[#b3122a] px-5 text-[13px] font-bold uppercase tracking-[.08em] text-white no-underline transition-transform hover:-translate-y-0.5"
                >
                  <DirectionsIcon /> Get directions
                </a>
                <a
                  href={mapsSearch}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center gap-2 border border-[#b3122a]/30 px-5 text-[13px] font-bold uppercase tracking-[.08em] text-[#b3122a] no-underline transition-colors hover:bg-[#f8e9ed]"
                >
                  View on map
                </a>
              </div>
            </article>
          );
        })}
      </div>

      <div className="mt-[clamp(2.5rem,6vh,4.5rem)] grid gap-8 border-t border-[var(--hair)] pt-8 sm:grid-cols-3">
        {[
          ["By air", "Rajiv Gandhi International Airport (HYD) — about 30–40 km, via cab or airport shuttle."],
          ["By rail", "Hyderabad Deccan (Nampally), Secunderabad and Kacheguda are the main railway stations."],
          ["By road", "Well connected by city cabs, autos and metro; both venues are within central Hyderabad."],
        ].map(([mode, detail]) => (
          <div key={mode} data-r>
            <p className="u-eyebrow text-gold-lift">{mode}</p>
            <p className="mt-3 text-[0.95rem] leading-relaxed text-muted-foreground">{detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
