import { capabilities, days, secretariat } from "@/data/conference";

/**
 * Trade exhibition / industry partnership.
 *
 * `pending.sponsorshipTiers` is null — there are no tiers, no prices, no
 * benefit matrix, and no confirmed delegate count (`pending.delegateCategories`
 * is null too). Stating "500+ delegates" or a Platinum/Gold ladder would be
 * fabrication of exactly the kind a sponsor makes a budget decision on.
 *
 * What IS real and genuinely useful to an exhibitor: the six technology
 * domains the scientific programme actually covers, and the five skills
 * stations that run on real equipment. That is a defensible reason to be in the
 * room. The commercial terms are named as unpublished, and the only contact
 * route given is the secretariat email, which is the one real contact in the
 * source (both phone numbers are blank in the flyer).
 */
export default function Sponsors() {
  const stations = days[0].items;

  return (
    <section
      id="sponsors"
      className="relative overflow-hidden border-t border-[var(--hair)] bg-ink-2 py-[clamp(4rem,10vh,9rem)]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -left-[12vw] bottom-0 size-[34vw] rounded-full opacity-40 blur-[90px]"
        style={{ background: "radial-gradient(circle,rgba(104,158,204,.3) 0%,transparent 70%)" }}
      />

      <div className="relative u-shell">
        <header className="max-w-3xl">
          <p className="u-eyebrow flex items-center gap-3" data-r>
            <span className="text-gold">08</span> Industry
          </p>
          <h2
            className="mt-5 text-[clamp(1.9rem,4.4vw,3.6rem)] font-extrabold leading-[1.02] tracking-[-0.025em]"
            data-r
          >
            The technology is <span className="u-serif">the curriculum</span>
          </h2>
          <p className="mt-5 max-w-xl text-[0.95rem] leading-relaxed text-muted" data-r>
            This is not a hall of stalls beside a lecture theatre. Six
            technology domains are taught as content, and five stations run on
            real equipment in delegates&apos; hands.
          </p>
        </header>

        <div className="mt-[clamp(2.5rem,6vh,4.5rem)] grid gap-[clamp(2rem,4vw,4rem)] lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <div>
            <p className="u-eyebrow text-gold-lift" data-r>Domains on the programme</p>
            <ul className="mt-4 grid list-none grid-cols-1 gap-x-8 border-t border-[var(--hair)] p-0 sm:grid-cols-2">
              {capabilities.map((c) => (
                <li
                  key={c.code}
                  data-r
                  className="group border-b border-[var(--hair)] py-3"
                >
                  <div className="flex items-baseline gap-3">
                    <span className="font-mono text-[0.62rem] tabular-nums text-gold">{c.code}</span>
                    <span className="text-[0.9rem] transition-colors duration-500 group-hover:text-venous">
                      {c.title}
                    </span>
                  </div>
                  <p className="mt-0.5 pl-[calc(0.62rem+0.75rem)] font-mono text-[0.58rem] uppercase tracking-[0.14em] text-faint">
                    {c.scope}
                  </p>
                </li>
              ))}
            </ul>

            <p className="mt-8 u-eyebrow text-gold-lift" data-r>Equipment-dependent stations</p>
            <ul className="mt-4 flex list-none flex-wrap gap-2 p-0">
              {stations.map((s) => (
                <li
                  key={s.title}
                  data-r
                  className="border border-[var(--hair)] px-3 py-1.5 text-[0.78rem] text-muted"
                >
                  {s.title} <span className="text-faint">· {s.tag}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="u-eyebrow text-gold-lift" data-r>Commercial terms</p>
            <ul className="mt-4 list-none border-t border-[var(--hair)] p-0">
              {[
                ["Partnership tiers", "Not yet published"],
                ["Exhibition floor plan", "Not yet released"],
                ["Stall dimensions & rates", "Not yet published"],
                ["Delegate profile & numbers", "Not yet confirmed"],
                ["Satellite-symposium slots", "To be announced"],
              ].map(([t, d]) => (
                <li key={t} data-r className="flex items-baseline justify-between gap-4 border-b border-[var(--hair)] py-3">
                  <span className="text-[0.9rem]">{t}</span>
                  <span className="shrink-0 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-crimson-lift">
                    {d}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-6 border border-[var(--hair-gold)] p-[clamp(1.25rem,2.5vw,2rem)]" data-r>
              <p className="u-eyebrow">Register interest</p>
              <p className="mt-2 text-[0.88rem] leading-relaxed text-muted">
                The prospectus is being prepared. Until it is published, the
                organising secretariat is the only route.
              </p>
              <a
                href={`mailto:${secretariat.email}?subject=IACTS%20Technocollege%20CME%202026%20-%20exhibition%20enquiry`}
                className="mt-4 inline-block font-mono text-[0.72rem] tracking-[0.06em] text-gold-lift underline decoration-[var(--hair-gold)] underline-offset-4 transition-colors hover:text-bone"
              >
                {secretariat.email}
              </a>
              <p className="mt-3 font-mono text-[0.58rem] uppercase tracking-[0.14em] text-faint">
                {secretariat.department} · {secretariat.city}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
