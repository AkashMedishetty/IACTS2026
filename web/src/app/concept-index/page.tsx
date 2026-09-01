import type { Metadata } from "next";
import {
  conference,
  closingPromises,
  days,
  executiveCommittee,
  highlights,
  leadership,
  patrons,
  pending,
  secretariat,
  venues,
} from "@/data/conference";

/**
 * CONCEPT C — "Theatre Board". A complete standalone website.
 * Imports nothing from src/components. No canvas, no WebGL, no 3D, no motion
 * library, no shared style helpers. Only FACTS come from the data module.
 *
 * Concept: the operating-theatre status board — dark panel, monospace labels,
 * status chips, numbered bays. Authority from precision, not ornament.
 */

export const metadata: Metadata = {
  title: "IACTS Technocollege CME 2026 — Theatre Board concept",
  robots: { index: false, follow: false },
};

const SHELL = "#0d0f12";
const PANEL = "#14171c";
const LINE = "rgba(255,255,255,.12)";
const TEXT = "#eceef1";
const MUTED = "rgba(236,238,241,.6)";
const RED = "#e0242f";


const CSS = `
@keyframes tb-pulse { 0%,100%{opacity:.25;transform:scaleY(.35)} 50%{opacity:1;transform:scaleY(1)} }
@keyframes tb-dot { 0%,100%{opacity:.3} 50%{opacity:1} }
@keyframes tb-sweep { to { transform: translateX(100%); } }
.tb-bar { transform-origin:bottom; animation: tb-pulse 1.6s ease-in-out infinite; }
.tb-dot { animation: tb-dot 1.4s ease-in-out infinite; }
.tb-sweep { position:absolute; inset-block:0; width:35%; background:linear-gradient(90deg,transparent,rgba(224,36,47,.12),transparent); animation: tb-sweep 5.5s linear infinite; }
.tb-scan { background-image: repeating-linear-gradient(180deg, rgba(255,255,255,.035) 0 1px, transparent 1px 4px); }
.tb-bay { position:absolute; inset-inline-end:0; top:-.3em; font-size:clamp(7rem,17vw,15rem); line-height:.7; font-weight:700; color:transparent; -webkit-text-stroke:1px rgba(224,36,47,.16); pointer-events:none; user-select:none; }
@media (prefers-reduced-motion: reduce) { .tb-bar,.tb-dot,.tb-sweep { animation:none } }
`;

const NAV = [
  ["About", "#about"],
  ["Programme", "#programme"],
  ["Highlights", "#highlights"],
  ["Committee", "#committee"],
  ["Abstracts", "#abstracts"],
  ["Venue", "#venue"],
  ["Questions", "#questions"],
] as const;

function Chip({ children }: { children: string }) {
  return (
    <span
      className="inline-block px-2 py-1 font-mono text-[8px] uppercase tracking-[.16em]"
      style={{ border: `1px solid ${RED}`, color: RED }}
    >
      {children}
    </span>
  );
}

function Head({ bay, kicker, title }: { bay: string; kicker: string; title: string }) {
  return (
    <header className="relative mx-auto w-full max-w-[1240px] overflow-hidden px-5">
      <span className="tb-bay" aria-hidden="true">{bay}</span>
      <div className="relative flex items-center gap-4">
        <span
          className="grid size-9 shrink-0 place-items-center font-mono text-[10px] tabular-nums"
          style={{ border: `1px solid ${RED}`, color: RED }}
        >
          {bay}
        </span>
        <span className="font-mono text-[9px] uppercase tracking-[.28em]" style={{ color: MUTED }}>
          {kicker}
        </span>
        <span className="h-px flex-1" style={{ background: LINE }} />
      </div>
      <h2 className="relative mt-5 max-w-[30ch] text-[clamp(1.5rem,3.6vw,2.9rem)] font-semibold leading-[1.1] tracking-[-.02em]">
        {title}
      </h2>
    </header>
  );
}

export default function ConceptTheatre() {
  const submittable = ["Paper & Video Presentations", "Young Surgeons Forum"];
  const open = Object.entries(pending).filter(([, v]) => v === null).map(([k]) => k);

  return (
    <main style={{ background: SHELL, color: TEXT }}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      {/* NAV */}
      <nav
        className="sticky top-0 z-50 flex flex-wrap items-center justify-between gap-3 px-5 py-3"
        style={{ background: "rgba(13,15,18,.94)", borderBottom: `1px solid ${LINE}` }}
      >
        <a href="#top" className="font-mono text-[10px] uppercase tracking-[.22em] no-underline" style={{ color: TEXT }}>
          {conference.acronym} <span style={{ color: RED }}>/ 2026</span>
        </a>
        <div className="hidden items-center gap-5 lg:flex">
          {NAV.map(([label, href]) => (
            <a key={href} href={href} className="font-mono text-[9px] uppercase tracking-[.16em] no-underline" style={{ color: MUTED }}>
              {label}
            </a>
          ))}
        </div>
        <a href="#register" className="min-h-9 px-4 py-2 font-mono text-[9px] uppercase tracking-[.16em] no-underline" style={{ background: RED, color: "#fff" }}>
          Registration · Soon
        </a>
      </nav>

      {/* LIVE VITALS STRIP — the board's signature device */}
      <div
        className="tb-scan relative flex h-11 items-end gap-[3px] overflow-hidden px-5 pb-2"
        style={{ background: PANEL, borderBottom: `1px solid ${LINE}` }}
        aria-hidden="true"
      >
        <span className="tb-sweep" />
        {Array.from({ length: 72 }).map((_, i) => (
          <span
            key={i}
            className="tb-bar block w-[3px] flex-none"
            style={{
              height: `${18 + ((i * 37) % 60)}%`,
              background: i % 9 === 0 ? RED : "rgba(224,36,47,.42)",
              animationDelay: `${(i % 12) * 0.11}s`,
            }}
          />
        ))}
      </div>

      {/* HERO */}
      <section id="top" className="relative flex min-h-[92svh] flex-col justify-center px-5 py-14">
        <span className="tb-scan pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto w-full max-w-[1240px]">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-2 px-2 py-1" style={{ border: `1px solid ${RED}` }}>
            <span className="tb-dot size-1.5 rounded-full" style={{ background: RED }} />
            <span className="font-mono text-[8px] uppercase tracking-[.16em]" style={{ color: RED }}>
              Status · Scheduled
            </span>
          </span>
          <span className="font-mono text-[9px] uppercase tracking-[.22em]" style={{ color: MUTED }}>
            {conference.association}
          </span>
        </div>
        <h1 className="mt-7 text-[clamp(2.3rem,8vw,6.6rem)] font-semibold leading-[.98] tracking-[-.035em]">
          Technocollege CME<br /><span style={{ color: RED }}>2026</span>
        </h1>
        <p className="mt-6 max-w-[46ch] text-[clamp(.95rem,1.6vw,1.25rem)] leading-[1.6]" style={{ color: MUTED }}>
          {conference.positioning} Hands-on surgical training, next-generation
          technology and scientific exchange for cardiovascular and thoracic surgeons.
        </p>
        <div className="mt-10 grid gap-px sm:grid-cols-2 lg:grid-cols-4" style={{ background: LINE }}>
          {[
            ["Dates", conference.dates.label],
            ["City", conference.city],
            ["Convened by", conference.organisedBy],
            ["Theme", conference.theme.replace(" !", ".")],
          ].map(([k, v]) => (
            <div key={k} className="p-4" style={{ background: PANEL }}>
              <p className="font-mono text-[8px] uppercase tracking-[.2em]" style={{ color: RED }}>{k}</p>
              <p className="mt-2 text-[.9rem] leading-snug">{v}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 grid gap-px sm:grid-cols-4" style={{ background: LINE }}>
          {[
            ["03", "Days"],
            [String(days[0].items.length), "Skills tracks"],
            [String(days[1].items.length), "Session formats"],
            [String(venues.length), "Venues"],
          ].map(([n, l]) => (
            <div key={l} className="p-4" style={{ background: PANEL }}>
              <p className="text-[1.9rem] font-semibold leading-none tabular-nums" style={{ color: RED }}>{n}</p>
              <p className="mt-1.5 font-mono text-[8px] uppercase tracking-[.18em]" style={{ color: MUTED }}>{l}</p>
            </div>
          ))}
        </div>
        <div className="mt-9 flex flex-wrap gap-3">
          <a href="#programme" className="min-h-12 px-6 py-3.5 font-mono text-[10px] uppercase tracking-[.16em] no-underline" style={{ background: RED, color: "#fff" }}>
            Scientific programme
          </a>
          <a href="#register" className="min-h-12 px-6 py-3.5 font-mono text-[10px] uppercase tracking-[.16em] no-underline" style={{ border: `1px solid ${LINE}`, color: TEXT }}>
            Delegate registration
          </a>
        </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="py-[clamp(3.5rem,9vh,7rem)]" style={{ borderTop: `1px solid ${LINE}` }}>
        <Head bay="01" kicker="About" title="A three-day Technocollege CME in Hyderabad" />
        <div className="mx-auto mt-8 grid w-full max-w-[1240px] gap-8 px-5 lg:grid-cols-[1.3fr_1fr]">
          <div className="grid gap-4 text-[.92rem] leading-[1.75]" style={{ color: MUTED }}>
            <p>
              Convened by {conference.organisedBy} under the {conference.association},
              pairing hands-on surgical training with a scientific meeting across two
              venues in {conference.city}.
            </p>
            <p>
              October 23 is given to the pre-conference workshop at {venues[0].name},
              with {days[0].items.length} parallel skills tracks. October 24 and 25 move
              to the {venues[1].name} auditorium for {days[1].items.length} session formats.
            </p>
            <p>
              Registration fees, the abstract window and CME accreditation are not yet
              published. Where a figure is unconfirmed this site states so rather than
              estimating it.
            </p>
            <ul className="mt-2 flex list-none flex-wrap gap-x-5 gap-y-1 p-0">
              {conference.pillars.map((pillar) => (
                <li key={pillar} className="font-mono text-[9px] uppercase tracking-[.2em]" style={{ color: RED }}>{pillar}</li>
              ))}
            </ul>
          </div>
          <aside className="grid gap-px self-start" style={{ background: LINE }}>
            {closingPromises.map((promise, i) => (
              <div key={promise} className="flex items-baseline gap-3 p-3.5" style={{ background: PANEL }}>
                <span className="font-mono text-[9px] tabular-nums" style={{ color: RED }}>{String(i + 1).padStart(2, "0")}</span>
                <span className="text-[.88rem]">{promise}</span>
              </div>
            ))}
          </aside>
        </div>
      </section>

      {/* PROGRAMME */}
      <section id="programme" className="py-[clamp(3.5rem,9vh,7rem)]" style={{ borderTop: `1px solid ${LINE}`, background: "#101317" }}>
        <Head bay="02" kicker="Programme" title="Three days, two venues, one scientific programme" />
        <div className="mx-auto mt-8 w-full max-w-[1240px] px-5">
          {days.map((day) => (
            <div key={day.id} className="mb-9">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-[clamp(1.15rem,2.2vw,1.7rem)] font-semibold">{day.kicker}</h3>
                <Chip>{day.date}</Chip>
              </div>
              <p className="mt-2 font-mono text-[9px] uppercase tracking-[.14em]" style={{ color: MUTED }}>{day.venue}</p>
              <p className="mt-3 max-w-[64ch] text-[.9rem] leading-relaxed" style={{ color: MUTED }}>{day.blurb}</p>
              <div className="mt-4 grid gap-px" style={{ background: LINE }}>
                {day.items.map((item, i) => (
                  <div key={item.title} className="flex flex-wrap items-baseline justify-between gap-3 p-3.5" style={{ background: PANEL }}>
                    <span className="flex items-baseline gap-3">
                      <span className="font-mono text-[10px] tabular-nums" style={{ color: RED }}>{String(i + 1).padStart(2, "0")}</span>
                      <span className="text-[.95rem]">{item.title}</span>
                    </span>
                    <span className="font-mono text-[8px] uppercase tracking-[.16em]" style={{ color: MUTED }}>{item.tag}</span>
                  </div>
                ))}
              </div>
              {day.id === "workshop" ? (
                <p className="mt-3 font-mono text-[9px] uppercase tracking-[.16em]" style={{ color: RED }}>
                  Places limited · allocation opens with registration
                </p>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      {/* HIGHLIGHTS */}
      <section id="highlights" className="py-[clamp(3.5rem,9vh,7rem)]" style={{ borderTop: `1px solid ${LINE}` }}>
        <Head bay="03" kicker="Scientific highlights" title="Eight areas the programme is built around" />
        <div className="mx-auto mt-8 grid w-full max-w-[1240px] gap-px px-5 sm:grid-cols-2 lg:grid-cols-4" style={{ background: LINE }}>
          {highlights.map((item, i) => (
            <article key={item.title} className="p-4" style={{ background: PANEL }}>
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-[9px] tabular-nums" style={{ color: RED }}>{String(i + 1).padStart(2, "0")}</span>
                <span className="size-1.5 rotate-45" style={{ background: RED }} />
              </div>
              <h3 className="mt-3 text-[1.05rem] font-semibold leading-tight">{item.title}</h3>
              <p className="mt-1.5 font-mono text-[8px] uppercase leading-[1.6] tracking-[.14em]" style={{ color: MUTED }}>{item.sub}</p>
              <ul className="mt-3 grid list-none gap-1.5 p-0 pt-3" style={{ borderTop: `1px solid ${LINE}` }}>
                {item.points.map((point) => (
                  <li key={point} className="text-[.79rem] leading-snug" style={{ color: MUTED }}>{point}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      {/* COMMITTEE */}
      <section id="committee" className="py-[clamp(3.5rem,9vh,7rem)]" style={{ borderTop: `1px solid ${LINE}`, background: "#101317" }}>
        <Head bay="04" kicker="Organising committee" title="The committee convening the meeting" />
        <div className="mx-auto mt-8 w-full max-w-[1240px] px-5">
          <div className="grid gap-px sm:grid-cols-2" style={{ background: LINE }}>
            {patrons.map((person) => (
              <div key={person.name} className="p-4" style={{ background: PANEL }}>
                <p className="font-mono text-[8px] uppercase tracking-[.18em]" style={{ color: RED }}>{person.role}</p>
                <p className="mt-2 text-[1.2rem] font-semibold">{person.name}</p>
              </div>
            ))}
          </div>
          <div className="mt-px grid gap-px sm:grid-cols-2 lg:grid-cols-3" style={{ background: LINE }}>
            {leadership.map((person) => (
              <div key={person.name} className="p-4" style={{ background: PANEL }}>
                <p className="font-mono text-[8px] uppercase tracking-[.18em]" style={{ color: RED }}>{person.role}</p>
                <p className="mt-1.5 text-[.98rem]">{person.name}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 font-mono text-[9px] uppercase tracking-[.24em]" style={{ color: MUTED }}>Executive committee</p>
          <div className="mt-3 grid gap-px sm:grid-cols-2 lg:grid-cols-3" style={{ background: LINE }}>
            {executiveCommittee.map((name, i) => (
              <div key={name} className="flex items-baseline gap-3 p-3" style={{ background: PANEL }}>
                <span className="font-mono text-[9px] tabular-nums" style={{ color: RED }}>{String(i + 1).padStart(2, "0")}</span>
                <span className="text-[.88rem]">{name}</span>
              </div>
            ))}
          </div>
          <p className="mt-5"><Chip>Invited faculty to be announced</Chip></p>
        </div>
      </section>

      {/* ABSTRACTS */}
      <section id="abstracts" className="py-[clamp(3.5rem,9vh,7rem)]" style={{ borderTop: `1px solid ${LINE}` }}>
        <Head bay="05" kicker="Abstracts" title="Abstract submission" />
        <div className="mx-auto mt-8 grid w-full max-w-[1240px] gap-8 px-5 lg:grid-cols-2">
          <div>
            <p className="max-w-[58ch] text-[.9rem] leading-relaxed" style={{ color: MUTED }}>
              Two of the {days[1].items.length} scientific formats accept submitted work.
              Submission opens together with registration.
            </p>
            <div className="mt-4 grid gap-px" style={{ background: LINE }}>
              {days[1].items.map((item) => {
                const isOpen = submittable.includes(item.title);
                return (
                  <div key={item.title} className="flex flex-wrap items-baseline justify-between gap-2 p-3.5" style={{ background: PANEL }}>
                    <span className="text-[.9rem]" style={{ color: isOpen ? TEXT : MUTED }}>{item.title}</span>
                    <span className="font-mono text-[8px] uppercase tracking-[.14em]" style={{ color: isOpen ? RED : MUTED }}>
                      {isOpen ? "Accepts abstracts" : "Invited"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[.24em]" style={{ color: RED }}>To be published</p>
            <div className="mt-3 grid gap-px" style={{ background: LINE }}>
              {[
                ["Submission window", "Opening and closing dates"],
                ["Format", "Structured-abstract sections and word limit"],
                ["Categories", "Topic categories and subspecialty routing"],
                ["E-poster specification", "Dimensions, file format and upload route"],
                ["Review", "Notification date and presenting-author rules"],
              ].map(([k, v]) => (
                <div key={k} className="p-3.5" style={{ background: PANEL }}>
                  <p className="text-[.9rem]">{k}</p>
                  <p className="mt-0.5 text-[.79rem]" style={{ color: MUTED }}>{v}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* VENUE */}
      <section id="venue" className="py-[clamp(3.5rem,9vh,7rem)]" style={{ borderTop: `1px solid ${LINE}`, background: "#101317" }}>
        <Head bay="06" kicker="Venue" title="Two venues across three days" />
        <div className="mx-auto mt-8 grid w-full max-w-[1240px] gap-px px-5 lg:grid-cols-2" style={{ background: LINE }}>
          {venues.map((venue, i) => (
            <article key={venue.id} className="p-5" style={{ background: PANEL }}>
              <Chip>{i === 0 ? days[0].date : days[1].date}</Chip>
              <h3 className="mt-3 text-[clamp(1.25rem,2.4vw,1.85rem)] font-semibold">{venue.name}</h3>
              <p className="mt-1.5 text-[.88rem]" style={{ color: MUTED }}>{venue.full}</p>
              <p className="mt-3 text-[.9rem]">{venue.hosts}</p>
              <p className="mt-4 pt-3 font-mono text-[9px] uppercase tracking-[.14em]" style={{ borderTop: `1px solid ${LINE}`, color: RED }}>
                Full address and travel guidance to be published
              </p>
            </article>
          ))}
        </div>
        <div className="mx-auto mt-8 w-full max-w-[1240px] px-5">
          <p className="max-w-[62ch] text-[.9rem] leading-relaxed" style={{ color: MUTED }}>
            {conference.city.replace(", India", ", Telangana")}. Both venues sit within
            the city, alongside the Charminar, Hussain Sagar, the Durgam Cheruvu bridge
            and T-Hub.
          </p>
          <p className="mt-3 font-mono text-[9px] uppercase tracking-[.14em]" style={{ color: MUTED }}>
            Accommodation block, shuttle plan and transfer times to be announced
          </p>
        </div>
      </section>

      {/* QUESTIONS */}
      <section id="questions" className="py-[clamp(3.5rem,9vh,7rem)]" style={{ borderTop: `1px solid ${LINE}` }}>
        <Head bay="07" kicker="Questions" title="Frequently asked questions" />
        <div className="mx-auto mt-8 grid w-full max-w-[1240px] gap-px px-5 lg:grid-cols-2" style={{ background: LINE }}>
          {[
            ["When and where is it held?", `${conference.dates.label}, in ${conference.city}, across ${venues.length} venues.`],
            ["Which venue on which day?", `${venues[0].name} hosts the workshop on October 23. ${venues[1].name} hosts the scientific programme on October 24 and 25.`],
            ["Who is organising it?", `${conference.organisedBy}, under the ${conference.association}.`],
            ["Is there hands-on training?", `Yes — ${days[0].items.length} skills stations run on October 23.`],
            ["Can I present my own work?", "Yes. Two of the scientific formats accept submitted work; the rules are not yet published."],
            ["Is registration open?", "Not yet. Registration is opening soon."],
            ["Are CME credits awarded?", "Credit hours and the accrediting council are not yet confirmed."],
            ["How do I reach the organisers?", `By email at ${secretariat.email}.`],
          ].map(([q, a]) => (
            <div key={q} className="p-4" style={{ background: PANEL }}>
              <p className="text-[.95rem] font-semibold">{q}</p>
              <p className="mt-1.5 text-[.85rem] leading-relaxed" style={{ color: MUTED }}>{a}</p>
            </div>
          ))}
        </div>
        <p className="mx-auto mt-6 w-full max-w-[1240px] px-5 font-mono text-[9px] uppercase tracking-[.14em]" style={{ color: RED }}>
          {open.length} further details await confirmation by the organising committee
        </p>
      </section>

      {/* REGISTER */}
      <section id="register" className="py-[clamp(4rem,11vh,9rem)]" style={{ borderTop: `1px solid ${LINE}`, background: RED, color: "#fff" }}>
        <div className="mx-auto w-full max-w-[1240px] px-5">
          <p className="font-mono text-[10px] uppercase tracking-[.3em]" style={{ color: "rgba(255,255,255,.75)" }}>
            {conference.dates.label} · {conference.city}
          </p>
          <h2 className="mt-6 max-w-[24ch] text-[clamp(1.9rem,5.6vw,4.2rem)] font-semibold leading-[1.04] tracking-[-.03em]">
            Delegate registration opens soon.
          </h2>
          <div className="mt-9 grid gap-px sm:grid-cols-2 lg:grid-cols-4" style={{ background: "rgba(255,255,255,.28)" }}>
            {[
              ["Registration fees", "To be announced"],
              ["Delegate categories", "To be announced"],
              ["CME accreditation", "To be announced"],
              ["Accommodation", "To be announced"],
            ].map(([k, v]) => (
              <div key={k} className="p-4" style={{ background: RED }}>
                <p className="text-[.92rem]">{k}</p>
                <p className="mt-1 font-mono text-[8px] uppercase tracking-[.16em]" style={{ color: "rgba(255,255,255,.78)" }}>{v}</p>
              </div>
            ))}
          </div>
          <a
            href={`mailto:${secretariat.email}?subject=IACTS%20Technocollege%20CME%202026`}
            className="mt-9 inline-block px-7 py-4 font-mono text-[10px] uppercase tracking-[.16em] no-underline"
            style={{ background: "#fff", color: RED }}
          >
            Enquire with the secretariat
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-[clamp(2.5rem,6vh,4.5rem)]" style={{ background: SHELL }}>
        <div className="mx-auto w-full max-w-[1240px] px-5">
          <p className="max-w-[30ch] text-[clamp(1.15rem,2.8vw,2rem)] font-semibold leading-[1.16]">
            {conference.closing}
          </p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="font-mono text-[8px] uppercase tracking-[.2em]" style={{ color: RED }}>Dates</p>
              <p className="mt-1.5 text-[.88rem]">{conference.dates.label}</p>
              <p className="text-[.88rem]" style={{ color: MUTED }}>{conference.city}</p>
            </div>
            {venues.map((venue) => (
              <div key={venue.id}>
                <p className="font-mono text-[8px] uppercase tracking-[.2em]" style={{ color: RED }}>{venue.name}</p>
                <p className="mt-1.5 text-[.88rem]" style={{ color: MUTED }}>{venue.hosts}</p>
              </div>
            ))}
            <div>
              <p className="font-mono text-[8px] uppercase tracking-[.2em]" style={{ color: RED }}>Secretariat</p>
              <p className="mt-1.5 text-[.88rem]" style={{ color: MUTED }}>{secretariat.department}</p>
              <a href={`mailto:${secretariat.email}`} className="mt-1 inline-block text-[.88rem] underline decoration-1 underline-offset-4" style={{ color: TEXT }}>
                {secretariat.email}
              </a>
              <p className="mt-1.5 font-mono text-[8px] uppercase tracking-[.14em]" style={{ color: RED }}>Telephone numbers to be announced</p>
            </div>
          </div>
          <div className="mt-9 flex flex-wrap items-baseline justify-between gap-3 pt-4" style={{ borderTop: `1px solid ${LINE}` }}>
            <p className="font-mono text-[.95rem] uppercase tracking-[.3em]" style={{ color: RED }}>{conference.acronym} 2026</p>
            <p className="font-mono text-[9px] uppercase tracking-[.16em]" style={{ color: MUTED }}>
              Organised by {conference.organisedBy}
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
