import { about, conference, programmeOverview, venues } from "@/data/conference";

/**
 * About.
 *
 * Rebuilt against the client's own documents (9 September 2026 committee
 * review): the Organising Secretary's message supplies who this CME is FOR and
 * why it exists, and the programme note supplies the shape of the three days.
 * The previous version said only "a three-day cardiothoracic surgery CME in
 * Hyderabad" — true, but it answered none of the questions a postgraduate
 * deciding whether to attend actually has.
 *
 * Every sentence rendered here comes from `about` / `programmeOverview` in
 * conference.ts, which are transcribed from the PDFs. Nothing is paraphrased
 * into a claim the committee did not make.
 */
export default function About() {
  const { dayZero, scientific, domains } = programmeOverview;

  const structure = [
    ["01", dayZero.label, dayZero.heading, venues[0].name, "23 October"],
    ["02", scientific.label, "Scientific Programme", venues[1].name, "24 & 25 October"],
  ] as const;

  return (
    <section
      id="about"
      className="relative overflow-hidden border-t border-[var(--hair)] u-shell py-[clamp(4rem,10vh,9rem)]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -left-[14vw] top-[10%] size-[32vw] rounded-full opacity-35 blur-[100px]"
        style={{ background: "radial-gradient(circle,rgba(179,18,28,.4) 0%,transparent 70%)" }}
      />

      <div className="relative mx-auto max-w-3xl">
        <p className="u-eyebrow flex items-center gap-3" data-r>
          <span className="text-gold">01</span> About the CME
        </p>
        <h2
          className="mt-5 text-[clamp(2rem,5vw,3.6rem)] font-extrabold leading-[1] tracking-[-0.03em]"
          data-r
        >
          <span className="u-word">{about.heading}</span>
        </h2>

        <p className="mt-6 max-w-2xl text-[1.05rem] leading-relaxed text-muted-foreground" data-r>
          {about.lede}
        </p>
        <p className="mt-4 max-w-2xl text-[0.98rem] leading-relaxed text-muted-foreground" data-r>
          {about.body}
        </p>

        {/* The Secretary's five verbs — the stated purpose of the platform. */}
        <ul className="mt-8 flex list-none flex-wrap gap-x-2 gap-y-2 p-0" data-r>
          {about.verbs.map((verb) => (
            <li
              key={verb}
              className="border border-[var(--hair-gold)] px-3.5 py-2 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-crimson-lift"
            >
              {verb}
            </li>
          ))}
        </ul>

        <p className="mt-8 max-w-2xl border-l-2 border-[#b3122a] pl-5 text-[1rem] leading-relaxed text-[#3d2b30]" data-r>
          {about.closing}
        </p>

        <p className="mt-8 font-mono text-[0.66rem] uppercase leading-[1.9] tracking-[0.14em] text-[#7d656c]" data-r>
          Convened by {conference.organisedBy} · Under the aegis of the {conference.association}
        </p>

        {/* How the three days are laid out. */}
        <div className="mt-10 border-t border-[var(--hair)]">
          {structure.map(([n, when, what, where, dateLabel]) => (
            <div
              key={n}
              data-r
              className="grid grid-cols-[auto_1fr] items-baseline gap-x-4 border-b border-[var(--hair)] py-4 sm:grid-cols-[auto_1fr_auto_auto] sm:gap-x-6"
            >
              <span className="font-mono text-[0.62rem] tabular-nums text-faint">{n}</span>
              <span className="text-[1rem] font-semibold">
                {when}
                <span className="ml-2 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-crimson-lift">
                  {dateLabel}
                </span>
              </span>
              <span className="col-start-2 text-[0.92rem] text-muted-foreground sm:col-start-auto">
                {what}
              </span>
              <span className="col-start-2 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-gold sm:col-start-auto">
                {where}
              </span>
            </div>
          ))}
        </div>

        {/* The four scientific domains, named. */}
        <div className="mt-10" data-r>
          <p className="u-eyebrow text-gold-lift">Four scientific domains</p>
          <ul className="mt-3 grid list-none gap-x-8 p-0 sm:grid-cols-2">
            {domains.map((domain) => (
              <li
                key={domain.code}
                className="flex items-baseline gap-3 border-b border-[var(--hair)] py-3"
              >
                <span className="font-mono text-[0.62rem] tabular-nums text-gold">
                  {domain.code}
                </span>
                <span className="text-[0.92rem]">{domain.title}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
