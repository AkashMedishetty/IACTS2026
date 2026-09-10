import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./brochure.css";
import {
  about,
  closingPromises,
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
 * TEN PAGES, NOTHING CUT. The previous version ran to 21 because each session
 * block got its own page. Everything still here; the schedule now flows in
 * balanced CSS columns and related sections share a page. Two things were
 * genuinely MISSING from the 21-page version and are restored: the eight
 * scientific `highlights` and `closingPromises` were imported but never
 * rendered.
 *
 * It imports the SAME data modules the website renders from, so a fee, a rule,
 * a phone number or a committee name cannot drift between site and brochure.
 * The session-by-session programme comes from data/programme.ts, transcribed
 * from the client's own trade brochure V5.
 *
 * `<img>` rather than next/image throughout, deliberately: next/image lazy-loads
 * and swaps in placeholders, which in a headless print render can commit a blank
 * box to the PDF.
 *
 * Render:  node scripts/render-brochure.mjs
 */
export const metadata: Metadata = {
  title: `Delegate Brochure — ${conference.name}`,
  robots: { index: false, follow: false },
};

const RAW_SITE = conferenceConfig.contact.website.replace(/\/$/, "");
/**
 * A brochure is printed and handed out — a localhost link in it is dead forever.
 * conferenceConfig.contact.website prefers NEXT_PUBLIC_APP_URL, which in a dev
 * environment is a loopback address, so every button here silently pointed at
 * http://localhost. Reject loopback/private and use the canonical public domain.
 */
const SITE = /^https?:\/\/(localhost|127\.|0\.0\.0\.0|\[?::1|192\.168\.|10\.)/i.test(RAW_SITE)
  ? "https://iactstechnocollegecme2026.com"
  : RAW_SITE;

const LINK = {
  register: `${SITE}/register`,
  abstracts: `${SITE}/abstracts`,
  fees: `${SITE}/pricing`,
  programme: `${SITE}/programme`,
  site: SITE,
};

const MARK = "Future Is Now · Hyderabad 2026";

function Page({
  n,
  section,
  children,
  cover = false,
  dense = false,
  sched = false,
}: {
  n?: string;
  section?: string;
  children: ReactNode;
  cover?: boolean;
  dense?: boolean;
  sched?: boolean;
}) {
  return (
    <section
      className={`bro-page${cover ? " bro-cover" : ""}${dense ? " bro-dense" : ""}${sched ? " bro-sched" : ""}`}
    >
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

function Split({ rail, children, wide = false }: { rail: ReactNode; children: ReactNode; wide?: boolean }) {
  return (
    <div className={`bro-split${wide ? " bro-split-wide" : ""}`}>
      <div className="bro-rail">{rail}</div>
      <div>{children}</div>
    </div>
  );
}

function SlotRow({ s }: { s: Slot }) {
  return (
    <div className={`bro-slot${s.kind ? ` is-${s.kind}` : ""}`}>
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
        <p className="bro-h3" style={{ fontSize: "9.4pt" }}>{b.title}</p>
        <p className="bro-label">{b.window ?? ""}</p>
      </div>
      {b.slots.map((s) => (
        <SlotRow key={`${s.time ?? ""}${s.title}`} s={s} />
      ))}
      {b.note ? <p className="bro-note" style={{ marginTop: "1.8mm" }}>{b.note}</p> : null}
    </div>
  );
}

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
      {/* ========================== 01 · COVER ============================= */}
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
            <div style={{ height: "1.5pt", background: "var(--crimson)", width: "26mm", marginBottom: "6mm" }} />
            <p className="bro-display" style={{ marginBottom: "4mm" }}>
              The future
              <br />
              <span className="bro-em">is now</span>
            </p>
            <p className="bro-lede" style={{ color: "var(--paper)", maxWidth: "118mm", marginBottom: "5mm" }}>
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

          {/* Replaces the old standalone contents page — a ten-page document
              does not need a full-page table of contents. */}
          <div style={{ borderTop: "0.5pt solid rgba(255,254,253,.22)", paddingTop: "4mm" }}>
            <p className="bro-label" style={{ marginBottom: "2mm" }}>Inside</p>
            <p className="bro-note" style={{ color: "rgba(255,254,253,.62)", lineHeight: 1.75 }}>
              02 Welcome · 03 About &amp; the three-day shape · 04 Day 0 and the technology labs · 05 Day 1 ·
              06 Day 2 · 07 CVTS 2035 &amp; scientific highlights · 08 Fees and how to register · 09 Abstracts,
              venues &amp; Hyderabad · 10 Committee and contact
            </p>
            <p className="bro-label" style={{ marginTop: "4mm", letterSpacing: ".26em" }}>
              Learn it · Do it · Challenge it · Innovate it
            </p>
          </div>
        </div>
      </Page>

      {/* ===================== 02 · WELCOME (BOTH) ========================= */}
      <Page n="02" section="Welcome" dense>
        <p className="bro-kicker">Messages from the organising office-bearers</p>
        <div className="bro-hr-heavy" />
        <p className="bro-display" style={{ marginBottom: "5mm" }}>
          The future is no longer something we are <span className="bro-em">waiting for</span>
        </p>

        <div className="bro-cols bro-c2" style={{ gap: "8mm" }}>
          {[chairman, secretary].map((m) => (
            <div key={m.id}>
              <div style={{ display: "flex", gap: "4mm", alignItems: "flex-start", marginBottom: "3mm" }}>
                <img
                  className="bro-por"
                  src={m.portrait}
                  alt={m.name}
                  style={{ width: "20mm", flex: "none" }}
                />
                <div>
                  <p className="bro-label bro-label-red">{m.role}</p>
                  <p className="bro-h2" style={{ fontSize: "12.5pt", marginTop: "1.5mm" }}>{m.name}</p>
                </div>
              </div>
              <p className="bro-label bro-label-red" style={{ marginBottom: "2mm" }}>{m.salutation}</p>
              {m.paragraphs.map((t) => (
                <p key={t.slice(0, 36)} className="bro-p" style={{ fontSize: "7.9pt", lineHeight: 1.56 }}>
                  {t}
                </p>
              ))}
              <p className="bro-note" style={{ marginTop: "2.5mm", borderTop: "0.5pt solid var(--hair)", paddingTop: "2mm" }}>
                {m.name} · {m.role}
              </p>
            </div>
          ))}
        </div>
      </Page>

      {/* ============ 03 · ABOUT + DOMAINS + FLOW + FORMATS ================ */}
      <Page n="03" section="About · Programme shape" dense>
        <p className="bro-kicker">About the CME</p>
        <div className="bro-hr-heavy" />
        <p className="bro-display">{about.heading}</p>

        <Split
          rail={
            <>
              <p className="bro-label">Conceived for</p>
              <p className="bro-note">Postgraduate students and young surgeons early in their careers.</p>
              <p className="bro-label" style={{ marginTop: "4mm" }}>A platform to</p>
              {about.verbs.map((v) => (
                <p key={v} className="bro-mono" style={{ marginTop: "1.2mm" }}>{v}</p>
              ))}
            </>
          }
        >
          <p className="bro-lede">{about.lede}</p>
          <p className="bro-p">{about.body}</p>
          <p className="bro-p" style={{ color: "var(--ink)" }}>{about.closing}</p>

          <p className="bro-label bro-label-ink" style={{ marginTop: "4mm", marginBottom: "1.5mm" }}>
            Four scientific domains
          </p>
          <div className="bro-2col">
            {domains.map((d) => (
              <div key={d.code} className="bro-item">
                <p className="bro-mono">{d.code}</p>
                <div>
                  <p className="bro-h3">{d.title}</p>
                  {"note" in d && d.note ? <p className="bro-label" style={{ marginTop: "0.6mm" }}>{d.note}</p> : null}
                </div>
              </div>
            ))}
          </div>
        </Split>

        <div className="bro-hr" />

        <div className="bro-cols bro-c3" style={{ gap: "6mm", marginBottom: "4mm" }}>
          {threeDayFlow.map((d) => (
            <div key={d.label} style={{ borderTop: "1.5pt solid var(--crimson)", paddingTop: "2.5mm" }}>
              <p className="bro-label bro-label-red">{d.label}</p>
              <p className="bro-h3" style={{ margin: "1.5mm 0 1.5mm", fontSize: "10.5pt" }}>{d.title}</p>
              <p className="bro-note">{d.blurb}</p>
            </div>
          ))}
        </div>

        <p className="bro-label bro-label-ink" style={{ marginBottom: "1.5mm" }}>Signature formats</p>
        <div className="bro-3col">
          {signatureFormats.map((f, i) => (
            <div key={f} className="bro-item">
              <p className="bro-mono">{String(i + 1).padStart(2, "0")}</p>
              <p className="bro-note" style={{ color: "var(--ink)" }}>{f}</p>
            </div>
          ))}
        </div>
        <p className="bro-label bro-label-red" style={{ marginTop: "3.5mm", letterSpacing: ".2em" }}>
          Operate well · Think critically · Innovate responsibly
        </p>
      </Page>

      {/* =============== 04 · DAY 0 + TECHNOLOGY LABS ====================== */}
      <Page n="04" section={`${day0.label} · Workshops & Labs`} dense>
        <p className="bro-kicker">{day0.label} · {day0.date} · {day0.window} · {day0.venue}</p>
        <div className="bro-hr-heavy" />
        <p className="bro-display">{day0.title}</p>
        <p className="bro-lede">{day0.blurb}</p>

        <div className="bro-2col">
          {day0Stations.map((s) => (
            <div key={s.code} className="bro-item">
              <p className="bro-mono">{s.code}</p>
              <div>
                <p className="bro-h3">{s.title}</p>
                <p className="bro-note" style={{ marginTop: "0.8mm" }}>{s.blurb}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bro-panel bro-panel-edge" style={{ marginTop: "4mm" }}>
          <p className="bro-label bro-label-red">Learn it · Do it · Challenge it</p>
          <p className="bro-p" style={{ margin: "1.8mm 0 0", color: "var(--ink)" }}>
            {day0.closing} Workshop places are limited and allocated with registration — select your preference in the
            registration form.
          </p>
        </div>

        <div className="bro-hr" />

        <p className="bro-kicker" style={{ marginBottom: "2mm" }}>Industry × Surgeon · Technology Labs</p>
        <p className="bro-p" style={{ marginBottom: "2.5mm" }}>
          Built around hands-on education rather than sponsored lectures — six immersive labs run alongside the
          scientific programme.
        </p>
        <div className="bro-2col">
          {technologyLabs.map((l, i) => (
            <div key={l.title} className="bro-item">
              <p className="bro-mono">{String(i + 1).padStart(2, "0")}</p>
              <div>
                <p className="bro-h3">{l.title}</p>
                <p className="bro-note" style={{ marginTop: "0.8mm" }}>{l.blurb}</p>
              </div>
            </div>
          ))}
        </div>
      </Page>

      {/* ========================== 05 · DAY 1 ============================= */}
      <Page n="05" section={`${day1.label} · ${day1.date}`} dense sched>
        <p className="bro-kicker">
          {day1.label} · {day1.date} · {day1.window} · {day1.venue}
        </p>
        <div className="bro-hr-heavy" />
        <p className="bro-display">{day1.title}</p>

        <div className="bro-2col">
          {day1.blocks.map((b) => (
            <Session key={b.title} b={b} />
          ))}
          <div style={{ borderTop: "1pt solid var(--crimson)", paddingTop: "2.5mm", marginTop: "1mm" }}>
            <p className="bro-h3" style={{ fontSize: "10pt" }}>{youngSurgeonsToolkit.title}</p>
            <p className="bro-label" style={{ marginTop: "0.8mm" }}>{youngSurgeonsToolkit.window}</p>
            {youngSurgeonsToolkit.items.map((t) => (
              <div key={t.title} style={{ marginTop: "2mm" }}>
                <p className="bro-slot-title" style={{ fontWeight: 650 }}>{t.title}</p>
                <p className="bro-note">{t.blurb}</p>
              </div>
            ))}
          </div>
        </div>
      </Page>

      {/* ========================== 06 · DAY 2 ============================= */}
      <Page n="06" section={`${day2.label} · ${day2.date}`} dense sched>
        <p className="bro-kicker">
          {day2.label} · {day2.date} · {day2.window} · {day2.venue}
        </p>
        <div className="bro-hr-heavy" />
        <p className="bro-display">{day2.title}</p>

        <div className="bro-2col">
          {day2.blocks.map((b) => (
            <Session key={b.title} b={b} />
          ))}
        </div>
      </Page>

      {/* ============= 07 · CVTS 2035 + SCIENTIFIC HIGHLIGHTS ============== */}
      <Page n="07" section="CVTS 2035 · Highlights" dense>
        <p className="bro-kicker">{cvts2035.code} · {cvts2035.window}</p>
        <div className="bro-hr-heavy" />
        <p className="bro-display">{cvts2035.title}</p>
        <p className="bro-lede" style={{ fontStyle: "italic", marginBottom: "3mm" }}>{cvts2035.question}</p>

        <div className="bro-cols bro-c2" style={{ gap: "8mm", marginBottom: "3.5mm" }}>
          <div>
            <p className="bro-label bro-label-ink" style={{ marginBottom: "1.5mm" }}>On the table</p>
            <div className="bro-2col">
              {cvts2035.topics.map((t) => (
                <p key={t} className="bro-note" style={{ color: "var(--ink)", marginBottom: "1mm" }}>· {t}</p>
              ))}
            </div>
          </div>
          <div>
            <p className="bro-label bro-label-ink" style={{ marginBottom: "1.5mm" }}>Proposed panel</p>
            <div className="bro-2col">
              {cvts2035.panel.map((p) => (
                <p key={p} className="bro-note" style={{ color: "var(--ink)", marginBottom: "1mm" }}>· {p}</p>
              ))}
            </div>
          </div>
        </div>

        <div className="bro-panel bro-panel-edge">
          <p className="bro-label bro-label-red">{cvts2035.closing.title}</p>
          <p className="bro-p" style={{ margin: "1.8mm 0 0", color: "var(--ink)" }}>{cvts2035.closing.body}</p>
        </div>

        <div className="bro-hr" />

        <p className="bro-kicker" style={{ marginBottom: "2mm" }}>Scientific highlights</p>
        <div className="bro-2col">
          {highlights.map((h, i) => (
            <div key={h.title} className="bro-item" style={{ padding: "1.6mm 0" }}>
              <p className="bro-mono">{String(i + 1).padStart(2, "0")}</p>
              <div>
                <p className="bro-h3">{h.title}</p>
                <p className="bro-label" style={{ marginTop: "0.5mm" }}>{h.sub}</p>
                <p className="bro-note" style={{ marginTop: "0.8mm" }}>{h.points.join(" · ")}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bro-cols" style={{ gridTemplateColumns: `repeat(${closingPromises.length}, 1fr)`, gap: "2mm", marginTop: "3.5mm" }}>
          {closingPromises.map((p) => (
            <div key={p} style={{ borderTop: "1.5pt solid var(--crimson)", paddingTop: "1.8mm" }}>
              <p className="bro-label bro-label-ink">{p}</p>
            </div>
          ))}
        </div>
      </Page>

      {/* ================= 08 · FEES + HOW TO REGISTER ===================== */}
      <Page n="08" section="Registration" dense>
        <p className="bro-kicker">Registration</p>
        <div className="bro-hr-heavy" />
        <p className="bro-display">
          Fees &amp; how to <span className="bro-em">register</span>
        </p>
        <p className="bro-lede">
          Charged at the tier active on the date payment is received. All amounts in Indian rupees, inclusive of GST.
        </p>

        <table className="bro-table">
          <thead>
            <tr>
              <th>Category</th>
              {tiers.map((t, i) => (
                <th key={t.key} className={i === 0 ? "is-best" : undefined}>
                  {t.label}
                  <span>{dmy(t.startDate)} — {dmy(t.endDate)}</span>
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

        <div className="bro-panel bro-panel-edge" style={{ marginTop: "4mm" }}>
          <p className="bro-label bro-label-red">Included with Early Bird</p>
          <p className="bro-h3" style={{ fontSize: "11pt", margin: "1.5mm 0 1mm" }}>
            Complimentary twin-sharing accommodation at the venue
          </p>
          <p className="bro-note">
            Early Bird rates apply until {earlyBird ? dmy(earlyBird.endDate) : "the published date"}. Concessional
            categories require proof of eligibility.
          </p>
        </div>

        <div className="bro-hr" />

        <div className="bro-split bro-split-wide">
          <div className="bro-rail">
            {bank ? (
              <>
                <p className="bro-label bro-label-red">Pay to this account</p>
                <p className="bro-label" style={{ marginTop: "2.5mm" }}>Account name</p>
                <p className="bro-note" style={{ color: "var(--ink)", fontWeight: 650 }}>{bank.accountName}</p>
                <p className="bro-label" style={{ marginTop: "2mm" }}>Account number</p>
                <p className="bro-h3">{bank.accountNumber}</p>
                <p className="bro-label" style={{ marginTop: "2mm" }}>Bank · IFSC</p>
                <p className="bro-note" style={{ color: "var(--ink)", fontWeight: 650 }}>{bank.bankName}</p>
                <p className="bro-h3">{bank.ifscCode}</p>
                {bank.branchName ? <p className="bro-note" style={{ marginTop: "1mm" }}>{bank.branchName}</p> : null}
              </>
            ) : null}
            <img className="bro-qr" src="/payment/qr.png" alt="UPI QR code for the registration fee" style={{ width: "28mm", height: "28mm" }} />
            <p className="bro-label">Scan to pay by UPI</p>
          </div>
          <div>
            {[
              ["01", "Register online", "Complete the delegate form on the conference website."],
              ["02", "Pay the fee", "Transfer by NEFT, IMPS or UPI using the account details or the QR code."],
              ["03", "Attach your proof", "Enter the UTR / transaction reference and upload the payment screenshot. Both are required."],
              ["04", "Receive confirmation", "The secretariat matches your payment and issues your registration ID and QR pass by email."],
            ].map(([n, t, d]) => (
              <div key={n} className="bro-item">
                <p className="bro-mono">{n}</p>
                <div>
                  <p className="bro-h3">{t}</p>
                  <p className="bro-note" style={{ marginTop: "0.6mm" }}>{d}</p>
                </div>
              </div>
            ))}
            <p className="bro-label bro-label-ink" style={{ marginTop: "3.5mm" }}>You will be asked for</p>
            <p className="bro-note" style={{ marginTop: "1mm" }}>
              Name, email and mobile · designation and specialization · institution · medical registration number ·
              registration category · workshop preference · accommodation requirement · UTR and payment screenshot.
            </p>
            <div style={{ marginTop: "3.5mm", borderTop: "1pt solid var(--crimson)", paddingTop: "2mm" }}>
              <p className="bro-label bro-label-red">{registrationHelpline.label}</p>
              <p className="bro-h2" style={{ fontSize: "14pt", marginTop: "1mm", color: "var(--crimson)" }}>
                {registrationHelpline.name} · +91 {registrationHelpline.number}
              </p>
            </div>
            <div className="bro-btn-row" style={{ marginTop: "3.5mm" }}>
              <a className="bro-btn bro-btn-red" href={LINK.register}>Register now</a>
              <a className="bro-btn bro-btn-ghost" href={LINK.fees}>Full fee details</a>
              <a className="bro-url" href={LINK.register}>{LINK.register.replace(/^https?:\/\//, "")}</a>
            </div>
          </div>
        </div>
      </Page>

      {/* ========== 09 · ABSTRACTS + VENUES + HYDERABAD ==================== */}
      <Page n="09" section="Abstracts · Venue" dense>
        <p className="bro-kicker">Abstracts</p>
        <div className="bro-hr-heavy" />
        <p className="bro-display">
          Abstract <span className="bro-em">submission</span>
        </p>

        <div className="bro-split">
          <div className="bro-rail">
            <p className="bro-label bro-label-red">Last date</p>
            <p className="bro-figure" style={{ fontSize: "15pt", marginTop: "1mm" }}>{deadlineLabel}</p>
            <p className="bro-label" style={{ marginTop: "3.5mm" }}>Format</p>
            <p className="bro-note">Decided by the scientific committee after review — paper or poster. You do not choose.</p>
            <div className="bro-btn-row" style={{ marginTop: "3.5mm" }}>
              <a className="bro-btn bro-btn-red" href={LINK.abstracts}>Submit</a>
            </div>
            <p style={{ marginTop: "2mm" }}>
              <a className="bro-url" href={LINK.abstracts}>{LINK.abstracts.replace(/^https?:\/\//, "")}</a>
            </p>
            <p style={{ marginTop: "1.5mm" }}>
              <a className="bro-url" href={`mailto:${conferenceConfig.contact.abstractsEmail}`}>
                {conferenceConfig.contact.abstractsEmail}
              </a>
            </p>
          </div>
          <div>
            <p className="bro-p" style={{ marginBottom: "2mm" }}>
              Abstracts and case reports are invited for the scientific programme. Conference registration is mandatory
              before you submit, and submission is online only through the conference website.
            </p>
            <div className="bro-2col">
              {abstractRules.map((rule, i) => (
                <div key={rule} className="bro-item" style={{ padding: "1.5mm 0" }}>
                  <p className="bro-mono">{String(i + 1).padStart(2, "0")}</p>
                  <p className="bro-note" style={{ color: "var(--muted)" }}>{rule}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bro-hr" />

        <p className="bro-kicker" style={{ marginBottom: "2mm" }}>Where it happens</p>
        <div className="bro-cols bro-c2" style={{ gap: "7mm", marginBottom: "3.5mm" }}>
          {venues.map((v, i) => (
            <div key={v.id} style={{ borderTop: "1.5pt solid var(--crimson)", paddingTop: "2.5mm" }}>
              <p className="bro-label bro-label-red">{i === 0 ? "Day 0 · 23 Oct" : "Day 1 & 2 · 24–25 Oct"}</p>
              <p className="bro-h3" style={{ fontSize: "11pt", margin: "1.5mm 0 1mm" }}>{v.name}</p>
              <p className="bro-note">{v.full}</p>
              <p className="bro-note" style={{ marginTop: "1mm" }}>{v.address}</p>
            </div>
          ))}
        </div>
        <p className="bro-note" style={{ marginBottom: "3mm" }}>
          Both venues are centrally located with easy access from Rajiv Gandhi International Airport and the city
          centre. Travel notes and recommended stays will be shared with registered delegates.
        </p>

        <p className="bro-label bro-label-ink" style={{ marginBottom: "1.5mm" }}>Explore Hyderabad</p>
        <div className="bro-3col">
          {[
            ["Golconda Fort", "16th century", "Granite citadel of the Qutb Shahi kings, famous for acoustics that carry a handclap from the gateway to the summit."],
            ["Salar Jung Museum", "Collection", "One of the largest one-man collections in the world — sculpture, manuscripts and textiles from across continents."],
            ["Hussain Sagar", "Heart of the city", "The lake dividing Hyderabad from Secunderabad, with the monolithic Buddha at its centre."],
            ["Birla Mandir", "Naubath Pahad", "White marble on the hill above Hussain Sagar, with one of the widest views over the city."],
            ["Ramoji Film City", "Day trip", "The world's largest integrated film studio complex, on the eastern edge of the city."],
            ["HITEC City", "Modern Hyderabad", "The technology and biotech corridor that made Hyderabad a centre for research and pharma."],
          ].map(([name, tag, blurb]) => (
            <div key={name} style={{ borderTop: "0.5pt solid var(--hair)", paddingTop: "2mm", marginBottom: "2mm" }}>
              <p className="bro-h3" style={{ fontSize: "8.8pt" }}>{name}</p>
              <p className="bro-label" style={{ marginTop: "0.5mm" }}>{tag}</p>
              <p className="bro-note" style={{ marginTop: "0.8mm" }}>{blurb}</p>
            </div>
          ))}
        </div>
      </Page>

      {/* =============== 10 · COMMITTEE + CONTACT ========================== */}
      <Page n="10" section="Leadership · Contact" dense>
        <p className="bro-kicker">Leadership</p>
        <div className="bro-hr-heavy" />
        <p className="bro-display">
          Organising <span className="bro-em">committee</span>
        </p>

        <p className="bro-label bro-label-ink" style={{ marginBottom: "2mm" }}>Patrons</p>
        <div className="bro-cols" style={{ gridTemplateColumns: "repeat(9, 1fr)", gap: "3mm", marginBottom: "3.5mm" }}>
          {patrons.map((p) => (
            <Portrait key={p.name} src={p.portrait} name={p.name} role={p.title} />
          ))}
        </div>

        <p className="bro-label bro-label-ink" style={{ marginBottom: "2mm" }}>Organising committee</p>
        <div className="bro-cols" style={{ gridTemplateColumns: "repeat(9, 1fr)", gap: "3mm", marginBottom: "3.5mm" }}>
          {leadership.map((l) => (
            <Portrait key={l.name} src={l.portrait} name={l.name} role={l.role} />
          ))}
        </div>

        <p className="bro-label bro-label-ink" style={{ marginBottom: "2mm" }}>Executive committee</p>
        <div className="bro-cols" style={{ gridTemplateColumns: "repeat(11, 1fr)", gap: "2.5mm" }}>
          {executiveCommittee.map((m) => (
            <Portrait key={m.name} src={m.portrait} name={m.name} />
          ))}
        </div>

        <div className="bro-hr" />

        <div className="bro-cols bro-c3" style={{ gap: "6mm" }}>
          <div style={{ borderTop: "1.5pt solid var(--crimson)", paddingTop: "2.5mm" }}>
            <p className="bro-label bro-label-red">Conference secretariat</p>
            <p className="bro-h3" style={{ marginTop: "2mm" }}>{secretariat.department}</p>
            <p className="bro-note">{secretariat.city}</p>
            <p style={{ marginTop: "2mm" }}>
              <a className="bro-url" href={`mailto:${secretariat.email}`}>{secretariat.email}</a>
            </p>
            {secretariat.phones.map((p) => (
              <p key={p.number} className="bro-note" style={{ marginTop: "1.5mm", color: "var(--crimson)", fontWeight: 650 }}>
                {p.name} · +91 {p.number}
              </p>
            ))}
          </div>
          <div style={{ borderTop: "1.5pt solid var(--crimson)", paddingTop: "2.5mm" }}>
            <p className="bro-label bro-label-red">{registrationHelpline.label}</p>
            <p className="bro-h3" style={{ marginTop: "2mm", color: "var(--crimson)" }}>
              {registrationHelpline.name}
              <br />+91 {registrationHelpline.number}
            </p>
            <p className="bro-label" style={{ marginTop: "3mm" }}>Website</p>
            <p style={{ marginTop: "1mm" }}>
              <a className="bro-url" href={LINK.site}>{LINK.site.replace(/^https?:\/\//, "")}</a>
            </p>
          </div>
          <div style={{ borderTop: "1.5pt solid var(--crimson)", paddingTop: "2.5mm" }}>
            <p className="bro-label bro-label-red">Dates &amp; city</p>
            <p className="bro-h3" style={{ marginTop: "2mm" }}>{conference.dates.label}</p>
            <p className="bro-note">{conference.city}</p>
            <p className="bro-note" style={{ marginTop: "2mm" }}>{conference.closing}</p>
            <div className="bro-btn-row" style={{ marginTop: "2.5mm" }}>
              <a className="bro-btn bro-btn-red" href={LINK.register}>Register</a>
              <a className="bro-btn bro-btn-ghost" href={LINK.programme}>Programme</a>
            </div>
          </div>
        </div>

        <p className="bro-label bro-label-red" style={{ marginTop: "4mm", letterSpacing: ".26em" }}>
          Learn it · Do it · Challenge it · Innovate it
        </p>
        <p className="bro-note" style={{ marginTop: "1.5mm" }}>
          Under the aegis of the {conference.association} · Convened by {conference.organisedBy}
        </p>
      </Page>
    </div>
  );
}
