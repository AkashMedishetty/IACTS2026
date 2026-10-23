import type { Metadata } from "next";
import PageShell from "@/components/site/PageShell";
import { conference, days, programmeOverview, venues } from "@/data/conference";
import { workshopHalls, workshopLunch } from "@/data/schedule";

export const metadata: Metadata = { title: `Workshops — ${conference.name}` };

/**
 * The pre-conference workshop, from the committee's final sheet (22 October
 * 2026): both halls with their timings and faculty, read from the same data
 * as the programme page so the two cannot disagree. Replaced the earlier
 * "schedule yet to be finalised" page.
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
        <p
          className="border-l-2 border-[#b3122a] bg-white/70 px-5 py-4 text-[clamp(0.98rem,1.15vw,1.08rem)] font-semibold leading-[1.7] text-[#160a0d]"
          data-r
        >
          Venue: NIMS — OP Block, 1st Floor, Learning Centre. Reporting 8:00 AM. Lunch {workshopLunch} for all
          workshop participants. Please bring your surgical loupes.
        </p>

        <p className="mt-7 max-w-2xl text-[clamp(1rem,1.2vw,1.12rem)] leading-[1.8] text-muted-foreground" data-r>
          {dayZero.body}
        </p>

        {workshopHalls.map((hall) => (
          <div key={hall.hall}>
            <h2 className="mt-[clamp(2.5rem,6vh,4rem)] u-heading" data-r>
              {hall.hall} <span className="u-serif">hands-on</span>
            </h2>
            <ul className="mt-6 list-none border-t border-[var(--hair)] p-0">
              {hall.items.map((item, i) => (
                <li
                  key={item.title}
                  data-r
                  className="group grid grid-cols-[auto_1fr] items-baseline gap-x-[clamp(0.9rem,2.5vw,2.5rem)] border-b border-[var(--hair)] py-[clamp(0.9rem,2.4vh,1.5rem)]"
                >
                  <span className="font-mono text-[0.74rem] tabular-nums text-gold">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>
                    <span className="block font-mono text-[0.78rem] uppercase tracking-[0.12em] text-crimson-lift">{item.time}</span>
                    <span className="mt-1 block text-[clamp(1.02rem,1.7vw,1.35rem)] font-medium transition-colors duration-500 group-hover:text-crimson-lift">
                      {item.title}
                    </span>
                    <span className="mt-1 block text-[0.92rem] text-muted-foreground">{item.faculty.join(", ")}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}

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
          <p className="u-eyebrow text-gold-lift">Attendance</p>
          <p className="mt-3 max-w-2xl text-[clamp(1rem,1.15vw,1.08rem)] leading-[1.8] text-muted-foreground">
            Marking attendance at the Registration Counter is mandatory to be eligible for credit points.
            Participation certificates are issued only to those who attend the workshop.
          </p>
        </div>
      </section>
    </PageShell>
  );
}
