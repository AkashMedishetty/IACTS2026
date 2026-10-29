import type { Metadata } from "next";
import PageShell from "@/components/site/PageShell";
import { conference, creditPoints, secretariat } from "@/data/conference";

export const metadata: Metadata = {
  title: `Thank you — ${conference.name}`,
  description: `${conference.name}, ${conference.dates.label}, ${conference.city} — thank you from the Organising Committee.`,
};

/**
 * Post-conference page (registration closed 29 October 2026). Every
 * "Register" button on the site points here once registration is closed.
 */
export default function ThankYouPage() {
  const thanks = [
    ["Our faculty", "Speakers, chairpersons, moderators and panelists who gave their time and experience."],
    ["Our delegates", "Residents, trainees and surgeons who came to learn, question and take part."],
    ["Our presenters", "Every oral paper and poster presenter, and our quiz participants."],
    ["Our hosts", "Nizam's Institute of Medical Sciences for the workshop day, and the Dr. MCR HRD Institute for the scientific programme."],
    ["IACTS", "The Indian Association of Cardiovascular-Thoracic Surgeons, under whose aegis the CME was held."],
    ["Our partners", "Industry partners, Ideal Events for delegate services, and PurpleHat Events for registration and technology."],
  ];

  return (
    <PageShell
      title="Thank you"
      lede={`${conference.name} · ${conference.dates.label} · ${conference.city}`}
    >
      <section className="u-shell py-[clamp(3rem,8vh,7rem)]">
        <div className="max-w-3xl">
          <p className="text-[clamp(1.1rem,1.6vw,1.35rem)] leading-[1.75] text-[#160a0d]" data-r>
            On behalf of the Organising Committee, thank you for being part of {conference.name}.
          </p>
          <p className="mt-5 text-[clamp(1rem,1.2vw,1.1rem)] leading-[1.8] text-muted-foreground" data-r>
            Across three days — a hands-on workshop at NIMS and two days of scientific sessions at the Dr. MCR HRD
            Institute — you made {conference.theme.replace(/\s*!$/, "")} more than a theme. Thank you for your
            participation, your questions and the conversations that carried on between sessions.
          </p>
        </div>

        <div className="mt-[clamp(2.5rem,6vh,4rem)] grid gap-6 md:grid-cols-2" data-r>
          <div className="border-l-2 border-[#b3122a] bg-white/70 p-6">
            <p className="u-eyebrow text-[#b3122a]">Certificates</p>
            <p className="mt-3 text-[1rem] leading-[1.75] text-[#160a0d]">
              Your certificates are being emailed to your registered email address, together in a single file.
            </p>
          </div>
          <div className="border-l-2 border-[#A9793A] bg-white/70 p-6">
            <p className="u-eyebrow text-[#A9793A]">Credit points</p>
            <p className="mt-3 text-[1rem] leading-[1.75] text-[#160a0d]">
              {creditPoints.abbreviation} credit point certificates are issued by the {creditPoints.authority} after
              the conference, to your registered email address.
            </p>
          </div>
        </div>

        <h2 className="mt-[clamp(3rem,7vh,5rem)] u-heading" data-r>
          With <span className="u-serif">thanks</span>
        </h2>
        <ul className="mt-6 grid list-none gap-x-10 border-t border-[var(--hair)] p-0 md:grid-cols-2">
          {thanks.map(([who, why]) => (
            <li key={who} data-r className="border-b border-[var(--hair)] py-5">
              <p className="text-[1.05rem] font-semibold text-[#160a0d]">{who}</p>
              <p className="mt-1 text-[0.95rem] leading-[1.7] text-muted-foreground">{why}</p>
            </li>
          ))}
        </ul>

        <div className="mt-[clamp(3rem,7vh,5rem)] max-w-3xl" data-r>
          <p className="text-[1.05rem] leading-[1.8] text-[#160a0d]">We look forward to seeing you again.</p>
          <p className="mt-4 font-semibold text-[#160a0d]">Organising Committee</p>
          <p className="text-[0.95rem] text-muted-foreground">{conference.name}</p>
          <p className="mt-6 text-[0.9rem] text-muted-foreground">
            Questions:{" "}
            <a href={`mailto:${secretariat.email}`} className="text-[#b3122a]">{secretariat.email}</a>
          </p>
        </div>
      </section>
    </PageShell>
  );
}
