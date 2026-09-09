import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./brochure.css";
import {
  about,
  conference,
  executiveCommittee,
  highlights,
  leadership,
  messages,
  patrons,
  programmeOverview,
  registrationHelpline,
  secretariat,
  venues,
} from "@/data/conference";
import {
  cvts2035,
  day0,
  day0Stations,
  day1,
  day2,
  signatureFormats,
  technologyLabs,
  threeDayFlow,
  youngSurgeonsToolkit,
  type SessionBlock,
  type Slot,
} from "@/data/programme";
import { conferenceConfig } from "@/config/conference.config";
import { pricingTiers } from "@/config/pricing.config";

/**
 * DELEGATE BROCHURE — a print route, rendered to PDF by Chromium.
 *
 * It imports the SAME data modules the website renders from, so a fee, a rule,
 * a phone number or a committee name cannot drift between site and brochure.
 * The session-by-session programme comes from data/programme.ts, transcribed
 * from the client's own trade brochure V5 (the only place that detail exists).
 *
 * `<img>` rather than next/image throughout, deliberately: next/image lazy-loads
 * and swaps in placeholders, which in a headless print render can commit a blank
 * box to the PDF. A print document wants the raw file at a known size.
 *
 * Render:  node scripts/render-brochure.mjs
 */
export const metadata: Metadata = {
  title: `Delegate Brochure — ${conference.name}`,
  robots: { index: false, follow: false },
};

const RAW_SITE = conferenceConfig.contact.website.replace(/\/$/, "");
/**
 * A brochure is printed and handed out — a localhost link in it is dead forever,
 * for everyone. conferenceConfig.contact.website prefers NEXT_PUBLIC_APP_URL,
 * which in a dev environment is a loopback address, so every button here
 * silently pointed at http://localhost. Reject loopback/private and fall back to
 * the canonical public domain.
 */
const SITE = /^https?:\/\/(localhost|127\.|0\.0\.0\.0|\[?::1|192\.168\.|10\.)/i.test(RAW_SITE)
  ? "https://iactstechnocollegecme2026.com"
  : RAW_SITE;

const LINK = {
  register: `${SITE}/register`,
  abstracts: `${SITE}/abstracts`,
  fees: `${SITE}/pricing`,
  programme: `${SITE}/programme`,
  committee: `${SITE}/committee`,
  site: SITE,
};

const MARK = "Future Is Now · Hyderabad 2026";

function Page({
  n,
  section,
  children,
  cover = false,
}: {
  n?: string;
  section?: string;
  children: ReactNode;
  cover?: boolean;
}) {
  return (
    <section className={`bro-page${cover ? " bro-cover" : ""}`}>
      {!cover ? (
        <header className="bro-head">
          <p className="bro-head-sec">{section ?? ""}</p>
          <p className="bro-head-mark">{MARK}</p>
        </header>
      ) : null}
      <div className="bro-body">{children}</div>
      {!cover ? (
        <footer className="bro-foot">
          <p className="bro-foot-name">{conference.name}</p>
          <p className="bro-foot-num">{n}</p>
        </footer>
      ) : null}
    </section>
  );
}

/** A metadata rail + content column — the page's basic editorial move. */
function Split({ rail, children, wide = false }: { rail: ReactNode; children: ReactNode; wide?: boolean }) {
  return (
    <div className={`bro-split${wide ? " bro-split-wide" : ""}`}>
      <div className="bro-rail">{rail}</div>
      <div>{children}</div>
    </div>
  );
}

function SlotRow({ s }: { s: Slot }) {
  const kind = s.kind ? ` is-${s.kind}` : "";
  return (
    <div className={`bro-slot${kind}`}>
      <p className="bro-slot-time">{s.time ?? ""}</p>
      <div>
        <p className="bro-slot-title">
          {s.title}
          {s.tentative ? <span className="bro-tent">tentative</span> : null}
        </p>
        {s.who ? <p className="bro-slot-who">{s.who}</p> : null}
      </div>
    </div>
  );
}

function Session({ b }: { b: SessionBlock }) {
  return (
    <div className="bro-sess">
      <div className="bro-sess-head">
        <p className="bro-sess-code">{b.code ?? "·"}</p>
        <p className="bro-h3" style={{ fontSize: "10.4pt" }}>{b.title}</p>
        <p className="bro-label">{b.window ?? ""}</p>
      </div>
      {b.slots.map((s) => (
        <SlotRow key={`${s.time ?? ""}${s.title}`} s={s} />
      ))}
      {b.note ? <p className="bro-note" style={{ marginTop: "2.5mm" }}>{b.note}</p> : null}
    </div>
  );
}

/** Initials, for a committee member who supplied no photograph. */
function initials(name: string) {
  return name
    .replace(/^Dr\.?\s+/i, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("");
}

function Portrait({ src, name, role }: { src?: string | null; name: string; role?: string }) {
  return (
    <div>
      {src ? (
        <img className="bro-por" src={src} alt={name} />
      ) : (
        <div className="bro-por-ph">
          <span>{initials(name)}</span>
        </div>
      )}
      <p className="bro-por-name">{name}</p>
      {role ? <p className="bro-por-role">{role}</p> : null}
    </div>
  );
}

export default function BrochurePage() {
  const [chairman, secretary] = messages;
  const { domains, breakthrough } = programmeOverview;
  const bank = conferenceConfig.payment.bankDetails;
  const abstractRules = conferenceConfig.abstracts.submissionRules ?? [];
  const deadline = conferenceConfig.abstracts.submissionWindow?.end;
  const deadlineLabel = deadline
    ? new Date(deadline).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
    : "To be announced";

  const feeRows = ["resident", "iacts-member", "non-member"] as const;
  const TIER_KEYS = ["earlyBird", "regular", "onsite"] as const;
  const tiers = TIER_KEYS.flatMap((key) => {
    const cfg = conferenceConfig.payment.tiers[key];
    return cfg?.label && cfg?.startDate && cfg?.endDate
      ? [{ key, label: cfg.label, startDate: cfg.startDate, endDate: cfg.endDate }]
      : [];
  });
  const earlyBird = tiers[0];
  const dmy = (iso: string) =>
    new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <div className="bro">
      {/* ============================= COVER =============================== */}
      <Page cover>
        <div style={{ display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <p className="bro-label">{MARK}</p>
            <p className="bro-label">Delegate Brochure</p>
          </div>

          <div className="bro-cover-ph">
            <p className="bro-label">Cover artwork · placeholder</p>
            <p className="bro-note" style={{ marginTop: "3mm", color: "rgba(255,254,253,.5)" }}>
              Final cover to be supplied. Every page after this one is complete.
            </p>
          </div>

          <div>
            <div style={{ height: "1.5pt", background: "var(--crimson)", width: "26mm", marginBottom: "7mm" }} />
            <p className="bro-display" style={{ marginBottom: "5mm" }}>
              The future
              <br />
              <span className="bro-em">is now</span>
            </p>
            <p className="bro-lede" style={{ color: "var(--paper)", maxWidth: "120mm", marginBottom: "6mm" }}>
              IACTS TechnoCollege CME 2026 — a pre-conference workshop and a two-day CME built for the next generation
              of cardiothoracic surgeons.
            </p>
            <div className="bro-cols bro-c3" style={{ gap: "4mm", maxWidth: "150mm" }}>
              <div>
                <p className="bro-label">Dates</p>
                <p className="bro-h3" style={{ color: "var(--paper)", marginTop: "1mm" }}>{conference.dates.label}</p>
              </div>
              <div>
                <p className="bro-label">City</p>
                <p className="bro-h3" style={{ color: "var(--paper)", marginTop: "1mm" }}>{conference.city}</p>
              </div>
              <div>
                <p className="bro-label">Convened by</p>
                <p className="bro-h3" style={{ color: "var(--paper)", marginTop: "1mm" }}>{conference.organisedBy}</p>
              </div>
            </div>
          </div>

          <p className="bro-label" style={{ letterSpacing: ".26em" }}>
            Learn it · Do it · Challenge it · Innovate it
          </p>
        </div>
      </Page>

      {/* ============================ CONTENTS ============================= */}
      <Page n="02" section="Contents">
        <p className="bro-kicker">The brochure</p>
        <div className="bro-hr-heavy" />
        <p className="bro-display bro-display-sm">Contents</p>

        <Split
          wide
          rail={
            <>
              <p className="bro-label">Three days</p>
              <p className="bro-note">
                One pre-conference workshop day at NIMS, then two scientific days at the Dr. MCR HRD Auditorium.
              </p>
            </>
          }
        >
          {[
            ["03", "Welcome — Organising Chairman"],
            ["04", "Welcome — Organising Secretary"],
            ["05", "About the CME"],
            ["06", "The three-day flow"],
            ["07", "Day 0 — Surgical Skills & Innovation"],
            ["08", "Day 1 — Inauguration, Keynote & MICS/Robotic"],
            ["09", "Day 1 — Aortic Surgery"],
            ["10", "Day 1 — Pediatric, Digital & the Young Surgeon's Toolkit"],
            ["11", "Day 2 — Transplantation"],
            ["12", "Day 2 — VATS, Robotic & Thoracic"],
            ["13", "Day 2 — MedTech Innovation & Research"],
            ["14", "Day 2 — CVTS 2035 & Closing"],
            ["15", "Industry × Surgeon Technology Labs"],
            ["16", "Registration fees"],
            ["17", "How to register"],
            ["18", "Abstracts"],
            ["19", "Venues & Hyderabad"],
            ["20", "Organising committee"],
            ["21", "Contact"],
          ].map(([n, label]) => (
            <div key={n} className="bro-item">
              <p className="bro-mono">{n}</p>
              <p className="bro-h3">{label}</p>
            </div>
          ))}
        </Split>
      </Page>

      {/* ======================= WELCOME · CHAIRMAN ======================== */}
      <Page n="03" section="Welcome">
        <p className="bro-kicker">Message · Organising Chairman</p>
        <div className="bro-hr-heavy" />
        <p className="bro-display bro-display-sm" style={{ marginBottom: "8mm" }}>
          A mindset of adaptability, innovation and <span className="bro-em">lifelong learning</span>
        </p>

        <Split
          rail={
            <>
              <img className="bro-por" src={chairman.portrait} alt={chairman.name} />
              <p className="bro-por-name">{chairman.name}</p>
              <p className="bro-por-role">{chairman.role}</p>
            </>
          }
        >
          <p className="bro-label bro-label-red" style={{ marginBottom: "3mm" }}>{chairman.salutation}</p>
          {chairman.paragraphs.map((t) => (
            <p key={t.slice(0, 40)} className="bro-p">{t}</p>
          ))}
          <p className="bro-note" style={{ marginTop: "5mm", borderTop: "0.5pt solid var(--hair)", paddingTop: "3mm" }}>
            {chairman.name} · {chairman.role}
          </p>
        </Split>
      </Page>

      {/* ======================= WELCOME · SECRETARY ======================= */}
      <Page n="04" section="Welcome">
        <p className="bro-kicker">Message · Organising Secretary</p>
        <div className="bro-hr-heavy" />
        <p className="bro-display bro-display-sm" style={{ marginBottom: "8mm" }}>
          The future is no longer something we are <span className="bro-em">waiting for</span>
        </p>

        <Split
          rail={
            <>
              <img className="bro-por" src={secretary.portrait} alt={secretary.name} />
              <p className="bro-por-name">{secretary.name}</p>
              <p className="bro-por-role">{secretary.role}</p>
            </>
          }
        >
          <p className="bro-label bro-label-red" style={{ marginBottom: "3mm" }}>{secretary.salutation}</p>
          {secretary.paragraphs.map((t) => (
            <p key={t.slice(0, 40)} className="bro-p">{t}</p>
          ))}
          <p className="bro-note" style={{ marginTop: "5mm", borderTop: "0.5pt solid var(--hair)", paddingTop: "3mm" }}>
            {secretary.name} · {secretary.role}
          </p>
        </Split>
      </Page>

      {/* ============================== ABOUT ============================== */}
      <Page n="05" section="About">
        <p className="bro-kicker">About the CME</p>
        <div className="bro-hr-heavy" />
        <p className="bro-display">{about.heading}</p>

        <Split
          rail={
            <>
              <p className="bro-label">Conceived for</p>
              <p className="bro-note">
                Postgraduate students and young surgeons in the early stages of their careers.
              </p>
              <p className="bro-label" style={{ marginTop: "5mm" }}>A platform to</p>
              {about.verbs.map((v) => (
                <p key={v} className="bro-mono" style={{ marginTop: "1.4mm" }}>{v}</p>
              ))}
            </>
          }
        >
          <p className="bro-lede">{about.lede}</p>
          <p className="bro-p">{about.body}</p>
          <p className="bro-p" style={{ color: "var(--ink)" }}>{about.closing}</p>

          <div className="bro-hr" />

          <p className="bro-label bro-label-ink" style={{ marginBottom: "3mm" }}>Four scientific domains</p>
          {domains.map((d) => (
            <div key={d.code} className="bro-item">
              <p className="bro-ord">{d.code}</p>
              <div>
                <p className="bro-h2" style={{ fontSize: "12.5pt", marginBottom: "0.6mm" }}>{d.title}</p>
                {"note" in d && d.note ? <p className="bro-label">{d.note}</p> : null}
              </div>
            </div>
          ))}
          <p className="bro-note" style={{ marginTop: "5mm" }}>
            Convened by {conference.organisedBy} · under the aegis of the {conference.association}
          </p>
        </Split>
      </Page>

      {/* ========================= THREE-DAY FLOW ========================== */}
      <Page n="06" section="Programme">
        <p className="bro-kicker">Highlights at a glance</p>
        <div className="bro-hr-heavy" />
        <p className="bro-display bro-display-sm">
          Three days, <span className="bro-em">one arc</span>
        </p>

        <div className="bro-cols bro-c3" style={{ marginBottom: "9mm" }}>
          {threeDayFlow.map((d) => (
            <div key={d.label} style={{ borderTop: "1.5pt solid var(--crimson)", paddingTop: "3mm" }}>
              <p className="bro-label bro-label-red">{d.label}</p>
              <p className="bro-h2" style={{ fontSize: "13pt", margin: "2mm 0 2mm" }}>{d.title}</p>
              <p className="bro-note">{d.blurb}</p>
            </div>
          ))}
        </div>

        <Split
          rail={
            <>
              <p className="bro-label">Signature formats</p>
              <p className="bro-note">Eight recurring formats the programme is built from.</p>
            </>
          }
        >
          <div className="bro-cols bro-c2" style={{ gap: "0 var(--gut)" }}>
            {signatureFormats.map((f, i) => (
              <div key={f} className="bro-item">
                <p className="bro-mono">{String(i + 1).padStart(2, "0")}</p>
                <p className="bro-h3" style={{ fontWeight: 500 }}>{f}</p>
              </div>
            ))}
          </div>
          <p className="bro-label bro-label-red" style={{ marginTop: "7mm", letterSpacing: ".2em" }}>
            Operate well · Think critically · Innovate responsibly
          </p>
        </Split>
      </Page>

      {/* ============================== DAY 0 ============================== */}
      <Page n="07" section={`${day0.label} · ${day0.date}`}>
        <p className="bro-kicker">{day0.label} · {day0.date} · {day0.window}</p>
        <div className="bro-hr-heavy" />
        <p className="bro-display">{day0.title}</p>

        <Split
          rail={
            <>
              <p className="bro-label">Venue</p>
              <p className="bro-note">{day0.venue}</p>
              <p className="bro-label" style={{ marginTop: "5mm" }}>Format</p>
              <p className="bro-note">Five components, run in parallel stations. Capacity-limited.</p>
            </>
          }
        >
          <p className="bro-lede">{day0.blurb}</p>

          {day0Stations.map((s) => (
            <div key={s.code} className="bro-item" style={{ padding: "3.6mm 0" }}>
              <p className="bro-ord">{s.code}</p>
              <div>
                <p className="bro-h2" style={{ fontSize: "13pt", marginBottom: "1mm" }}>{s.title}</p>
                <p className="bro-note">{s.blurb}</p>
              </div>
            </div>
          ))}

          <div className="bro-panel bro-panel-edge" style={{ marginTop: "6mm" }}>
            <p className="bro-label bro-label-red">Learn it · Do it · Challenge it</p>
            <p className="bro-p" style={{ margin: "2.5mm 0 0", color: "var(--ink)" }}>
              {day0.closing} Compete, build and present alongside faculty at the cutting edge of CVTS. Workshop places
              are allocated with registration — select your preference in the registration form.
            </p>
          </div>
        </Split>
      </Page>

      {/* ===================== DAY 1 · KEYNOTE + S1 ======================== */}
      <Page n="08" section={`${day1.label} · ${day1.date}`}>
        <p className="bro-kicker">{day1.label} · {day1.date} · {day1.window} · {day1.venue}</p>
        <div className="bro-hr-heavy" />
        <p className="bro-display bro-display-sm">{day1.title}</p>
        <div style={{ marginTop: "7mm" }}>
          <Session b={day1.blocks[0]!} />
          <Session b={day1.blocks[1]!} />
        </div>
      </Page>

      {/* ========================= DAY 1 · AORTIC ========================== */}
      <Page n="09" section={`${day1.label} · Aortic`}>
        <p className="bro-kicker">{day1.label} · Afternoon</p>
        <div className="bro-hr-heavy" />
        <p className="bro-display bro-display-sm">
          Contemporary <span className="bro-em">aortic surgery</span>
        </p>
        <div style={{ marginTop: "7mm" }}>
          <Session b={day1.blocks[2]!} />
        </div>
      </Page>

      {/* ============== DAY 1 · PEDIATRIC / DIGITAL + TOOLKIT ============== */}
      <Page n="10" section={`${day1.label} · Pediatric & Digital`}>
        <p className="bro-kicker">{day1.label} · Afternoon &amp; evening</p>
        <div className="bro-hr-heavy" />
        <p className="bro-display bro-display-sm">
          Pediatric &amp; the <span className="bro-em">digital surgeon</span>
        </p>
        <div style={{ marginTop: "6mm" }}>
          <Session b={day1.blocks[3]!} />
        </div>

        <div style={{ marginTop: "6mm", borderTop: "1pt solid var(--crimson)", paddingTop: "4mm" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <p className="bro-h2" style={{ fontSize: "14pt", margin: 0 }}>{youngSurgeonsToolkit.title}</p>
            <p className="bro-label">{youngSurgeonsToolkit.window}</p>
          </div>
          <div className="bro-cols bro-c3" style={{ marginTop: "4mm", gap: "5mm" }}>
            {youngSurgeonsToolkit.items.map((t) => (
              <div key={t.title}>
                <p className="bro-h3">{t.title}</p>
                <p className="bro-note" style={{ marginTop: "1.4mm" }}>{t.blurb}</p>
              </div>
            ))}
          </div>
        </div>
      </Page>

      {/* ====================== DAY 2 · TRANSPLANT ========================= */}
      <Page n="11" section={`${day2.label} · ${day2.date}`}>
        <p className="bro-kicker">{day2.label} · {day2.date} · {day2.window} · {day2.venue}</p>
        <div className="bro-hr-heavy" />
        <p className="bro-display bro-display-sm">{day2.title}</p>
        <div style={{ marginTop: "7mm" }}>
          <Session b={day2.blocks[0]!} />
        </div>
      </Page>

      {/* ======================== DAY 2 · THORACIC ========================= */}
      <Page n="12" section={`${day2.label} · Thoracic`}>
        <p className="bro-kicker">{day2.label} · Late morning</p>
        <div className="bro-hr-heavy" />
        <p className="bro-display bro-display-sm">
          VATS, robotic &amp; minimally invasive <span className="bro-em">thoracic</span>
        </p>
        <div style={{ marginTop: "7mm" }}>
          <Session b={day2.blocks[1]!} />
        </div>
      </Page>

      {/* =============== DAY 2 · MEDTECH + RESEARCH ======================== */}
      <Page n="13" section={`${day2.label} · Innovation & Research`}>
        <p className="bro-kicker">{day2.label} · Afternoon</p>
        <div className="bro-hr-heavy" />
        <p className="bro-display bro-display-sm">
          Innovation, research &amp; <span className="bro-em">the future</span>
        </p>
        <div style={{ marginTop: "7mm" }}>
          <Session b={day2.blocks[2]!} />
          <Session b={day2.blocks[3]!} />
        </div>
      </Page>

      {/* ===================== DAY 2 · CVTS 2035 =========================== */}
      <Page n="14" section={`${day2.label} · CVTS 2035`}>
        <p className="bro-kicker">{cvts2035.code} · {cvts2035.window}</p>
        <div className="bro-hr-heavy" />
        <p className="bro-display bro-display-sm">{cvts2035.title}</p>
        <p className="bro-lede" style={{ fontStyle: "italic" }}>{cvts2035.question}</p>

        <Split
          rail={
            <>
              <p className="bro-label">Proposed panel</p>
              {cvts2035.panel.map((p) => (
                <p key={p} className="bro-note" style={{ marginTop: "1.2mm" }}>{p}</p>
              ))}
            </>
          }
        >
          <p className="bro-label bro-label-ink" style={{ marginBottom: "3mm" }}>On the table</p>
          <div className="bro-cols bro-c2" style={{ gap: "0 var(--gut)" }}>
            {cvts2035.topics.map((t, i) => (
              <div key={t} className="bro-item">
                <p className="bro-mono">{String(i + 1).padStart(2, "0")}</p>
                <p className="bro-h3" style={{ fontWeight: 500 }}>{t}</p>
              </div>
            ))}
          </div>

          <div className="bro-panel bro-panel-edge" style={{ marginTop: "7mm" }}>
            <p className="bro-label bro-label-red">{cvts2035.closing.title}</p>
            <p className="bro-p" style={{ margin: "2.5mm 0 0", color: "var(--ink)" }}>
              {cvts2035.closing.body}
            </p>
          </div>
        </Split>
      </Page>

      {/* ====================== TECHNOLOGY LABS ============================ */}
      <Page n="15" section="Industry × Surgeon">
        <p className="bro-kicker">Industry × Surgeon</p>
        <div className="bro-hr-heavy" />
        <p className="bro-display bro-display-sm">
          Technology <span className="bro-em">labs</span>
        </p>

        <Split
          rail={
            <>
              <p className="bro-label">How it works</p>
              <p className="bro-note">
                Built around hands-on education rather than sponsored lectures — six immersive labs run alongside the
                scientific programme.
              </p>
              <p className="bro-label" style={{ marginTop: "5mm" }}>Also</p>
              <p className="bro-note">{breakthrough.heading}</p>
            </>
          }
        >
          {technologyLabs.map((l, i) => (
            <div key={l.title} className="bro-item" style={{ padding: "3.4mm 0" }}>
              <p className="bro-ord">{String(i + 1).padStart(2, "0")}</p>
              <div>
                <p className="bro-h2" style={{ fontSize: "12.5pt", marginBottom: "1mm" }}>{l.title}</p>
                <p className="bro-note">{l.blurb}</p>
              </div>
            </div>
          ))}
          <p className="bro-p" style={{ marginTop: "6mm" }}>{breakthrough.body}</p>
        </Split>
      </Page>

      {/* ============================== FEES =============================== */}
      <Page n="16" section="Registration · Fees">
        <p className="bro-kicker">Registration</p>
        <div className="bro-hr-heavy" />
        <p className="bro-display bro-display-sm">
          Registration <span className="bro-em">fees</span>
        </p>
        <p className="bro-lede">
          Charged at the tier active on the date payment is received. All amounts in Indian rupees, inclusive of GST.
        </p>

        <table className="bro-table" style={{ marginTop: "3mm" }}>
          <thead>
            <tr>
              <th>Category</th>
              {tiers.map((t, i) => (
                <th key={t.key} className={i === 0 ? "is-best" : undefined}>
                  {t.label}
                  <span>till {dmy(t.endDate)}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {feeRows.map((key) => (
              <tr key={key}>
                <td>{pricingTiers.earlyBird?.categories?.[key]?.label ?? key}</td>
                {tiers.map((t, i) => {
                  const amt = pricingTiers[t.key]?.categories?.[key]?.amount;
                  return (
                    <td key={t.key} className={i === 0 ? "is-best" : undefined}>
                      {typeof amt === "number" ? `₹${amt.toLocaleString("en-IN")}` : "—"}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        <div className="bro-cols bro-c3" style={{ marginTop: "7mm" }}>
          {tiers.map((t) => (
            <div key={t.key} style={{ borderTop: "0.5pt solid var(--hair)", paddingTop: "2.5mm" }}>
              <p className="bro-label bro-label-ink">{t.label}</p>
              <p className="bro-note" style={{ marginTop: "1.2mm" }}>
                {dmy(t.startDate)} — {dmy(t.endDate)}
              </p>
            </div>
          ))}
        </div>

        <div className="bro-panel bro-panel-edge" style={{ marginTop: "8mm" }}>
          <p className="bro-label bro-label-red">Included with Early Bird</p>
          <p className="bro-h2" style={{ fontSize: "15pt", margin: "2.5mm 0 2mm" }}>
            Complimentary twin-sharing accommodation at the venue
          </p>
          <p className="bro-note">
            Early Bird rates apply until {earlyBird ? dmy(earlyBird.endDate) : "the published date"}. Concessional
            categories require proof of eligibility.
          </p>
        </div>

        <div className="bro-btn-row" style={{ marginTop: "8mm" }}>
          <a className="bro-btn bro-btn-red" href={LINK.register}>Register now</a>
          <a className="bro-btn bro-btn-ghost" href={LINK.fees}>Full fee details</a>
          <a className="bro-url" href={LINK.register}>{LINK.register.replace(/^https?:\/\//, "")}</a>
        </div>
      </Page>

      {/* ========================= HOW TO REGISTER ========================= */}
      <Page n="17" section="Registration · How">
        <p className="bro-kicker">Registration</p>
        <div className="bro-hr-heavy" />
        <p className="bro-display bro-display-sm">
          How to <span className="bro-em">register</span>
        </p>

        <Split
          wide
          rail={
            <>
              {bank ? (
                <>
                  <p className="bro-label bro-label-red">Pay to this account</p>
                  <p className="bro-label" style={{ marginTop: "3mm" }}>Account name</p>
                  <p className="bro-h3" style={{ marginTop: "0.8mm" }}>{bank.accountName}</p>
                  <p className="bro-label" style={{ marginTop: "2.5mm" }}>Account number</p>
                  <p className="bro-h3" style={{ marginTop: "0.8mm" }}>{bank.accountNumber}</p>
                  <p className="bro-label" style={{ marginTop: "2.5mm" }}>Bank · IFSC</p>
                  <p className="bro-h3" style={{ marginTop: "0.8mm" }}>{bank.bankName}</p>
                  <p className="bro-h3">{bank.ifscCode}</p>
                  {bank.branchName ? <p className="bro-note" style={{ marginTop: "1.5mm" }}>{bank.branchName}</p> : null}
                </>
              ) : null}
              <img className="bro-qr" src="/payment/qr.png" alt="UPI QR code for the registration fee" />
              <p className="bro-label">Scan to pay by UPI</p>
            </>
          }
        >
          {[
            ["01", "Register online", "Complete the delegate form on the conference website."],
            ["02", "Pay the fee", "Transfer by NEFT, IMPS or UPI using the account details or the QR code."],
            ["03", "Attach your proof", "Enter the UTR / transaction reference and upload the payment screenshot. Both are required."],
            ["04", "Receive confirmation", "The secretariat matches your payment and issues your registration ID and QR pass by email."],
          ].map(([n, t, d]) => (
            <div key={n} className="bro-item" style={{ padding: "3.6mm 0" }}>
              <p className="bro-ord">{n}</p>
              <div>
                <p className="bro-h2" style={{ fontSize: "13pt", marginBottom: "1mm" }}>{t}</p>
                <p className="bro-note">{d}</p>
              </div>
            </div>
          ))}

          <p className="bro-label bro-label-ink" style={{ marginTop: "7mm" }}>What you will be asked for</p>
          <p className="bro-p" style={{ marginTop: "2mm" }}>
            Name, email and mobile · designation and specialization · institution · medical registration number ·
            registration category · workshop preference · accommodation requirement · UTR and payment screenshot.
          </p>

          <div style={{ marginTop: "6mm", borderTop: "1pt solid var(--crimson)", paddingTop: "3mm" }}>
            <p className="bro-label bro-label-red">{registrationHelpline.label}</p>
            <p className="bro-figure" style={{ fontSize: "19pt", marginTop: "1.5mm" }}>
              {registrationHelpline.name} · +91 {registrationHelpline.number}
            </p>
          </div>

          <div className="bro-btn-row" style={{ marginTop: "6mm" }}>
            <a className="bro-btn bro-btn-red" href={LINK.register}>Register online</a>
            <a className="bro-url" href={LINK.register}>{LINK.register.replace(/^https?:\/\//, "")}</a>
          </div>
        </Split>
      </Page>

      {/* ============================ ABSTRACTS ============================ */}
      <Page n="18" section="Abstracts">
        <p className="bro-kicker">Abstracts</p>
        <div className="bro-hr-heavy" />
        <p className="bro-display bro-display-sm">
          Abstract <span className="bro-em">submission</span>
        </p>

        <Split
          rail={
            <>
              <p className="bro-label bro-label-red">Last date</p>
              <p className="bro-figure" style={{ marginTop: "1.5mm", fontSize: "20pt" }}>{deadlineLabel}</p>
              <p className="bro-label" style={{ marginTop: "5mm" }}>Format</p>
              <p className="bro-note">
                Decided by the scientific committee after review — paper or poster. You do not choose.
              </p>
            </>
          }
        >
          <p className="bro-lede">
            Abstracts and case reports are invited for the scientific programme. Conference registration is mandatory
            before you submit.
          </p>

          <p className="bro-label bro-label-ink" style={{ marginBottom: "2mm" }}>Submission rules</p>
          <div className="bro-cols bro-c2" style={{ gap: "0 var(--gut)" }}>
            {abstractRules.map((rule, i) => (
              <div key={rule} className="bro-item" style={{ padding: "2.2mm 0" }}>
                <p className="bro-mono">{String(i + 1).padStart(2, "0")}</p>
                <p className="bro-note" style={{ color: "var(--muted)" }}>{rule}</p>
              </div>
            ))}
          </div>

          <div className="bro-hr" />

          <div className="bro-cols bro-c2">
            <div>
              <p className="bro-label bro-label-ink">Where to submit</p>
              <p className="bro-note" style={{ margin: "1.5mm 0 3mm" }}>
                Online only, through the conference website.
              </p>
              <a className="bro-btn bro-btn-red" href={LINK.abstracts}>Submit an abstract</a>
              <p style={{ marginTop: "2.5mm" }}>
                <a className="bro-url" href={LINK.abstracts}>{LINK.abstracts.replace(/^https?:\/\//, "")}</a>
              </p>
            </div>
            <div>
              <p className="bro-label bro-label-ink">Not registered yet</p>
              <p className="bro-note" style={{ margin: "1.5mm 0 3mm" }}>
                Register first, then submit from your delegate account.
              </p>
              <a className="bro-btn bro-btn-ghost" href={LINK.register}>Register first</a>
              <p style={{ marginTop: "2.5mm" }}>
                <a className="bro-url" href={`mailto:${conferenceConfig.contact.abstractsEmail}`}>
                  {conferenceConfig.contact.abstractsEmail}
                </a>
              </p>
            </div>
          </div>
        </Split>
      </Page>

      {/* ======================== VENUES & HYDERABAD ======================= */}
      <Page n="19" section="Venue · Host City">
        <p className="bro-kicker">Where it happens</p>
        <div className="bro-hr-heavy" />
        <p className="bro-display bro-display-sm">
          The <span className="bro-em">venues</span>
        </p>

        <div className="bro-cols bro-c2" style={{ marginBottom: "8mm" }}>
          {venues.map((v, i) => (
            <div key={v.id} style={{ borderTop: "1.5pt solid var(--crimson)", paddingTop: "3mm" }}>
              <p className="bro-label bro-label-red">{i === 0 ? "Day 0 · 23 Oct" : "Day 1 & 2 · 24–25 Oct"}</p>
              <p className="bro-h2" style={{ fontSize: "15pt", margin: "2mm 0 1.5mm" }}>{v.name}</p>
              <p className="bro-note">{v.full}</p>
              <p className="bro-note" style={{ marginTop: "1.5mm" }}>{v.address}</p>
            </div>
          ))}
        </div>

        <p className="bro-p" style={{ maxWidth: "150mm" }}>
          Both venues are centrally located with easy access from Rajiv Gandhi International Airport and the city
          centre. Travel notes and recommended stays will be shared with registered delegates.
        </p>

        <div className="bro-hr" />

        <p className="bro-kicker" style={{ marginBottom: "3mm" }}>Explore Hyderabad</p>
        <p className="bro-h2" style={{ fontSize: "17pt", marginBottom: "2mm" }}>
          A city of heritage — and of medicine
        </p>
        <p className="bro-p" style={{ maxWidth: "150mm", marginBottom: "5mm" }}>
          A rich cultural heritage alongside a fast-growing ecosystem of medicine, technology and innovation — the
          spirit of this conference.
        </p>

        <div className="bro-cols bro-c3" style={{ gap: "5mm var(--gut)" }}>
          {[
            ["Golconda Fort", "16th century", "The granite citadel of the Qutb Shahi kings, famous for acoustics that carry a handclap from the gateway to the summit."],
            ["Salar Jung Museum", "Collection", "One of the largest one-man collections in the world — sculpture, manuscripts and textiles from across continents."],
            ["Hussain Sagar", "Heart of the city", "The lake dividing Hyderabad from Secunderabad, with the monolithic Buddha at its centre."],
            ["Birla Mandir", "Naubath Pahad", "White marble on the hill above Hussain Sagar, with one of the widest views over the city."],
            ["Ramoji Film City", "Day trip", "The world's largest integrated film studio complex, on the eastern edge of the city."],
            ["HITEC City", "Modern Hyderabad", "The technology and biotech corridor that made Hyderabad a centre for research and pharma."],
          ].map(([name, tag, blurb]) => (
            <div key={name} style={{ borderTop: "0.5pt solid var(--hair)", paddingTop: "2.5mm" }}>
              <p className="bro-h3">{name}</p>
              <p className="bro-label" style={{ marginTop: "0.8mm" }}>{tag}</p>
              <p className="bro-note" style={{ marginTop: "1.5mm" }}>{blurb}</p>
            </div>
          ))}
        </div>
      </Page>

      {/* =========================== COMMITTEE ============================= */}
      <Page n="20" section="Leadership">
        <p className="bro-kicker">Leadership</p>
        <div className="bro-hr-heavy" />
        <p className="bro-display bro-display-sm">
          Organising <span className="bro-em">committee</span>
        </p>

        <p className="bro-label bro-label-ink" style={{ marginBottom: "2.5mm" }}>Patrons</p>
        <div className="bro-cols bro-c6" style={{ marginBottom: "5mm", gap: "3.5mm" }}>
          {patrons.map((p) => (
            <Portrait key={p.name} src={p.portrait} name={p.name} role={p.title} />
          ))}
        </div>

        <p className="bro-label bro-label-ink" style={{ marginBottom: "2.5mm" }}>Organising committee</p>
        <div className="bro-cols bro-c6" style={{ marginBottom: "5mm", gap: "3.5mm" }}>
          {leadership.map((l) => (
            <Portrait key={l.name} src={l.portrait} name={l.name} role={l.role} />
          ))}
        </div>

        {/* Eight columns, not six: eleven members at six-up spilled onto a third
            row and clipped the page by 25px. Denser is also correct here — these
            are supporting portraits, not headline ones. */}
        <p className="bro-label bro-label-ink" style={{ marginBottom: "2.5mm" }}>Executive committee</p>
        <div className="bro-cols" style={{ gridTemplateColumns: "repeat(8, 1fr)", gap: "3mm" }}>
          {executiveCommittee.map((m) => (
            <Portrait key={m.name} src={m.portrait} name={m.name} />
          ))}
        </div>

        <p className="bro-note" style={{ marginTop: "5mm" }}>
          Conference Secretariat · {secretariat.department}, {secretariat.city} · {secretariat.email}
        </p>
      </Page>

      {/* ============================= CONTACT ============================= */}
      <Page n="21" section="Contact">
        <p className="bro-kicker">Join us in Hyderabad</p>
        <div className="bro-hr-heavy" />
        <p className="bro-display">
          The future
          <br />
          <span className="bro-em">is now</span>
        </p>
        <p className="bro-lede">{conference.closing}</p>

        <div className="bro-btn-row" style={{ margin: "8mm 0" }}>
          <a className="bro-btn bro-btn-red" href={LINK.register}>Register now</a>
          <a className="bro-btn bro-btn-ghost" href={LINK.abstracts}>Submit an abstract</a>
          <a className="bro-btn bro-btn-ghost" href={LINK.programme}>Full programme</a>
        </div>

        <div className="bro-cols bro-c2" style={{ gap: "8mm" }}>
          <div style={{ borderTop: "1.5pt solid var(--crimson)", paddingTop: "3mm" }}>
            <p className="bro-label bro-label-red">Conference secretariat</p>
            <p className="bro-h2" style={{ fontSize: "13pt", margin: "2.5mm 0 1mm" }}>{secretariat.department}</p>
            <p className="bro-note">{secretariat.city}</p>
            <p style={{ marginTop: "2.5mm" }}>
              <a className="bro-url" href={`mailto:${secretariat.email}`}>{secretariat.email}</a>
            </p>
            {secretariat.phones.map((p) => (
              <p key={p.number} className="bro-h3" style={{ marginTop: "2.5mm", color: "var(--crimson)" }}>
                {p.name} · +91 {p.number}
              </p>
            ))}
          </div>
          <div style={{ borderTop: "1.5pt solid var(--crimson)", paddingTop: "3mm" }}>
            <p className="bro-label bro-label-red">{registrationHelpline.label}</p>
            <p className="bro-h2" style={{ fontSize: "13pt", margin: "2.5mm 0 1mm", color: "var(--crimson)" }}>
              {registrationHelpline.name} · +91 {registrationHelpline.number}
            </p>
            <p className="bro-label" style={{ marginTop: "5mm" }}>Website</p>
            <p style={{ marginTop: "1mm" }}>
              <a className="bro-url" href={LINK.site}>{LINK.site.replace(/^https?:\/\//, "")}</a>
            </p>
            <p className="bro-label" style={{ marginTop: "5mm" }}>Dates &amp; city</p>
            <p className="bro-h3" style={{ marginTop: "1mm" }}>{conference.dates.label}</p>
            <p className="bro-note">{conference.city}</p>
          </div>
        </div>

        <div style={{ marginTop: "10mm", borderTop: "1.5pt solid var(--crimson)", paddingTop: "4mm" }}>
          <p className="bro-label bro-label-red" style={{ letterSpacing: ".26em" }}>
            Learn it · Do it · Challenge it · Innovate it
          </p>
          <p className="bro-note" style={{ marginTop: "2mm" }}>
            Under the aegis of the {conference.association}
          </p>
        </div>
      </Page>
    </div>
  );
}
