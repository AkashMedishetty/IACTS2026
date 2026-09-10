import type { Metadata } from "next";
import PageShell from "@/components/site/PageShell";
import { conference, days, programmeOverview, venues } from "@/data/conference";

export const metadata: Metadata = { title: `Workshops — ${conference.name}` };

/**
 * The four pre-conference tracks and the skills they cover, both supplied by
 * the organising committee. This replaced an "announcing soon" placeholder.
 *
 * Per-track seat counts and any applicable charge are still unpublished, so
 * capacity is stated as limited without printing a number.
 */
export default function Page() {
  const workshop = days[0];
  const { dayZero } = programmeOverview;

  return (
    <PageShell
      title="Pre-Conference Workshops"
      lede={`${workshop.date} · ${venues[0].full}, Hyderabad. Hands-on sessions for postgraduate trainees and young surgeons.`}
    >
      <section className="u-shell py-[clamp(3rem,8vh,7rem)]">
        {/* Requested on the 10 September 2026 review: "you'll write the schedule
            yet to be finalised … just give the information that is actually
            important." Stated up front rather than buried, so a delegate reading
            the tracks knows the timings are not fixed yet. */}
        <p
          className="border-l-2 border-[#b3122a] bg-white/70 px-5 py-4 text-[clamp(0.98rem,1.15vw,1.08rem)] font-semibold leading-[1.7] text-[#160a0d]"
          data-r
        >
          Workshop schedule yet to be finalised. The tracks and skills below are confirmed; timings and faculty will be
          published here once the committee confirms them.
        </p>

        <p className="mt-7 max-w-2xl text-[clamp(1rem,1.2vw,1.12rem)] leading-[1.8] text-muted-foreground" data-r>
          {dayZero.body}
        </p>

        <h2
          className="mt-[clamp(2.5rem,6vh,4rem)] text-[clamp(1.5rem,3.4vw,2.6rem)] font-extrabold leading-[1.05] tracking-[-0.025em]"
          data-r
        >
          The tracks
        </h2>
        <ul className="mt-6 list-none border-t border-[var(--hair)] p-0">
          {workshop.items.map((item, i) => (
            <li
              key={item.title}
              data-r
              className="group grid grid-cols-[auto_1fr_auto] items-baseline gap-x-[clamp(0.9rem,2.5vw,2.5rem)] border-b border-[var(--hair)] py-[clamp(0.9rem,2.4vh,1.5rem)]"
            >
              <span className="font-mono text-[0.74rem] tabular-nums text-gold">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-[clamp(1.02rem,1.7vw,1.35rem)] font-medium transition-colors duration-500 group-hover:text-crimson-lift">
                {item.title}
              </span>
              <span className="u-eyebrow text-faint">{item.tag}</span>
            </li>
          ))}
        </ul>

        <h2
          className="mt-[clamp(2.5rem,6vh,4rem)] text-[clamp(1.5rem,3.4vw,2.6rem)] font-extrabold leading-[1.05] tracking-[-0.025em]"
          data-r
        >
          Skills covered
        </h2>
        <ul className="mt-6 grid list-none gap-x-8 border-t border-[var(--hair)] p-0 sm:grid-cols-2">
          {dayZero.skills.map((skill, i) => (
            <li
              key={skill}
              data-r
              className="flex items-baseline gap-3 border-b border-[var(--hair)] py-3"
            >
              <span className="font-mono text-[0.7rem] tabular-nums text-gold">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-[1rem]">{skill}</span>
            </li>
          ))}
        </ul>

        <div
          data-r
          className="mt-[clamp(2.5rem,6vh,4rem)] border-l-2 border-crimson bg-ink-2 p-[clamp(1.25rem,2.5vw,2.25rem)]"
        >
          <p className="u-eyebrow text-gold-lift">Seats</p>
          <p className="mt-3 max-w-2xl text-[clamp(1rem,1.15vw,1.08rem)] leading-[1.8] text-muted-foreground">
            Workshop places are limited and allocated with registration. Select
            your workshop preference in the registration form; we will write to
            you to confirm your place.
          </p>
          <p className="mt-3 font-mono text-[0.74rem] uppercase tracking-[0.16em] text-crimson-lift">
            Per-track seat counts to be announced
          </p>
        </div>
      </section>
    </PageShell>
  );
}
