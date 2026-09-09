import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./brochure.css";
import {
  about,
  conference,
  days,
  executiveCommittee,
  highlights,
  leadership,
  messages,
  patrons,
  programmeOverview,
  registrationHelpline,
  secretariat,
  venues,
  closingPromises,
} from "@/data/conference";
import { conferenceConfig } from "@/config/conference.config";
import { pricingTiers } from "@/config/pricing.config";

/**
 * DELEGATE BROCHURE — a print route, rendered to PDF by Chromium.
 *
 * It imports the SAME data modules the website renders from, so a fee, a rule
 * or a phone number can never drift between the site and the brochure: change
 * conference.ts or the config and re-render. Nothing here is transcribed.
 *
 * The client's own trade brochure (V5) is industry-facing — venues, leadership,
 * session-by-session programme and technology labs, but no fees, no abstract
 * rules and no registration. This is the delegate counterpart and deliberately
 * carries exactly those, in the same visual language.
 *
 * Render it with: node scripts/render-brochure.mjs
 */
export const metadata: Metadata = {
  title: `Delegate Brochure — ${conference.name}`,
  robots: { index: false, follow: false },
};

const RAW_SITE = conferenceConfig.contact.website.replace(/\/$/, "");
/**
 * A brochure is printed and handed out — a localhost link in it is dead
 * forever, for everyone. conferenceConfig.contact.website prefers
 * NEXT_PUBLIC_APP_URL, which in a dev environment is a loopback address, so
 * every button here silently pointed at http://localhost. Reject any loopback
 * or private base and fall back to the canonical public domain.
 */
const SITE = /^https?:\/\/(localhost|127\.|0\.0\.0\.0|\[?::1|192\.168\.|10\.)/i.test(RAW_SITE)
  ? "https://iactstechnocollegecme2026.com"
  : RAW_SITE;
const HEAD_MARK = "Future Is Now · Hyderabad 2026";

/** Absolute URLs so every button is a working link inside the PDF. */
const LINK = {
  register: `${SITE}/register`,
  abstracts: `${SITE}/abstracts`,
  fees: `${SITE}/pricing`,
  programme: `${SITE}/programme`,
  workshops: `${SITE}/workshops`,
  committee: `${SITE}/committee`,
  venue: `${SITE}/venue`,
  contact: `${SITE}/contact`,
  site: SITE,
};

function Page({
  n,
  eyebrow,
  children,
  cover = false,
}: {
  n?: string;
  eyebrow?: string;
  children: ReactNode;
  cover?: boolean;
}) {
  return (
    <section className={`bro-page${cover ? " bro-cover" : ""}`}>
      {!cover ? (
        <>
          <div className="bro-rule" />
          <header className="bro-head">
            <span className="bro-head-mark">{eyebrow ?? ""}</span>
            <span className="bro-head-mark">{HEAD_MARK}</span>
          </header>
        </>
      ) : null}
      <div className="bro-body">{children}</div>
      {!cover ? (
        <footer className="bro-foot">
          <span className="bro-foot-name">{conference.name}</span>
          <span className="bro-foot-num">{n}</span>
        </footer>
      ) : null}
    </section>
  );
}

export default function BrochurePage() {
  const [chairman, secretary] = messages;
  const { dayZero, scientific, domains, breakthrough } = programmeOverview;
  const bank = conferenceConfig.payment.bankDetails;
  const abstractRules = conferenceConfig.abstracts.submissionRules ?? [];
  const deadline = conferenceConfig.abstracts.submissionWindow?.end;
  const deadlineLabel = deadline
    ? new Date(deadline).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
    : "To be announced";

  const feeRows = ["resident", "iacts-member", "non-member"] as const;
  /* Tier config fields are optional in the type, so they are narrowed HERE once
     via flatMap rather than guarded at each of the six read sites. A tier
     missing a label or a date drops out of the table entirely — it must never
     print "undefined" as a deadline on a brochure. */
  const TIER_KEYS = ["earlyBird", "regular", "onsite"] as const;
  const tierOrder = TIER_KEYS.flatMap((key) => {
    const cfg = conferenceConfig.payment.tiers[key];
    return cfg?.label && cfg?.startDate && cfg?.endDate
      ? [{ key, label: cfg.label, startDate: cfg.startDate, endDate: cfg.endDate }]
      : [];
  });
  const earlyBird = tierOrder[0];
  const dmy = (iso: string) =>
    new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });

  return (
    <div className="bro">
      {/* ============================ 01 · COVER ============================ */}
      <Page cover>
        <div style={{ display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between" }}>
          <div>
            <p className="bro-head-mark" style={{ color: "rgba(255,255,255,.55)" }}>{HEAD_MARK}</p>
            <div style={{ height: "2px", background: "var(--crimson)", width: "28mm", marginTop: "4mm" }} />
          </div>

          <div className="bro-cover-ph">
            <p className="bro-label">Cover artwork — placeholder</p>
            <p className="bro-p" style={{ margin: "3mm 0 0", color: "rgba(255,255,255,.6)" }}>
              Final cover to be supplied. Everything after this page is complete.
            </p>
          </div>

          <div>
            <p className="bro-eyebrow" style={{ color: "var(--crimson)" }}>
              Delegate Brochure
            </p>
            <h1 className="bro-h1">
              IACTS
              <br />
              TechnoCollege
              <br />
              CME 2026
            </h1>
            <p className="bro-lead" style={{ color: "#fff", fontWeight: 700, margin: "0 0 3mm" }}>
              {conference.theme}
            </p>
            <p className="bro-p" style={{ margin: 0 }}>
              {conference.dates.label} · {conference.city}
            </p>
            <p className="bro-p" style={{ margin: "1mm 0 0" }}>
              Under the aegis of the {conference.association}
            </p>
            <p className="bro-p" style={{ margin: "1mm 0 0" }}>
              Convened by {conference.organisedBy}
            </p>
          </div>

          <div style={{ borderTop: "1px solid rgba(255,255,255,.18)", paddingTop: "4mm" }}>
            <p className="bro-tagline">Learn it. Do it. Challenge it. Innovate it.</p>
          </div>
        </div>
      </Page>

      {/* ====================== 02 · WELCOME · CHAIRMAN ===================== */}
      <Page n="02" eyebrow="Welcome · Organising Chairman">
        <p className="bro-eyebrow">Welcome · Message</p>
        <h1 className="bro-h1">
          From the <span className="bro-serif">Organising Chairman</span>
        </h1>

        <div style={{ display: "grid", gridTemplateColumns: "30mm 1fr", gap: "7mm", alignItems: "start" }}>
          <div>
            <img
              src={chairman.portrait}
              alt={chairman.name}
              style={{ width: "30mm", height: "37mm", objectFit: "cover", objectPosition: "50% 20%", border: "1px solid var(--hair)" }}
            />
            <p className="bro-label" style={{ marginTop: "2.5mm" }}>{chairman.role}</p>
            <p className="bro-h3" style={{ margin: 0 }}>{chairman.name}</p>
          </div>
          <div>
            <p className="bro-label" style={{ color: "var(--crimson)", letterSpacing: ".18em" }}>
              {chairman.salutation}
            </p>
            {chairman.paragraphs.map((t) => (
              <p key={t.slice(0, 40)} className="bro-p">{t}</p>
            ))}
          </div>
        </div>

        <div className="bro-panel" style={{ marginTop: "5mm" }}>
          <p className="bro-p" style={{ margin: 0 }}>
            <strong>{chairman.name}</strong> · {chairman.role}, {conference.name}
          </p>
        </div>
      </Page>

      {/* ====================== 03 · WELCOME · SECRETARY ==================== */}
      <Page n="03" eyebrow="Welcome · Organising Secretary">
        <p className="bro-eyebrow">Welcome · Message</p>
        <h1 className="bro-h1">
          From the <span className="bro-serif">Organising Secretary</span>
        </h1>

        <div style={{ display: "grid", gridTemplateColumns: "30mm 1fr", gap: "7mm", alignItems: "start" }}>
          <div>
            <img
              src={secretary.portrait}
              alt={secretary.name}
              style={{ width: "30mm", height: "37mm", objectFit: "cover", objectPosition: "50% 20%", border: "1px solid var(--hair)" }}
            />
            <p className="bro-label" style={{ marginTop: "2.5mm" }}>{secretary.role}</p>
            <p className="bro-h3" style={{ margin: 0 }}>{secretary.name}</p>
          </div>
          <div>
            <p className="bro-label" style={{ color: "var(--crimson)", letterSpacing: ".18em" }}>
              {secretary.salutation}
            </p>
            {secretary.paragraphs.map((t) => (
              <p key={t.slice(0, 40)} className="bro-p">{t}</p>
            ))}
          </div>
        </div>

        <div className="bro-panel" style={{ marginTop: "5mm" }}>
          <p className="bro-tagline" style={{ margin: 0 }}>The future is now — and we invite you to be part of it.</p>
        </div>
      </Page>
      {/* ==================== 04 · ABOUT / OVERVIEW ======================== */}
      <Page n="04" eyebrow="About · Conference Overview">
        <p className="bro-eyebrow">About the CME</p>
        <h1 className="bro-h1">{about.heading}</h1>

        <p className="bro-p bro-lead">{about.lede}</p>
        <p className="bro-p">{about.body}</p>

        <div className="bro-grid bro-g4" style={{ margin: "5mm 0", gap: "2.5mm" }}>
          {about.verbs.map((verb) => (
            <div
              key={verb}
              style={{
                border: "1px solid var(--crimson)",
                padding: "2.6mm 1mm",
                textAlign: "center",
              }}
            >
              <span className="bro-num" style={{ letterSpacing: ".14em" }}>{verb.toUpperCase()}</span>
            </div>
          ))}
          <div style={{ border: "1px solid var(--crimson)", padding: "2.6mm 1mm", textAlign: "center" }}>
            <span className="bro-num" style={{ letterSpacing: ".14em" }}>&amp; MORE</span>
          </div>
        </div>

        <div className="bro-quote">
          <p className="bro-p" style={{ margin: 0, color: "var(--ink)" }}>{about.closing}</p>
        </div>

        <div style={{ borderTop: "1px solid var(--hair)", paddingTop: "4mm", marginTop: "1mm" }}>
          <p className="bro-label">How the three days work</p>
          <div className="bro-row-2col">
            <span className="bro-num">01</span>
            <span>
              <strong style={{ fontSize: "9.6pt" }}>{dayZero.label} · {days[0].date}</strong>
              <span className="bro-small" style={{ display: "block" }}>
                {dayZero.heading} — {venues[0].full}, Hyderabad
              </span>
            </span>
          </div>
          <div className="bro-row-2col">
            <span className="bro-num">02</span>
            <span>
              <strong style={{ fontSize: "9.6pt" }}>{scientific.label} · {days[1].date}</strong>
              <span className="bro-small" style={{ display: "block" }}>
                Scientific Programme — {venues[1].full}, Hyderabad
              </span>
            </span>
          </div>
        </div>

        <p className="bro-small" style={{ marginTop: "4mm" }}>
          Convened by {conference.organisedBy} · Under the aegis of the {conference.association}
        </p>
      </Page>

      {/* ================= 05 · DAY ZERO / PRE-CONFERENCE =================== */}
      <Page n="05" eyebrow="Programme · Day Zero">
        <p className="bro-eyebrow">Day Zero · {days[0].date}</p>
        <h1 className="bro-h1">{dayZero.heading}</h1>
        <p className="bro-small" style={{ marginTop: "-3mm", marginBottom: "4mm" }}>
          {dayZero.venue}
        </p>

        <p className="bro-p bro-lead">{dayZero.body}</p>

        <p className="bro-label" style={{ marginTop: "5mm" }}>The tracks</p>
        <div>
          {days[0].items.map((item, i) => (
            <div key={item.title} className="bro-row">
              <span className="bro-num">{String(i + 1).padStart(2, "0")}</span>
              <span className="bro-h3" style={{ margin: 0 }}>{item.title}</span>
              <span className="bro-label" style={{ margin: 0 }}>{item.tag}</span>
            </div>
          ))}
        </div>

        <p className="bro-label" style={{ marginTop: "5mm" }}>Skills covered</p>
        <div className="bro-grid bro-g2" style={{ gap: "0 6mm" }}>
          {dayZero.skills.map((skill, i) => (
            <div key={skill} className="bro-row-2col">
              <span className="bro-num">{String(i + 1).padStart(2, "0")}</span>
              <span style={{ fontSize: "9.4pt" }}>{skill}</span>
            </div>
          ))}
        </div>

        <div className="bro-panel" style={{ marginTop: "5mm" }}>
          <p className="bro-label">Seats</p>
          <p className="bro-p" style={{ margin: 0 }}>
            Workshop places are limited and allocated with registration. Select your workshop preference in the
            registration form; the secretariat will write to confirm your place. Per-track seat counts to be announced.
          </p>
        </div>

        <p className="bro-tagline" style={{ marginTop: "4mm" }}>Learn it. Do it. Challenge it.</p>
      </Page>

      {/* ============== 06 · SCIENTIFIC PROGRAMME / DOMAINS ================= */}
      <Page n="06" eyebrow="Programme · Scientific Days">
        <p className="bro-eyebrow">{scientific.label} · {days[1].date}</p>
        <h1 className="bro-h1">
          Beyond conventional <span className="bro-serif">CME learning</span>
        </h1>
        <p className="bro-small" style={{ marginTop: "-3mm", marginBottom: "4mm" }}>{scientific.venue}</p>

        <p className="bro-p bro-lead">{scientific.body}</p>

        <div style={{ marginTop: "4mm" }}>
          {domains.map((d) => (
            <div key={d.code} className="bro-row-2col" style={{ padding: "3.4mm 0" }}>
              <span className="bro-num">{d.code}</span>
              <span>
                <span className="bro-h2" style={{ fontSize: "13pt", margin: 0, display: "block" }}>{d.title}</span>
                {"note" in d && d.note ? (
                  <span className="bro-label" style={{ marginTop: "1mm" }}>{d.note}</span>
                ) : null}
              </span>
            </div>
          ))}
        </div>

        <div className="bro-panel" style={{ marginTop: "6mm" }}>
          <p className="bro-label">A distinctive feature</p>
          <h2 className="bro-h2" style={{ fontSize: "15pt" }}>{breakthrough.heading}</h2>
          <p className="bro-p" style={{ margin: 0 }}>{breakthrough.body}</p>
        </div>

        <p className="bro-label" style={{ marginTop: "5mm" }}>
          Session timings and faculty to be announced
        </p>
        <div className="bro-btn-row" style={{ marginTop: "3mm" }}>
          <a className="bro-btn" href={LINK.programme}>Full programme online</a>
          <a className="bro-url" href={LINK.programme}>{LINK.programme.replace(/^https?:\/\//, "")}</a>
        </div>
      </Page>

      {/* =================== 07 · HIGHLIGHTS AT A GLANCE ==================== */}
      <Page n="07" eyebrow="Programme · Highlights">
        <p className="bro-eyebrow">Scientific Highlights</p>
        <h1 className="bro-h1">
          Eight <span className="bro-serif">highlights</span>
        </h1>
        <p className="bro-p" style={{ maxWidth: "120mm" }}>
          The eight areas the programme is built around, as published by the organising committee.
        </p>

        <div className="bro-grid bro-g2" style={{ marginTop: "4mm", gap: "3mm" }}>
          {highlights.map((h, i) => (
            <div key={h.title} className="bro-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span className="bro-h3" style={{ margin: 0 }}>{h.title}</span>
                <span className="bro-num">{String(i + 1).padStart(2, "0")}</span>
              </div>
              <p className="bro-label" style={{ marginTop: "1.2mm" }}>{h.sub}</p>
              <ul style={{ margin: "2mm 0 0", padding: 0, listStyle: "none" }}>
                {h.points.map((pt) => (
                  <li key={pt} className="bro-small" style={{ marginBottom: "0.8mm" }}>· {pt}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="bro-grid" style={{ gridTemplateColumns: `repeat(${closingPromises.length}, 1fr)`, marginTop: "5mm", gap: "2mm" }}>
          {closingPromises.map((p) => (
            <div key={p} style={{ borderTop: "2px solid var(--crimson)", paddingTop: "2mm" }}>
              <span className="bro-label" style={{ color: "var(--ink)" }}>{p}</span>
            </div>
          ))}
        </div>
      </Page>
      {/* ====================== 08 · REGISTRATION FEES ====================== */}
      <Page n="08" eyebrow="Registration · Fees">
        <p className="bro-eyebrow">Registration</p>
        <h1 className="bro-h1">
          Registration <span className="bro-serif">fees</span>
        </h1>
        <p className="bro-p bro-lead">
          Fees are charged at the tier active on the date payment is received. All amounts in {conferenceConfig.payment.currency} and
          inclusive of GST.
        </p>

        <table className="bro-table" style={{ marginTop: "3mm" }}>
          <thead>
            <tr>
              <th>Category</th>
              {tierOrder.map((t, i) => (
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
                {tierOrder.map((t, i) => {
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

        <div className="bro-panel" style={{ marginTop: "5mm" }}>
          <p className="bro-label">Included with Early Bird</p>
          <p className="bro-p" style={{ margin: 0 }}>
            <strong>Complimentary twin-sharing accommodation at the venue.</strong> Early Bird rates apply until{" "}
            {earlyBird ? dmy(earlyBird.endDate) : "the published date"}. Concessional categories require proof of eligibility.
          </p>
        </div>

        <div className="bro-grid bro-g3" style={{ marginTop: "5mm" }}>
          {tierOrder.map((t) => (
            <div key={t.key} className="bro-card">
              <p className="bro-label">{t.label}</p>
              <p className="bro-p" style={{ margin: 0, fontSize: "8.6pt" }}>
                {dmy(t.startDate)} — {dmy(t.endDate)}
              </p>
            </div>
          ))}
        </div>

        <div className="bro-btn-row" style={{ marginTop: "6mm" }}>
          <a className="bro-btn" href={LINK.register}>Register now</a>
          <a className="bro-btn bro-btn-ghost" href={LINK.fees}>Full fee details</a>
        </div>
        <p className="bro-small" style={{ marginTop: "2.5mm" }}>
          {LINK.register.replace(/^https?:\/\//, "")}
        </p>
      </Page>

      {/* ====================== 09 · HOW TO REGISTER ======================== */}
      <Page n="09" eyebrow="Registration · How to Register">
        <p className="bro-eyebrow">Registration</p>
        <h1 className="bro-h1">
          How to <span className="bro-serif">register</span>
        </h1>

        <div className="bro-grid bro-g2" style={{ gap: "6mm", alignItems: "start" }}>
          <div>
            <p className="bro-label">Four steps</p>
            {[
              ["01", "Register online", "Complete the delegate form on the conference website."],
              ["02", "Pay the fee", "Transfer by NEFT, IMPS or UPI using the account or QR opposite."],
              ["03", "Attach your proof", "Enter the UTR / transaction reference and upload the payment screenshot — both are required."],
              ["04", "Receive confirmation", "The secretariat matches your payment and issues your registration ID and QR pass by email."],
            ].map(([n, t, d]) => (
              <div key={n} className="bro-row-2col" style={{ padding: "2.8mm 0" }}>
                <span className="bro-num">{n}</span>
                <span>
                  <span className="bro-h3" style={{ margin: 0, display: "block" }}>{t}</span>
                  <span className="bro-small">{d}</span>
                </span>
              </div>
            ))}

            <p className="bro-label" style={{ marginTop: "4mm" }}>What you will be asked for</p>
            <p className="bro-p" style={{ margin: 0, fontSize: "8.8pt" }}>
              Name, email and mobile · designation and specialization · institution · medical registration number ·
              registration category · workshop preference · accommodation requirement · UTR and payment screenshot.
            </p>
          </div>

          <div>
            {bank ? (
              <div className="bro-panel">
                <p className="bro-label" style={{ color: "var(--crimson)" }}>Pay to this account</p>
                <p className="bro-small" style={{ marginTop: "2mm" }}>Account name</p>
                <p className="bro-p" style={{ margin: "0 0 2mm", color: "var(--ink)", fontWeight: 700, fontSize: "8.8pt" }}>
                  {bank.accountName}
                </p>
                <p className="bro-small">Account number</p>
                <p className="bro-p" style={{ margin: "0 0 2mm", color: "var(--ink)", fontWeight: 700 }}>
                  {bank.accountNumber}
                </p>
                <div style={{ display: "flex", gap: "6mm" }}>
                  <div>
                    <p className="bro-small">Bank</p>
                    <p className="bro-p" style={{ margin: 0, color: "var(--ink)", fontWeight: 700, fontSize: "8.8pt" }}>
                      {bank.bankName}
                    </p>
                  </div>
                  <div>
                    <p className="bro-small">IFSC</p>
                    <p className="bro-p" style={{ margin: 0, color: "var(--ink)", fontWeight: 700 }}>{bank.ifscCode}</p>
                  </div>
                </div>
                {bank.branchName ? (
                  <p className="bro-small" style={{ marginTop: "2mm" }}>{bank.branchName}</p>
                ) : null}
              </div>
            ) : null}

            <div className="bro-card" style={{ marginTop: "4mm", textAlign: "center" }}>
              <img className="bro-qr" src="/payment/qr.png" alt="UPI QR code for the registration fee" style={{ margin: "0 auto" }} />
              <p className="bro-label" style={{ marginTop: "2.5mm" }}>Scan to pay by UPI</p>
            </div>

            <div className="bro-card" style={{ marginTop: "4mm" }}>
              <p className="bro-label">{registrationHelpline.label}</p>
              <p className="bro-h3" style={{ margin: 0, color: "var(--crimson)" }}>
                {registrationHelpline.name} · +91 {registrationHelpline.number}
              </p>
            </div>
          </div>
        </div>

        <div className="bro-btn-row" style={{ marginTop: "5mm" }}>
          <a className="bro-btn" href={LINK.register}>Register online</a>
          <a className="bro-url" href={LINK.register}>{LINK.register.replace(/^https?:\/\//, "")}</a>
        </div>
      </Page>

      {/* ========================= 10 · ABSTRACTS =========================== */}
      <Page n="10" eyebrow="Abstracts · Submission">
        <p className="bro-eyebrow">Abstracts</p>
        <h1 className="bro-h1">
          Abstract <span className="bro-serif">submission</span>
        </h1>
        <p className="bro-p bro-lead">
          Abstracts and case reports are invited for the scientific programme. You do not choose the presentation
          format — the scientific committee reviews each submission and decides whether it is presented as a paper or a
          poster.
        </p>

        <div className="bro-panel" style={{ marginTop: "1mm", display: "flex", alignItems: "baseline", gap: "6mm" }}>
          <span className="bro-label" style={{ margin: 0 }}>Last date for submission</span>
          <span style={{ fontSize: "19pt", fontWeight: 800, letterSpacing: "-.02em", color: "var(--crimson)" }}>
            {deadlineLabel}
          </span>
        </div>

        <p className="bro-label" style={{ marginTop: "5mm" }}>Submission rules</p>
        <div className="bro-grid bro-g2" style={{ gap: "0 7mm" }}>
          {abstractRules.map((rule, i) => (
            <div key={rule} className="bro-row-2col" style={{ padding: "2mm 0" }}>
              <span className="bro-num">{String(i + 1).padStart(2, "0")}</span>
              <span className="bro-small" style={{ color: "var(--muted)" }}>{rule}</span>
            </div>
          ))}
        </div>

        <div className="bro-grid bro-g2" style={{ marginTop: "5mm", gap: "4mm" }}>
          <div className="bro-card">
            <p className="bro-label">Where to submit</p>
            <p className="bro-p" style={{ margin: "0 0 3mm", fontSize: "8.8pt" }}>
              Online only, through the conference website. Conference registration is mandatory before you submit.
            </p>
            <a className="bro-btn" href={LINK.abstracts}>Submit an abstract</a>
            <p className="bro-small" style={{ marginTop: "2.5mm" }}>
              <a className="bro-url" href={LINK.abstracts}>{LINK.abstracts.replace(/^https?:\/\//, "")}</a>
            </p>
          </div>
          <div className="bro-card">
            <p className="bro-label">Not registered yet?</p>
            <p className="bro-p" style={{ margin: "0 0 3mm", fontSize: "8.8pt" }}>
              Register first, then submit from your delegate account. Queries to the secretariat.
            </p>
            <a className="bro-btn bro-btn-ghost" href={LINK.register}>Register first</a>
            <p className="bro-small" style={{ marginTop: "2.5mm" }}>
              <a className="bro-url" href={`mailto:${conferenceConfig.abstracts ? conferenceConfig.contact.abstractsEmail : conferenceConfig.contact.email}`}>
                {conferenceConfig.contact.abstractsEmail}
              </a>
            </p>
          </div>
        </div>
      </Page>

      {/* ===================== 11 · VENUES & HYDERABAD ====================== */}
      <Page n="11" eyebrow="Venue · Host City">
        <p className="bro-eyebrow">Where it happens</p>
        <h1 className="bro-h1">
          The <span className="bro-serif">venues</span>
        </h1>
        <p className="bro-p">
          Two landmark institutions across Hyderabad host the workshop and the scientific programme.
        </p>

        <div className="bro-grid bro-g2" style={{ marginTop: "2mm" }}>
          {venues.map((v, i) => (
            <div key={v.id} className="bro-card">
              <p className="bro-label" style={{ color: "var(--crimson)" }}>{i === 0 ? "Day 0" : "Day 1 · 2"}</p>
              <p className="bro-h3" style={{ margin: "1mm 0 0" }}>{v.name}</p>
              <p className="bro-small" style={{ marginTop: "1mm" }}>{v.full}</p>
              <p className="bro-small" style={{ marginTop: "1.5mm" }}>{v.address}</p>
              <p className="bro-label" style={{ marginTop: "2mm" }}>{v.hosts}</p>
            </div>
          ))}
        </div>

        <div className="bro-panel" style={{ marginTop: "4mm" }}>
          <p className="bro-label">Getting there</p>
          <p className="bro-p" style={{ margin: 0 }}>
            Both venues are centrally located in Hyderabad with easy access from Rajiv Gandhi International Airport and
            the city centre. Travel notes and recommended stays will be shared with registered delegates.
          </p>
        </div>

        <p className="bro-eyebrow" style={{ marginTop: "6mm" }}>Explore Hyderabad</p>
        <h2 className="bro-h2">A city of heritage and of medicine</h2>
        <p className="bro-p" style={{ maxWidth: "125mm" }}>
          A city that combines a rich cultural heritage with a rapidly growing ecosystem of medicine, technology,
          innovation and entrepreneurship — the spirit of this conference.
        </p>

        <div className="bro-grid bro-g3" style={{ marginTop: "2mm", gap: "3mm" }}>
          {[
            ["Golconda Fort", "16th century", "The granite citadel of the Qutb Shahi kings, famous for acoustics that carry a handclap from the gateway to the summit."],
            ["Salar Jung Museum", "Collection", "One of the largest one-man collections in the world — sculpture, manuscripts and textiles gathered across continents."],
            ["Hussain Sagar", "Heart of the city", "The lake separating Hyderabad from Secunderabad, with the monolithic Buddha statue at its centre."],
            ["Birla Mandir", "Naubath Pahad", "A white marble temple on the hill above Hussain Sagar, with one of the widest views over the city."],
            ["Ramoji Film City", "Day trip", "The world's largest integrated film studio complex, on the eastern edge of the city."],
            ["HITEC City", "Modern Hyderabad", "The technology and biotech corridor that made Hyderabad a centre for research, pharma and medical innovation."],
          ].map(([name, tag, blurb]) => (
            <div key={name} className="bro-card" style={{ padding: "3mm 3.5mm" }}>
              <p className="bro-h3" style={{ margin: 0, fontSize: "9.4pt" }}>{name}</p>
              <p className="bro-label" style={{ marginTop: "0.8mm" }}>{tag}</p>
              <p className="bro-small" style={{ marginTop: "1.5mm" }}>{blurb}</p>
            </div>
          ))}
        </div>
      </Page>

      {/* ======================== 12 · LEADERSHIP =========================== */}
      <Page n="12" eyebrow="Leadership · Organising Committee">
        <p className="bro-eyebrow">Leadership</p>
        <h1 className="bro-h1">
          Organising <span className="bro-serif">committee</span>
        </h1>

        <p className="bro-label">Patrons</p>
        <div className="bro-grid bro-g2" style={{ marginBottom: "5mm" }}>
          {patrons.map((p) => (
            <div key={p.name} style={{ display: "flex", gap: "4mm", alignItems: "flex-start" }}>
              <img
                src={p.portrait}
                alt={p.name}
                style={{ width: "18mm", height: "22mm", objectFit: "cover", objectPosition: "50% 20%", border: "1px solid var(--hair)" }}
              />
              <span>
                <span className="bro-h3" style={{ margin: 0, display: "block" }}>{p.name}</span>
                <span className="bro-label" style={{ marginTop: "1mm" }}>{p.title}</span>
                <span className="bro-small">{p.role}</span>
              </span>
            </div>
          ))}
        </div>

        <p className="bro-label">Organising committee</p>
        <div className="bro-grid" style={{ gridTemplateColumns: "repeat(5, 1fr)", gap: "3mm", marginBottom: "5mm" }}>
          {leadership.map((l) => (
            <div key={l.name}>
              <img
                src={l.portrait}
                alt={l.name}
                style={{ width: "100%", height: "26mm", objectFit: "cover", objectPosition: "50% 20%", border: "1px solid var(--hair)" }}
              />
              <p className="bro-h3" style={{ margin: "1.5mm 0 0", fontSize: "8.6pt" }}>{l.name}</p>
              <p className="bro-label" style={{ marginTop: "0.6mm", fontSize: "5.8pt" }}>{l.role}</p>
            </div>
          ))}
        </div>

        <p className="bro-label">Executive committee</p>
        <div className="bro-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", gap: "1.5mm 4mm" }}>
          {executiveCommittee.map((m, i) => (
            <div key={m.name} style={{ display: "flex", gap: "2.5mm", alignItems: "baseline", borderBottom: "1px solid var(--hair)", padding: "1.6mm 0" }}>
              <span className="bro-num">{String(i + 1).padStart(2, "0")}</span>
              <span style={{ fontSize: "8.6pt" }}>{m.name}</span>
            </div>
          ))}
        </div>

        <p className="bro-small" style={{ marginTop: "5mm" }}>
          Conference Secretariat · {secretariat.department}, {secretariat.city} · {secretariat.email}
        </p>
        <div className="bro-btn-row" style={{ marginTop: "3mm" }}>
          <a className="bro-btn bro-btn-ghost" href={LINK.committee}>Full committee online</a>
        </div>
      </Page>

      {/* ========================== 13 · END PAGE =========================== */}
      <Page n="13" eyebrow="Contact · Register">
        <p className="bro-eyebrow">Join us in Hyderabad</p>
        <h1 className="bro-h1">
          The future <span className="bro-serif">is now</span>
        </h1>
        <p className="bro-p bro-lead" style={{ maxWidth: "130mm" }}>
          {conference.closing}
        </p>

        <div className="bro-btn-row" style={{ margin: "6mm 0" }}>
          <a className="bro-btn" href={LINK.register}>Register now</a>
          <a className="bro-btn bro-btn-ghost" href={LINK.abstracts}>Submit an abstract</a>
          <a className="bro-btn bro-btn-ghost" href={LINK.site}>Conference website</a>
        </div>

        <div className="bro-grid bro-g2" style={{ gap: "5mm" }}>
          <div className="bro-panel">
            <p className="bro-label" style={{ color: "var(--crimson)" }}>Conference secretariat</p>
            <p className="bro-p" style={{ margin: "2mm 0 0", color: "var(--ink)", fontWeight: 700 }}>
              {secretariat.department}
            </p>
            <p className="bro-small">{secretariat.city}</p>
            <p className="bro-small" style={{ marginTop: "2mm" }}>
              <a className="bro-url" href={`mailto:${secretariat.email}`}>{secretariat.email}</a>
            </p>
            {secretariat.phones.map((p) => (
              <p key={p.number} className="bro-p" style={{ margin: "2mm 0 0", fontSize: "8.8pt", color: "var(--crimson)", fontWeight: 700 }}>
                {p.name} · +91 {p.number}
              </p>
            ))}
          </div>
          <div className="bro-card">
            <p className="bro-label">{registrationHelpline.label}</p>
            <p className="bro-h3" style={{ margin: "1mm 0 0", color: "var(--crimson)" }}>
              {registrationHelpline.name} · +91 {registrationHelpline.number}
            </p>
            <p className="bro-label" style={{ marginTop: "4mm" }}>Conference website</p>
            <p className="bro-small">
              <a className="bro-url" href={LINK.site}>{LINK.site.replace(/^https?:\/\//, "")}</a>
            </p>
            <p className="bro-label" style={{ marginTop: "4mm" }}>Dates &amp; city</p>
            <p className="bro-p" style={{ margin: 0, color: "var(--ink)", fontWeight: 700 }}>
              {conference.dates.label}
            </p>
            <p className="bro-small">{conference.city}</p>
          </div>
        </div>

        <div style={{ borderTop: "2px solid var(--crimson)", marginTop: "6mm", paddingTop: "4mm" }}>
          <p className="bro-tagline">Learn it. Do it. Challenge it. Innovate it.</p>
          <p className="bro-small" style={{ marginTop: "2mm" }}>
            Operate well · Think critically · Innovate responsibly
          </p>
        </div>
      </Page>
    </div>
  );
}
