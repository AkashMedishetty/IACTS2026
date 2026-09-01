import type { Metadata } from "next";
import Image from "next/image";
import { Archivo, Fraunces } from "next/font/google";
import {
  closingPromises,
  conference,
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
 * CONCEPT — "The Plate"
 *
 * Device: an engraved anatomical atlas plate. The cardiothoracic drawing is the
 * subject of the page, hand-authored in SVG (no 3D, no WebGL, no bitmap), and
 * the conference sections are its numbered callouts — the plate IS the index.
 *
 * Self-contained: its own type system, its own drawing, no src/components
 * imports, no motion library. Only FACTS come from the data module.
 */

const display = Fraunces({ subsets: ["latin"], style: ["normal", "italic"], variable: "--pl-d", display: "swap" });
const label = Archivo({ subsets: ["latin"], variable: "--pl-l", display: "swap" });

export const metadata: Metadata = {
  title: "IACTS Technocollege CME 2026 — The Plate",
  robots: { index: false, follow: false },
};

const CSS = `
.pl{--paper:#efeae0;--ink:#1b1a18;--red:#9c1420;--hair:rgba(27,26,24,.18);
  background:var(--paper);color:var(--ink);font-family:var(--pl-l),system-ui,sans-serif;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)' opacity='.05'/%3E%3C/svg%3E");}
.pl-d{font-family:var(--pl-d),Georgia,serif;font-weight:400;letter-spacing:-.03em}
.pl-l{text-transform:uppercase;letter-spacing:.2em;font-weight:600}
.pl-fig path,.pl-fig line,.pl-fig circle,.pl-fig ellipse{vector-effect:non-scaling-stroke}
.pl-draw{stroke-dasharray:1400;stroke-dashoffset:1400;animation:pl-draw 2.6s cubic-bezier(.16,1,.3,1) forwards}
.pl-draw-2{animation-delay:.35s}
.pl-draw-3{animation-delay:.65s}
.pl-hatch{opacity:0;animation:pl-fade 1.4s ease .9s forwards}
.pl-call{opacity:0;animation:pl-fade .7s ease forwards}
@keyframes pl-draw{to{stroke-dashoffset:0}}
@keyframes pl-fade{to{opacity:1}}
.pl-sec{scroll-margin-top:72px}
.pl-ix{position:relative;padding-left:3.4rem}
.pl-ix::before{content:attr(data-n);position:absolute;left:0;top:-.28em;font-family:var(--pl-d),Georgia,serif;font-size:2.6rem;line-height:1;color:var(--red);letter-spacing:-.04em}
@media (prefers-reduced-motion:reduce){.pl-plate-img,.pl-call{animation:none;opacity:1;transform:none}}
`;

const CALLOUTS = [
  ["01", "Programme", "#programme", "Three days · two seats"],
  ["02", "Workshop", "#programme", `${days[0].items.length} skills tracks`],
  ["03", "Highlights", "#highlights", `${highlights.length} areas of record`],
  ["04", "Committee", "#committee", `${leadership.length} officers`],
  ["05", "Abstracts", "#abstracts", "2 formats accept work"],
  ["06", "Venues", "#venue", `${venues.length} seats in Hyderabad`],
] as const;

function Head({ n, kicker, title }: { n: string; kicker: string; title: React.ReactNode }) {
  return (
    <header className="pl-ix" data-n={n}>
      <p className="pl-l text-[9px]" style={{ color: "var(--red)" }}>{kicker}</p>
      <h2 className="pl-d mt-3 max-w-[26ch] text-[clamp(1.8rem,4.6vw,3.8rem)] leading-[1.02]">{title}</h2>
    </header>
  );
}

export default function ConceptPlate() {
  const submittable = ["Paper & Video Presentations", "Young Surgeons Forum"];
  const openCount = Object.values(pending).filter((v) => v === null).length;

  return (
    <main className={`pl ${display.variable} ${label.variable}`}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <nav className="sticky top-0 z-50 border-b" style={{ background: "#efeae0", borderColor: "var(--hair)" }}>
        <div className="mx-auto flex w-full max-w-[1340px] flex-wrap items-center justify-between gap-3 px-5 py-3">
          <a href="#top" className="pl-l text-[10px] no-underline" style={{ color: "var(--ink)" }}>
            {conference.acronym} <span style={{ color: "var(--red)" }}>2026</span>
          </a>
          <div className="hidden items-center gap-6 lg:flex">
            {[["About", "#about"], ...CALLOUTS.slice(0, 1).map((c) => [c[1], c[2]]), ["Highlights", "#highlights"], ["Committee", "#committee"], ["Abstracts", "#abstracts"], ["Venue", "#venue"], ["Questions", "#questions"]].map(([text, href]) => (
              <a key={href as string} href={href as string} className="pl-l text-[9px] no-underline opacity-65" style={{ color: "var(--ink)" }}>
                {text as string}
              </a>
            ))}
          </div>
          <a href="#register" className="pl-l px-4 py-2 text-[9px] no-underline" style={{ background: "var(--red)", color: "#efeae0" }}>
            Registration · Soon
          </a>
        </div>
      </nav>

      {/* PLATE — the subject of the page */}
      <section id="top" className="mx-auto w-full max-w-[1340px] px-5 py-[clamp(2rem,5vh,4rem)]">
        <div className="grid items-center gap-8 lg:grid-cols-[1.05fr_.95fr]">
          <div>
            <p className="pl-l text-[9px]" style={{ color: "var(--red)" }}>
              {conference.association}
            </p>
            <h1 className="pl-d mt-6 text-[clamp(3rem,10vw,8.2rem)] leading-[.86]">
              Techno<span style={{ color: "var(--red)" }}>college</span>
              <span className="block italic">CME 2026</span>
            </h1>
            <p className="pl-d mt-7 max-w-[28ch] text-[clamp(1.15rem,2.4vw,1.95rem)] italic leading-[1.22]">
              {conference.positioning}
            </p>
            <div className="mt-9 grid gap-y-5 sm:grid-cols-3">
              {[
                ["Sittings", "23 — 25 Oct", "2026"],
                ["Seat", "Hyderabad", "Telangana"],
                ["Register", "Opening soon", "Fees to be announced"],
              ].map(([k, big, small]) => (
                <div key={k} className="border-t pt-3" style={{ borderColor: "var(--ink)" }}>
                  <p className="pl-l text-[8px]" style={{ color: "var(--red)" }}>{k}</p>
                  <p className="pl-d mt-2 text-[clamp(1.1rem,2.2vw,1.6rem)] leading-none">{big}</p>
                  <p className="pl-l mt-1.5 text-[8px] opacity-55">{small}</p>
                </div>
              ))}
            </div>
            <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-3">
              <a href="#programme" className="pl-l border-b-2 pb-1 text-[10px] no-underline" style={{ borderColor: "var(--red)", color: "var(--ink)" }}>
                Read the programme
              </a>
              <a href="#register" className="pl-l pb-1 text-[10px] no-underline opacity-65" style={{ color: "var(--ink)" }}>
                Delegate registration
              </a>
            </div>
          </div>

          <figure className="pl-plate relative m-0">
            <Image
              src="/concept/cardiothoracic-plate.jpg"
              alt="Cardiothoracic anatomy rendered from the conference's source anatomical model"
              width={1120}
              height={1400}
              priority
              sizes="(min-width:1024px) 46vw, 92vw"
              className="pl-plate-img h-auto w-full"
            />
            <span aria-hidden="true" className="pl-frame" />
            <figcaption className="pl-l absolute bottom-0 left-0 text-[8px] opacity-45">
              Plate 01 — cardiothoracic field
            </figcaption>
          </figure>
        </div>

        {/* the plate's callouts double as the index */}
        <ol className="mt-6 grid list-none gap-px p-0 sm:grid-cols-2 lg:grid-cols-3" style={{ background: "var(--hair)" }}>
          {CALLOUTS.map(([n, name, href, note], i) => (
            <li key={n} className="pl-call" style={{ animationDelay: `${1.1 + i * 0.09}s`, background: "#efeae0" }}>
              <a href={href} className="flex items-baseline gap-4 p-4 no-underline" style={{ color: "var(--ink)" }}>
                <span className="pl-d text-[1.5rem] leading-none" style={{ color: "var(--red)" }}>{n}</span>
                <span>
                  <span className="pl-d block text-[1.1rem] leading-none">{name}</span>
                  <span className="pl-l mt-1.5 block text-[8px] opacity-55">{note}</span>
                </span>
              </a>
            </li>
          ))}
        </ol>
      </section>

      <div className="mx-auto w-full max-w-[1340px] px-5">
        <div style={{ height: 3, background: "var(--ink)", opacity: .8 }} />
      </div>

      {/* ABOUT */}
      <section id="about" className="pl-sec mx-auto w-full max-w-[1340px] px-5 py-[clamp(3.5rem,9vh,7rem)]">
        <Head n="01" kicker="The meeting" title={<>A three-day record of <span className="italic" style={{ color: "var(--red)" }}>a field in motion</span></>} />
        <div className="mt-9 grid gap-10 lg:grid-cols-[1.5fr_1fr]">
          <div className="columns-1 gap-8 text-[1.02rem] leading-[1.72] sm:columns-2 [&>p]:mb-4" style={{ fontFamily: "var(--pl-d),Georgia,serif" }}>
            <p>
              Convened by {conference.organisedBy} under the {conference.association},
              pairing hands-on surgical training with a scientific meeting across two
              seats in {conference.city}.
            </p>
            <p>
              23 October is given to the pre-conference workshop at {venues[0].name},
              with {days[0].items.length} parallel skills tracks. 24 and 25 October move
              to the {venues[1].name} auditorium for {days[1].items.length} session formats.
            </p>
            <p>
              Fees, the abstract window and CME accreditation are not yet published.
              Where a figure is unconfirmed this page states so rather than estimating it.
            </p>
          </div>
          <aside>
            <p className="pl-l text-[9px]" style={{ color: "var(--red)" }}>What you leave with</p>
            <ol className="mt-4 list-none p-0">
              {closingPromises.map((promise, i) => (
                <li key={promise} className="flex items-baseline gap-4 border-b py-3" style={{ borderColor: "var(--hair)" }}>
                  <span className="pl-d text-[1.1rem]" style={{ color: "var(--red)" }}>{i + 1}</span>
                  <span className="pl-d text-[1rem]">{promise}</span>
                </li>
              ))}
            </ol>
            <p className="pl-l mt-6 text-[8px] opacity-55">{conference.pillars.join("  ·  ")}</p>
          </aside>
        </div>
      </section>

      {/* PROGRAMME */}
      <section id="programme" className="pl-sec mx-auto w-full max-w-[1340px] px-5 py-[clamp(3.5rem,9vh,7rem)]" style={{ borderTop: "1px solid var(--hair)" }}>
        <Head n="02" kicker="Order of proceedings" title={<>Three days, two seats, <span className="italic">one programme</span></>} />
        <div className="mt-9">
          {days.map((day, di) => (
            <div key={day.id} className={di ? "mt-12" : ""}>
              <div className="flex flex-wrap items-baseline justify-between gap-3 border-b pb-3" style={{ borderColor: "var(--ink)" }}>
                <h3 className="pl-d text-[clamp(1.3rem,2.8vw,2.1rem)] leading-none">{day.kicker}</h3>
                <p className="pl-l text-[9px]" style={{ color: "var(--red)" }}>{day.date}</p>
              </div>
              <p className="pl-d mt-3 max-w-[64ch] text-[1rem] italic leading-relaxed opacity-70">
                {day.venue}. {day.blurb}
              </p>
              <ol className="mt-6 list-none p-0">
                {day.items.map((item, i) => (
                  <li key={item.title} className="grid grid-cols-[2.5rem_1fr_auto] items-baseline gap-4 border-b py-4" style={{ borderColor: "var(--hair)" }}>
                    <span className="pl-d text-[1.5rem] leading-none" style={{ color: "var(--red)" }}>{i + 1}</span>
                    <span className="pl-d text-[clamp(1rem,1.7vw,1.3rem)]">{item.title}</span>
                    <span className="pl-l text-[8px] opacity-55">{item.tag}</span>
                  </li>
                ))}
              </ol>
              {day.id === "workshop" ? (
                <p className="pl-d mt-4 text-[.95rem] italic" style={{ color: "var(--red)" }}>
                  Places limited; allocation opens with registration.
                </p>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      {/* HIGHLIGHTS */}
      <section id="highlights" className="pl-sec mx-auto w-full max-w-[1340px] px-5 py-[clamp(3.5rem,9vh,7rem)]" style={{ borderTop: "1px solid var(--hair)" }}>
        <Head n="03" kicker="Matters of record" title={<>Eight areas the programme is <span className="italic">built around</span></>} />
        <div className="mt-9 grid gap-x-10 gap-y-9 sm:grid-cols-2">
          {highlights.map((item, i) => (
            <article key={item.title} className="border-t pt-4" style={{ borderColor: "var(--ink)" }}>
              <div className="flex items-baseline gap-4">
                <span className="pl-d text-[2.2rem] leading-none" style={{ color: "var(--red)" }}>{String(i + 1).padStart(2, "0")}</span>
                <h3 className="pl-d text-[clamp(1.1rem,2vw,1.5rem)] leading-tight">{item.title}</h3>
              </div>
              <p className="pl-l mt-3 text-[8px] leading-[1.7] opacity-55">{item.sub}</p>
              <ul className="mt-3 list-none p-0">
                {item.points.map((point) => (
                  <li key={point} className="pl-d py-1 text-[.96rem] leading-snug opacity-80">{point}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      {/* COMMITTEE */}
      <section id="committee" className="pl-sec mx-auto w-full max-w-[1340px] px-5 py-[clamp(3.5rem,9vh,7rem)]" style={{ borderTop: "1px solid var(--hair)" }}>
        <Head n="04" kicker="Signatories" title={<>The committee <span className="italic">convening the meeting</span></>} />
        <div className="mt-9 grid gap-8 sm:grid-cols-2">
          {patrons.map((person) => (
            <div key={person.name} className="border-t pt-4" style={{ borderColor: "var(--ink)" }}>
              <p className="pl-l text-[9px]" style={{ color: "var(--red)" }}>{person.role}</p>
              <p className="pl-d mt-2 text-[clamp(1.25rem,2.4vw,1.8rem)] leading-tight">{person.name}</p>
            </div>
          ))}
        </div>
        <div className="mt-9 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {leadership.map((person) => (
            <div key={person.name} className="border-t pt-3" style={{ borderColor: "var(--hair)" }}>
              <p className="pl-l text-[8px]" style={{ color: "var(--red)" }}>{person.role}</p>
              <p className="pl-d mt-1.5 text-[1.05rem]">{person.name}</p>
            </div>
          ))}
        </div>
        <p className="pl-l mt-10 text-[9px] opacity-60">Executive committee</p>
        <ul className="mt-4 grid list-none gap-x-8 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {executiveCommittee.map((name, i) => (
            <li key={name} className="flex items-baseline gap-4 border-b py-2.5" style={{ borderColor: "var(--hair)" }}>
              <span className="pl-d text-[.95rem]" style={{ color: "var(--red)" }}>{i + 1}</span>
              <span className="pl-d text-[.98rem]">{name}</span>
            </li>
          ))}
        </ul>
        <p className="pl-d mt-6 text-[.95rem] italic" style={{ color: "var(--red)" }}>Invited faculty to be announced.</p>
      </section>

      {/* ABSTRACTS */}
      <section id="abstracts" className="pl-sec mx-auto w-full max-w-[1340px] px-5 py-[clamp(3.5rem,9vh,7rem)]" style={{ borderTop: "1px solid var(--hair)" }}>
        <Head n="05" kicker="Submitted work" title={<>Bring your work to <span className="italic">the record</span></>} />
        <div className="mt-9 grid gap-10 lg:grid-cols-2">
          <div>
            <p className="pl-d max-w-[54ch] text-[1.02rem] leading-[1.7] opacity-80">
              Two of the {days[1].items.length} scientific formats accept submitted work.
              Submission opens together with registration.
            </p>
            <ul className="mt-6 list-none p-0">
              {days[1].items.map((item) => {
                const isOpen = submittable.includes(item.title);
                return (
                  <li key={item.title} className="flex flex-wrap items-baseline justify-between gap-3 border-b py-3" style={{ borderColor: "var(--hair)" }}>
                    <span className={`pl-d text-[1.02rem] ${isOpen ? "" : "opacity-45"}`}>{item.title}</span>
                    <span className="pl-l text-[8px]" style={{ color: isOpen ? "var(--red)" : "rgba(27,26,24,.4)" }}>
                      {isOpen ? "Accepts abstracts" : "Invited"}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
          <div>
            <p className="pl-l text-[9px]" style={{ color: "var(--red)" }}>To be published</p>
            <ul className="mt-4 list-none p-0">
              {[
                ["Submission window", "Opening and closing dates"],
                ["Format", "Structured-abstract sections and word limit"],
                ["Categories", "Topic categories and subspecialty routing"],
                ["E-poster specification", "Dimensions, file format and upload route"],
                ["Review", "Notification date and presenting-author rules"],
              ].map(([k, v]) => (
                <li key={k} className="border-b py-3" style={{ borderColor: "var(--hair)" }}>
                  <p className="pl-d text-[1rem]">{k}</p>
                  <p className="pl-d mt-1 text-[.88rem] italic opacity-60">{v}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* VENUE */}
      <section id="venue" className="pl-sec mx-auto w-full max-w-[1340px] px-5 py-[clamp(3.5rem,9vh,7rem)]" style={{ borderTop: "1px solid var(--hair)" }}>
        <Head n="06" kicker="Seats of the meeting" title={<>Two seats across <span className="italic">three days</span></>} />
        <div className="mt-9 grid gap-10 lg:grid-cols-2">
          {venues.map((venue, i) => (
            <article key={venue.id} className="border-t pt-5" style={{ borderColor: "var(--ink)" }}>
              <p className="pl-l text-[9px]" style={{ color: "var(--red)" }}>{i === 0 ? days[0].date : days[1].date}</p>
              <h3 className="pl-d mt-3 text-[clamp(1.5rem,3vw,2.4rem)] leading-tight">{venue.name}</h3>
              <p className="pl-d mt-2 text-[.96rem] italic opacity-70">{venue.full}</p>
              <p className="pl-d mt-4 text-[1rem]">{venue.hosts}</p>
              <p className="pl-d mt-5 border-t pt-3 text-[.9rem] italic" style={{ borderColor: "var(--hair)", color: "var(--red)" }}>
                Full address and travel guidance to be published.
              </p>
            </article>
          ))}
        </div>
        <p className="pl-d mt-9 max-w-[62ch] text-[1rem] leading-relaxed opacity-75">
          Hyderabad, Telangana. Both seats sit within the city, alongside the Charminar,
          Hussain Sagar, the Durgam Cheruvu bridge and T-Hub.
        </p>
        <p className="pl-d mt-3 text-[.9rem] italic opacity-55">
          Accommodation block, shuttle plan and transfer times to be announced.
        </p>
      </section>

      {/* QUESTIONS */}
      <section id="questions" className="pl-sec mx-auto w-full max-w-[1340px] px-5 py-[clamp(3.5rem,9vh,7rem)]" style={{ borderTop: "1px solid var(--hair)" }}>
        <Head n="07" kicker="Queries" title={<>What is settled, and <span className="italic">what is not</span></>} />
        <dl className="mt-9 grid gap-x-12 sm:grid-cols-2">
          {[
            ["When and where is it held?", `${conference.dates.label}, in ${conference.city}, across ${venues.length} seats.`],
            ["Which seat on which day?", `${venues[0].name} hosts the workshop on 23 October. ${venues[1].name} hosts the scientific programme on 24 and 25 October.`],
            ["Who is convening it?", `${conference.organisedBy}, under the ${conference.association}.`],
            ["Is there hands-on training?", `Yes — ${days[0].items.length} skills stations run on 23 October.`],
            ["Can I present my own work?", "Yes. Two of the scientific formats accept submitted work; the rules are not yet published."],
            ["Is registration open?", "Not yet. Registration is opening soon."],
            ["Are CME credits awarded?", "Credit hours and the accrediting council are not yet confirmed."],
            ["How do I reach the organisers?", `By email at ${secretariat.email}.`],
          ].map(([q, a]) => (
            <div key={q} className="border-b py-4" style={{ borderColor: "var(--hair)" }}>
              <dt className="pl-d text-[1.1rem] leading-snug">{q}</dt>
              <dd className="pl-d mt-2 text-[.96rem] leading-relaxed opacity-75">{a}</dd>
            </div>
          ))}
        </dl>
        <p className="pl-l mt-7 text-[9px]" style={{ color: "var(--red)" }}>
          {openCount} further details await confirmation by the organising committee
        </p>
      </section>

      {/* REGISTER */}
      <section id="register" className="pl-sec py-[clamp(4rem,12vh,10rem)]" style={{ background: "var(--ink)", color: "var(--paper)" }}>
        <div className="mx-auto w-full max-w-[1340px] px-5">
          <p className="pl-l text-[9px]" style={{ color: "#e0a5aa" }}>
            {conference.dates.label} · {conference.city}
          </p>
          <h2 className="pl-d mt-6 max-w-[22ch] text-[clamp(2.1rem,6.5vw,5.4rem)] leading-[1]">
            Delegate registration <span className="italic" style={{ color: "#e0a5aa" }}>opens soon.</span>
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Fees", "To be announced"],
              ["Delegate categories", "To be announced"],
              ["CME accreditation", "To be announced"],
              ["Accommodation", "To be announced"],
            ].map(([k, v]) => (
              <div key={k} className="border-t pt-3" style={{ borderColor: "rgba(239,234,224,.28)" }}>
                <p className="pl-d text-[1rem]">{k}</p>
                <p className="pl-d mt-1 text-[.88rem] italic" style={{ color: "#e0a5aa" }}>{v}</p>
              </div>
            ))}
          </div>
          <a
            href={`mailto:${secretariat.email}?subject=IACTS%20Technocollege%20CME%202026`}
            className="pl-l mt-10 inline-block px-7 py-4 text-[10px] no-underline"
            style={{ background: "var(--paper)", color: "var(--ink)" }}
          >
            Enquire with the secretariat
          </a>
          <p className="pl-d mt-12 max-w-[26ch] text-[clamp(1.2rem,2.6vw,2rem)] italic leading-[1.2]">
            {conference.closing}
          </p>
          <p className="pl-l mt-8 text-[9px] opacity-55">
            Organised by {conference.organisedBy} · {secretariat.email} · Telephone numbers to be announced
          </p>
        </div>
      </section>
    </main>
  );
}
