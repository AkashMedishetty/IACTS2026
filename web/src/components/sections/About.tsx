import { about, conference, venues } from "@/data/conference";

/**
 * About the CME — rebuilt to the 10 September 2026 committee review.
 *
 * What that review changed, and why it looks like this:
 *  - ONE heading only. "About the CME" is the heading and it is BIGGER; the
 *    former display headline ("Built for the surgeons who will practise the
 *    next decade") is now a SMALL lead-in that opens the first paragraph and is
 *    joined to the message by an em dash — "it has to be part of the paragraph
 *    … this has to be smaller".
 *  - The body is About_the_techno_programme_.pdf VERBATIM and in full: "we just
 *    want exactly what is written coming here."
 *  - CENTRED means the COLUMN is centred — equal margin left and right — with
 *    the text ranged left inside it. It was middle-aligned (text-align:center)
 *    and that was corrected: "it stays all side equal on the left and right,
 *    not middle align."
 *  - The Day-Zero / four-scientific-domains breakdown that used to sit here was
 *    REMOVED: "all this day zero four scientific domains everything, all this is
 *    not needed. Just the about CME part." It lives on /programme instead.
 */
export default function About() {
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
        <h2
          className="u-heading"
          data-r
        >
          <span className="u-word">About the CME</span>
        </h2>

        <p
          className="mt-8 text-[clamp(1rem,1.25vw,1.15rem)] leading-[1.8] text-muted-foreground"
          data-r
        >
          <span className="font-semibold text-[#160a0d]">{about.heading.replace(/\.$/, "")}</span>
          {" — "}
          {about.lede}
        </p>

        {about.programmeNote.map((para) => (
          <p
            key={para.slice(0, 40)}
            data-r
            className="mt-5 text-[clamp(1rem,1.25vw,1.15rem)] leading-[1.8] text-muted-foreground"
          >
            {para}
          </p>
        ))}

        <p
          className="mt-8 border-t border-[var(--hair)] pt-7 text-[clamp(1.02rem,1.3vw,1.2rem)] font-medium leading-[1.75] text-[#3d2b30]"
          data-r
        >
          {about.closing}
        </p>

        <p
          className="mt-8 font-mono text-[0.7rem] uppercase leading-[1.9] tracking-[0.14em] text-faint"
          data-r
        >
          Convened by {conference.organisedBy} · Under the aegis of the {conference.association}
        </p>

        {/* DATES · CITY · VENUES.
            Removing the old Day-Zero/domains breakdown on the 10 September
            review also removed the only place the About section stated WHERE and
            WHEN — a delegate could read the whole thing and not learn the city.
            This restores those facts as a compact key-value band (the site's own
            hairline + mono-label idiom), not as the programme breakdown the
            committee asked to be taken out. */}
        <div className="mt-11 border-t border-[var(--hair)] pt-9" data-r>
          <div className="grid gap-x-[clamp(1.5rem,3vw,3rem)] gap-y-7 sm:grid-cols-3">
            <div>
              <p className="u-eyebrow text-gold-lift">Dates</p>
              <p className="mt-2.5 text-[clamp(1.05rem,1.7vw,1.35rem)] font-bold tracking-[-0.015em] text-[#160a0d]">
                {conference.dates.label}
              </p>
            </div>
            <div>
              <p className="u-eyebrow text-gold-lift">City</p>
              <p className="mt-2.5 text-[clamp(1.05rem,1.7vw,1.35rem)] font-bold tracking-[-0.015em] text-[#160a0d]">
                {conference.city}
              </p>
            </div>
            <div>
              <p className="u-eyebrow text-gold-lift">Theme</p>
              <p className="mt-2.5 text-[clamp(1.05rem,1.7vw,1.35rem)] font-bold tracking-[-0.015em] text-[#b3122a]">
                {conference.theme}
              </p>
            </div>
          </div>

          <div className="mt-9 grid gap-x-[clamp(1.5rem,3vw,3rem)] gap-y-7 sm:grid-cols-2">
            {venues.map((v, i) => (
              <div key={v.id} className="border-t-2 border-[#b3122a] pt-4">
                <p className="u-eyebrow text-gold-lift">
                  {i === 0 ? "23 October · Pre-Conference Workshop" : "24 & 25 October · Scientific Programme"}
                </p>
                <p className="mt-2.5 text-[clamp(1.05rem,1.7vw,1.35rem)] font-bold tracking-[-0.015em] text-[#160a0d]">
                  {v.name}
                </p>
                <p className="mt-1.5 text-[0.95rem] leading-snug text-muted-foreground">{v.full}</p>
                <p className="mt-1.5 text-[0.92rem] leading-snug text-muted-foreground">{v.address}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
