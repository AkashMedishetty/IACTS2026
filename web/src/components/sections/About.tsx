import { about, conference } from "@/data/conference";

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
 *  - CENTRED, not left-aligned, on the review's explicit instruction.
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

      <div className="relative mx-auto max-w-3xl text-center">
        <h2
          className="text-[clamp(2.4rem,6vw,4.6rem)] font-extrabold leading-[1.02] tracking-[-0.03em]"
          data-r
        >
          <span className="u-word">About the CME</span>
        </h2>

        <p
          className="mx-auto mt-8 max-w-2xl text-[clamp(1rem,1.25vw,1.15rem)] leading-[1.8] text-muted-foreground"
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
            className="mx-auto mt-5 max-w-2xl text-[clamp(1rem,1.25vw,1.15rem)] leading-[1.8] text-muted-foreground"
          >
            {para}
          </p>
        ))}

        <p
          className="mx-auto mt-8 max-w-2xl border-t border-[var(--hair)] pt-7 text-[clamp(1.02rem,1.3vw,1.2rem)] font-medium leading-[1.75] text-[#3d2b30]"
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
      </div>
    </section>
  );
}
