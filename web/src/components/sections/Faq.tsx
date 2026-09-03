import { conference, days, pending, secretariat, venues } from "@/data/conference";

/**
 * FAQ.
 *
 * Two halves, and the split is the point.
 *
 * The answered half is derived from real fields in conference.ts — every answer
 * traces to data, not to plausible-sounding conference boilerplate.
 *
 * The open half is derived from `Object.entries(pending)` at render time. That
 * is deliberate: it CANNOT drift. The moment the committee supplies a fee
 * schedule and `pending.registrationFees` stops being null, that row disappears
 * from the open list by itself — nobody has to remember to edit this file. A
 * hand-written list of unknowns would rot the first time a fact landed.
 */
const LABELS: Record<string, string> = {
  registrationFees: "What does registration cost?",
  delegateCategories: "Which delegate category do I fall into?",
  abstractDeadline: "When is the abstract deadline?",
  abstractRules: "What are the abstract format rules?",
  cmeCreditHours: "How many CME credit hours are awarded?",
  accreditingCouncil: "Which council accredits the credits?",
  sponsorshipTiers: "What do the exhibition packages cost?",
  accommodation: "Is accommodation arranged for delegates?",
  sessionTimetable: "What is the hour-by-hour timetable?",
  phones: "Is there a phone number for the secretariat?",
};

export default function Faq() {
  const answered: [string, React.ReactNode][] = [
    [
      "When and where is it?",
      `${conference.dates.label}, in ${conference.city}. It runs across two venues — ${venues[0].name} and ${venues[1].name}.`,
    ],
    [
      "Which venue on which day?",
      `${venues[0].full} hosts the ${venues[0].hosts.toLowerCase()}. ${venues[1].full} hosts the ${venues[1].hosts.toLowerCase()}.`,
    ],
    ["Who is organising it?", `${conference.organisedBy}, under the ${conference.association}.`],
    [
      "Is there hands-on training?",
      `Yes — day one is a pre-conference workshop with ${days[0].items.length} stations: ${days[0].items
        .map((i) => i.title.toLowerCase())
        .join(", ")}.`,
    ],
    [
      "Can I present my own work?",
      "Yes. Two of the seven scientific formats take submitted work — Paper & Video Presentations, and the Young Surgeons Forum. The submission rules are not published yet.",
    ],
    [
      "Are there awards?",
      "Yes — Best Paper and E-Poster Awards, and the Young Surgeons Forum. Entry criteria and judging panels are not announced yet.",
    ],
    [
      "Is registration open?",
      "Yes. Early Bird rates run until 27 September 2026, Standard until 11 October 2026, and Spot registration is available at the venue. Early Bird registrations include complimentary twin-sharing accommodation.",
    ],
    [
      "What does registration cost?",
      "Residents/Trainees ₹3,000, IACTS Members ₹5,000 and Non-Members ₹7,000 at the Early Bird rate. Standard and Spot rates are higher — the full matrix is in the registration section.",
    ],
    [
      "How do I pay?",
      "By bank transfer (NEFT/IMPS/UPI), quoting the registration ID issued when you register. Payment can also be made at the registration desk. Your place is confirmed once the secretariat verifies the payment.",
    ],
    [
      "How do I reach the organisers?",
      `By email at ${secretariat.email} — ${secretariat.department}, ${secretariat.city}.`,
    ],
  ];

  const open = Object.entries(pending)
    .filter(([, v]) => v === null)
    .map(([k]) => LABELS[k])
    .filter(Boolean);

  return (
    <section id="faq" className="border-t border-[var(--hair)] u-shell py-[clamp(4rem,10vh,9rem)]">
      <header className="max-w-3xl">
        <p className="u-eyebrow flex items-center gap-3" data-r>
          <span className="text-gold">09</span> Questions
        </p>
        <h2
          className="mt-5 text-[clamp(1.9rem,4.4vw,3.6rem)] font-extrabold leading-[1.02] tracking-[-0.025em]"
          data-r
        >
          Frequently asked <span className="u-serif">questions</span>
        </h2>
      </header>

      <div className="mt-[clamp(2.5rem,6vh,4.5rem)] grid gap-[clamp(2rem,4vw,4rem)] lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <div className="border-t border-[var(--hair)]">
          {answered.map(([q, a], i) => (
            <details key={q} data-r className="group border-b border-[var(--hair)]">
              <summary className="flex cursor-pointer list-none items-baseline gap-4 py-4 [&::-webkit-details-marker]:hidden">
                <span className="font-mono text-[0.62rem] tabular-nums text-faint">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="flex-1 text-[0.98rem] font-semibold transition-colors duration-500 group-hover:text-crimson-lift">
                  {q}
                </span>
                <span
                  aria-hidden
                  className="font-mono text-gold transition-transform duration-500 group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="pb-5 pl-[calc(0.62rem+1rem)] pr-8 text-[0.9rem] leading-relaxed text-muted-foreground">
                {a}
              </p>
            </details>
          ))}
        </div>

        <aside>
          <p className="u-eyebrow text-gold-lift" data-r>
            Awaiting the organising committee
          </p>
          <p className="mt-3 text-[0.85rem] leading-relaxed text-faint" data-r>
            {open.length} details are still to be confirmed by the organising committee.
            They are listed here and will be published as soon as they are
            available.
          </p>
          <ul className="mt-5 list-none border-t border-[var(--hair-crimson)] p-0">
            {open.map((q) => (
              <li
                key={q}
                data-r
                className="border-b border-[var(--hair)] py-2.5 text-[0.85rem] text-muted-foreground"
              >
                {q}
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </section>
  );
}
