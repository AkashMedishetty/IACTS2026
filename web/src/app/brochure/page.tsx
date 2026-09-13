import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./brochure.css";
import {
  about,
  conference,
  days,
  executiveCommittee,
  highlights,
  iactsExecutiveCommittee,
  leadership,
  messages,
  patrons,
  programmeOverview,
  registrationHelpline,
  registrationIncludes,
  secretariat,
  venues,
} from "@/data/conference";
import { conferenceConfig } from "@/config/conference.config";
import { pricingTiers } from "@/config/pricing.config";

/**
 * DELEGATE BROCHURE — a print route, rendered to PDF by Chromium.
 *
 * THIS IS A REFLECTION OF THE WEBSITE, not a programme book. The
 * session-by-session agenda was deliberately REMOVED: the committee asked for
 * "just the agenda to be published soon", and the brochure to mirror the site.
 * data/programme.ts still holds the full schedule for whenever it is wanted —
 * nothing was deleted, it is simply not rendered here.
 *
 * Everything is CENTRED and the vertical rhythm is open. The previous version
 * was rejected as plain and cramped, so this puts the real photography (venues,
 * Hyderabad, portraits) on the page and carries less content per page. Space is
 * the material.
 *
 * THE COVER RENDERS NOTHING. The supplied artwork is a finished design; the
 * earlier version left a placeholder box and a contents list sitting on top of
 * it, which read as an overlay. Do not put type back on page 1.
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
/** A printed localhost link is dead forever — reject loopback bases. */
const SITE = /^https?:\/\/(localhost|127\.|0\.0\.0\.0|\[?::1|192\.168\.|10\.)/i.test(RAW_SITE)
  ? "https://iactstechnocollegecme2026.com"
  : RAW_SITE;

const LINK = {
  register: `${SITE}/register`,
  abstracts: `${SITE}/abstracts`,
  programme: `${SITE}/programme`,
  site: SITE,
};

const MARK = "Future Is Now · Hyderabad 2026";

/**
 * The same marks the website's Strata section uses, in the same order, so the two
 * surfaces read as one system. They are Unicode typographic glyphs rather than
 * emoji deliberately: emoji render in their own fixed multicolour artwork and
 * cannot be held to the single brand red.
 */
const HIGHLIGHT_MARKS = ["✚", "◈", "◎", "⬡", "✦", "★", "❖", "◉"] as const;

const HYDERABAD = [
  ["Golconda Fort", "16th century", "/hyderabad/golconda.jpg"],
  ["Salar Jung Museum", "Collection", "/hyderabad/salar-jung.jpg"],
  ["Hussain Sagar", "Heart of the city", "/hyderabad/hussain-sagar.jpg"],
  ["Birla Mandir", "Naubath Pahad", "/hyderabad/birla-mandir.jpg"],
  ["Ramoji Film City", "Day trip", "/hyderabad/ramoji.jpg"],
  ["HITEC City", "Modern Hyderabad", "/hyderabad/hitec-city.jpg"],
] as const;

function Page({
  n,
  section,
  children,
  cover = false,
  msg = false,
}: {
  n?: string;
  section?: string;
  children?: ReactNode;
  cover?: boolean;
  msg?: boolean;
}) {
  /* The cover is artwork only — no header, no folio, no children. */
  if (cover) {
    return <section className="bro-page bro-cover bro-cover--art" />;
  }
  return (
    <section className={`bro-page bro-c bro-page--art${msg ? " bro-msg" : ""}`}>
      <header className="bro-head">
        <p className="bro-head-sec">{section ?? ""}</p>
        <p className="bro-head-mark">{MARK}</p>
      </header>
      <div className="bro-body">{children}</div>
      <footer className="bro-foot">
        <p className="bro-foot-name">{conference.name}</p>
        <p className="bro-foot-num">{n}</p>
      </footer>
    </section>
  );
}

function Head({ kicker, children }: { kicker: string; children: ReactNode }) {
  return (
    <>
      <p className="bro-kicker">{kicker}</p>
      <hr className="bro-rule-c" />
      <p className="bro-display">{children}</p>
    </>
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

function Person({
  src,
  name,
  role,
  title,
}: {
  src?: string | null;
  name: string;
  role?: string;
  title?: string;
}) {
  return (
    <div>
      {src ? (
        <img className="bro-por" src={src} alt={name} />
      ) : (
        <div className="bro-por-ph" style={{ maxWidth: "34mm" }}>
          <span>{initials(name)}</span>
        </div>
      )}
      <p className="bro-photo-name" style={{ fontSize: "10pt" }}>{name}</p>
      {role ? <p className="bro-por-role">{role}</p> : null}
      {title ? <p className="bro-note" style={{ fontSize: "6.8pt", marginTop: "1mm" }}>{title}</p> : null}
    </div>
  );
}

export default function BrochurePage() {
  const [chairman, secretary] = messages;
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
      {/* 02 · COVER — supplied artwork, nothing on top of it. */}
      <Page cover />

      {/* 03 · IACTS EXECUTIVE COMMITTEE
          The association's national leadership, in the order and with the
          photographs iacts.org publishes. Its own page: page 13 already carries
          eighteen portraits and has no room for fourteen more. */}
      <Page n="02" section="Leadership">
        <Head kicker="The association">
          IACTS executive <span className="bro-em">committee</span>
        </Head>
        <div
          className="bro-people bro-people-md"
          style={{ gridTemplateColumns: "repeat(5, 1fr)", gap: "6mm 4mm", marginTop: "4mm" }}
        >
          {iactsExecutiveCommittee.map((m) => (
            <Person key={m.name} src={m.portrait} name={m.name} role={m.role} />
          ))}
        </div>
        <p className="bro-note" style={{ marginTop: "5mm" }}>
          Indian Association of Cardiovascular-Thoracic Surgeons
        </p>
      </Page>

      {/* 04 · THE WHOLE COMMITTEE ON ONE PAGE
          Patrons, office-bearers and the executive committee together — 18
          portraits. Each tier gets its own portrait width rather than one shared
          size, because seniority should read from the page: patrons largest,
          office-bearers (who also carry an institutional designation) middle,
          executive committee smallest at six-up. The heading is full size like every
          other page; the spacing between tiers is tightened to make room. */}
      <Page n="03" section="Leadership">
        <p className="bro-kicker" style={{ marginBottom: "2mm" }}>Leadership</p>
        <hr className="bro-rule-c" style={{ marginBottom: "2mm" }} />
        <p className="bro-display" style={{ marginBottom: "3mm" }}>
          Organising <span className="bro-em">committee</span>
        </p>

        <p className="bro-label bro-label-ink" style={{ marginBottom: "2mm" }}>Patrons</p>
        <div
          className="bro-people bro-people-md"
          style={{ gridTemplateColumns: "repeat(2, 1fr)", maxWidth: "58mm", marginInline: "auto", marginBottom: "2.5mm", gap: "4mm" }}
        >
          {patrons.map((p) => (
            <Person key={p.name} src={p.portrait} name={p.name} role={p.title} title={p.role} />
          ))}
        </div>

        <p className="bro-label bro-label-ink" style={{ marginBottom: "2mm" }}>Office-bearers</p>
        <div
          className="bro-people bro-people-md"
          style={{ gridTemplateColumns: "repeat(5, 1fr)", marginBottom: "2.5mm", gap: "4mm" }}
        >
          {leadership.map((l) => (
            <Person key={l.name} src={l.portrait} name={l.name} role={l.role} title={l.title} />
          ))}
        </div>

        <p className="bro-label bro-label-ink" style={{ marginBottom: "2mm" }}>Executive committee</p>
        <div
          className="bro-people bro-people-sm"
          style={{ gridTemplateColumns: "repeat(7, 1fr)", gap: "3mm" }}
        >
          {executiveCommittee.map((m) => (
            <Person key={m.name} src={m.portrait} name={m.name} />
          ))}
        </div>

        <p className="bro-note" style={{ marginTop: "2.5mm" }}>
          Conference Secretariat · {secretariat.department}, {secretariat.city}
        </p>
      </Page>

      {/* 05 · CHAIRMAN */}
      <Page n="04" section="Welcome" msg>
        <Head kicker="Organising Chairman's Message">
          A mindset of adaptability, innovation and <span className="bro-em">lifelong learning</span>
        </Head>

        <img
          className="bro-por"
          src={chairman.portrait}
          alt={chairman.name}
          style={{ width: "30mm", margin: "0 auto 3mm" }}
        />
        <p className="bro-photo-name">{chairman.name}</p>
        <p className="bro-por-role" style={{ marginBottom: "6mm" }}>{chairman.role}</p>

        <p className="bro-label bro-label-red" style={{ marginBottom: "3mm" }}>{chairman.salutation}</p>
        {chairman.paragraphs.map((t) => (
          <p key={t.slice(0, 36)} className="bro-p">{t}</p>
        ))}
      </Page>

      {/* 06 · SECRETARY */}
      <Page n="05" section="Welcome" msg>
        <Head kicker="Organising Secretary's Message">
          The future is no longer something we are <span className="bro-em">waiting for</span>
        </Head>

        <img
          className="bro-por"
          src={secretary.portrait}
          alt={secretary.name}
          style={{ width: "30mm", margin: "0 auto 3mm" }}
        />
        <p className="bro-photo-name">{secretary.name}</p>
        <p className="bro-por-role" style={{ marginBottom: "6mm" }}>{secretary.role}</p>

        <p className="bro-label bro-label-red" style={{ marginBottom: "3mm" }}>{secretary.salutation}</p>
        {secretary.paragraphs.map((t) => (
          <p key={t.slice(0, 36)} className="bro-p">{t}</p>
        ))}
      </Page>

      {/* 07 · ABOUT THE CME */}
      <Page n="06" section="About">
        <Head kicker="About the CME">{about.heading}</Head>
        <p className="bro-lede">{about.lede}</p>
        {about.programmeNote.map((para) => (
          <p key={para.slice(0, 36)} className="bro-p">{para}</p>
        ))}
        <p className="bro-p" style={{ color: "var(--ink)", marginTop: "2mm" }}>{about.closing}</p>
        <p className="bro-note" style={{ marginTop: "7mm" }}>
          {conference.dates.label} · {conference.city}
          <br />
          Convened by {conference.organisedBy}
          <br />
          Under the aegis of the {conference.association}
        </p>
      </Page>

      {/* 08 · SCIENTIFIC HIGHLIGHTS */}
      <Page n="07" section="Programme">
        <Head kicker="Scientific Highlights">
          Eight <span className="bro-em">highlights</span>
        </Head>
        <p className="bro-lede">
          The eight areas the programme is built around, as published by the organising committee.
        </p>

        <div className="bro-cols bro-c2" style={{ gap: "5mm 9mm", marginTop: "2mm" }}>
          {highlights.map((h, i) => (
            <div key={h.title} className="bro-cell" style={{ textAlign: "left" }}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                <span aria-hidden style={{ fontSize: "12pt", color: "var(--crimson)", lineHeight: 1 }}>
                  {HIGHLIGHT_MARKS[i % HIGHLIGHT_MARKS.length]}
                </span>
                <span className="bro-mono" style={{ display: "inline", color: "var(--faint)" }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <p className="bro-h3" style={{ fontSize: "10.5pt", marginTop: "2mm" }}>{h.title}</p>
              <p className="bro-label" style={{ marginTop: "1.2mm", fontSize: "6.6pt" }}>{h.sub}</p>
              <ul style={{ listStyle: "none", padding: 0, margin: "2mm 0 0" }}>
                {h.points.map((pt) => (
                  <li key={pt} className="bro-note" style={{ fontSize: "7.4pt", marginBottom: "0.8mm" }}>
                    {pt}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Page>

      {/* 09 · PROGRAMME — agenda forthcoming */}
      <Page n="08" section="Programme">
        <Head kicker="Programme Overview">
          Three days, <span className="bro-em">two venues</span>
        </Head>

        <div className="bro-cols bro-c3" style={{ gap: "7mm", marginBottom: "9mm" }}>
          <div className="bro-cell">
            <span className="bro-mono">Day 0</span>
            <p className="bro-h3" style={{ fontSize: "10.5pt" }}>23 October</p>
            <p className="bro-note" style={{ marginTop: "1.5mm" }}>
              Pre-conference hands-on workshops · NIMS Hyderabad
            </p>
          </div>
          <div className="bro-cell">
            <span className="bro-mono">Days 1 &amp; 2</span>
            <p className="bro-h3" style={{ fontSize: "10.5pt" }}>24 &amp; 25 October</p>
            <p className="bro-note" style={{ marginTop: "1.5mm" }}>
              Scientific programme · Dr. MCR HRD Institute
            </p>
          </div>
          <div className="bro-cell">
            <span className="bro-mono">Theme</span>
            <p className="bro-h3" style={{ fontSize: "10.5pt" }}>{conference.theme}</p>
            <p className="bro-note" style={{ marginTop: "1.5mm" }}>
              Science · Skill · Innovation
            </p>
          </div>
        </div>

        <div className="bro-panel bro-panel-edge" style={{ textAlign: "center", borderLeft: 0, borderTop: "1.5pt solid var(--crimson)" }}>
          <p className="bro-h2" style={{ fontSize: "16pt", marginBottom: "2mm" }}>
            The detailed scientific agenda will be published soon
          </p>
          <p className="bro-note">
            Session timings and faculty are being finalised by the scientific committee. The full programme will be
            published on the conference website.
          </p>
        </div>

        <div className="bro-btn-row" style={{ marginTop: "8mm" }}>
          <a className="bro-btn bro-btn-ghost" href={LINK.programme}>
            {LINK.programme.replace(/^https?:\/\//, "")}
          </a>
        </div>
      </Page>

      {/* 10 · WORKSHOPS — mirrors the website's /workshops route.
          This was MISSING: the rewrite that removed the session-by-session agenda
          also took the workshop tracks with it, so the five pre-conference tracks
          — including MICS CABG, which the committee added on 10 September — were
          nowhere in the brochure while Workshops sits in the site's primary nav.
          Found by diffing the site's nav and data exports against the rendered
          PDF rather than by re-reading the source. */}
      <Page n="09" section="Workshops">
        <Head kicker="Pre-Conference Workshops">
          Day 0 · <span className="bro-em">23 October</span>
        </Head>
        <p className="bro-lede">
          Hands-on sessions at NIMS Hyderabad for postgraduate trainees and young surgeons. Places are limited and
          allocated with registration.
        </p>

        <p className="bro-label bro-label-ink" style={{ marginTop: "2mm", marginBottom: "3mm" }}>The tracks</p>
        <div className="bro-cols bro-c2" style={{ gap: "4mm 9mm" }}>
          {days[0].items.map((item, i) => (
            <div key={item.title} className="bro-cell">
              <span className="bro-mono">{String(i + 1).padStart(2, "0")}</span>
              <p className="bro-h3" style={{ fontSize: "10.5pt" }}>{item.title}</p>
              <p className="bro-label" style={{ marginTop: "1mm", fontSize: "6.6pt" }}>{item.tag}</p>
            </div>
          ))}
        </div>

        <p className="bro-label bro-label-ink" style={{ marginTop: "7mm", marginBottom: "3mm" }}>Skills covered</p>
        <div className="bro-cols bro-c2" style={{ gap: "3mm 9mm" }}>
          {programmeOverview.dayZero.skills.map((skill) => (
            <p key={skill} className="bro-note" style={{ fontSize: "8.6pt", color: "var(--ink)" }}>
              {skill}
            </p>
          ))}
        </div>

        <div
          className="bro-panel"
          style={{ marginTop: "8mm", textAlign: "center", borderTop: "1.5pt solid var(--crimson)" }}
        >
          <p className="bro-h3" style={{ fontSize: "10.5pt" }}>Workshop schedule yet to be finalised</p>
          <p className="bro-note" style={{ marginTop: "2mm" }}>
            Select your workshop preference in the registration form; the secretariat will write to confirm your place.
            Per-track seat counts to be announced.
          </p>
        </div>
      </Page>

      {/* 11 · FEES */}
      <Page n="10" section="Registration">
        <Head kicker="Registration">
          Registration <span className="bro-em">fees</span>
        </Head>
        <p className="bro-lede">
          Charged at the tier active on the date payment is received. All amounts in Indian rupees, inclusive of GST.
        </p>

        <table className="bro-table" style={{ marginTop: "2mm" }}>
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

        <p className="bro-label bro-label-ink" style={{ marginTop: "9mm", marginBottom: "3mm" }}>
          What you get with your registration
        </p>
        <div className="bro-cols bro-c3" style={{ gap: "5mm 7mm" }}>
          {registrationIncludes.map((item) => (
            <div key={item} className="bro-cell">
              <p className="bro-h3" style={{ fontSize: "9.6pt" }}>{item}</p>
            </div>
          ))}
        </div>

        <p className="bro-note" style={{ marginTop: "8mm" }}>
          Early Bird includes complimentary twin-sharing accommodation at the venue, until{" "}
          {earlyBird ? dmy(earlyBird.endDate) : "the published date"}. Concessional categories require proof of
          eligibility.
        </p>
      </Page>

      {/* 12 · HOW TO REGISTER */}
      <Page n="11" section="Registration">
        <Head kicker="Registration">
          How to <span className="bro-em">register</span>
        </Head>

        <div className="bro-cols bro-c2" style={{ gap: "6mm 9mm", marginBottom: "8mm" }}>
          {[
            ["01", "Register online", "Complete the delegate form on the conference website."],
            ["02", "Pay the fee", "Transfer by NEFT, IMPS or UPI using the details below."],
            ["03", "Attach your proof", "Enter the UTR reference and upload the payment screenshot. Both are required."],
            ["04", "Receive confirmation", "The secretariat issues your registration ID and QR pass by email."],
          ].map(([n, t, d]) => (
            <div key={n} className="bro-cell">
              <span className="bro-mono">{n}</span>
              <p className="bro-h3" style={{ fontSize: "10.5pt" }}>{t}</p>
              <p className="bro-note" style={{ marginTop: "1.5mm" }}>{d}</p>
            </div>
          ))}
        </div>

        {bank ? (
          <>
            <p className="bro-label bro-label-ink" style={{ marginBottom: "3mm" }}>Pay to this account</p>
            <p className="bro-h3" style={{ fontSize: "10.5pt" }}>{bank.accountName}</p>
            <p className="bro-p" style={{ margin: "2mm auto 0", fontSize: "9.4pt" }}>
              {bank.accountNumber} · {bank.bankName} · {bank.ifscCode}
              {bank.branchName ? <><br />{bank.branchName}</> : null}
            </p>
          </>
        ) : null}

        <img
          className="bro-qr"
          src="/payment/qr.png"
          alt="UPI QR code for the registration fee"
          style={{ margin: "6mm auto 0", width: "34mm", height: "34mm" }}
        />
        <p className="bro-figcap">Scan to pay by UPI</p>

        <p className="bro-label bro-label-red" style={{ marginTop: "8mm" }}>{registrationHelpline.label}</p>
        <p className="bro-h2" style={{ fontSize: "17pt", marginTop: "2mm", color: "var(--crimson)" }}>
          {registrationHelpline.name} · +91 {registrationHelpline.number}
        </p>
      </Page>

      {/* 13 · ABSTRACTS */}
      <Page n="12" section="Abstracts">
        <Head kicker="Abstracts">
          Abstract <span className="bro-em">submission</span>
        </Head>
        <p className="bro-lede">
          Abstracts and case reports are invited for the scientific programme. Conference registration is mandatory
          before you submit, and submission is online only.
        </p>

        <p className="bro-label bro-label-red" style={{ marginTop: "2mm" }}>Last date for submission</p>
        <p className="bro-figure" style={{ fontSize: "26pt", marginTop: "2mm" }}>{deadlineLabel}</p>

        <div className="bro-cols bro-c2" style={{ gap: "0 9mm", marginTop: "8mm" }}>
          {abstractRules.map((rule, i) => (
            <div
              key={rule}
              style={{ borderBottom: "0.5pt solid var(--hair)", padding: "2.6mm 0", textAlign: "left" }}
            >
              <span className="bro-mono" style={{ marginRight: "3mm" }}>{String(i + 1).padStart(2, "0")}</span>
              <span className="bro-note" style={{ color: "var(--muted)" }}>{rule}</span>
            </div>
          ))}
        </div>

        <div className="bro-btn-row" style={{ marginTop: "8mm" }}>
          <a className="bro-btn bro-btn-red" href={LINK.abstracts}>Submit an abstract</a>
        </div>
        <p className="bro-figcap" style={{ marginTop: "3mm" }}>
          {LINK.abstracts.replace(/^https?:\/\//, "")}
        </p>
      </Page>

      {/* 14 · VENUES */}
      <Page n="13" section="Venue">
        <Head kicker="Where it happens">
          The <span className="bro-em">venues</span>
        </Head>

        <div className="bro-cols bro-c2" style={{ gap: "8mm" }}>
          {venues.map((v, i) => (
            <div key={v.id}>
              <img className="bro-photo bro-photo-tile" src={v.image} alt={v.full} />
              <p className="bro-figcap" style={{ color: "var(--crimson)" }}>
                {i === 0 ? "Day 0 · 23 October" : "Days 1 & 2 · 24–25 October"}
              </p>
              <p className="bro-photo-name">{v.name}</p>
              <p className="bro-note">{v.full}</p>
              <p className="bro-note" style={{ marginTop: "1.5mm" }}>{v.address}</p>
            </div>
          ))}
        </div>

        <p className="bro-p" style={{ marginTop: "9mm" }}>
          Both venues are centrally located with easy access from Rajiv Gandhi International Airport and the city
          centre. Travel notes and recommended stays will be shared with registered delegates.
        </p>
      </Page>

      {/* 15 · HYDERABAD */}
      <Page n="14" section="Host City">
        <Head kicker="Explore Hyderabad">
          A city of heritage — and of <span className="bro-em">medicine</span>
        </Head>
        <p className="bro-lede">
          A rich cultural heritage alongside a fast-growing ecosystem of medicine, technology and innovation — the
          spirit of this conference.
        </p>

        <div className="bro-cols bro-c3" style={{ gap: "6mm 5mm", marginTop: "2mm" }}>
          {HYDERABAD.map(([name, tag, img]) => (
            <div key={name}>
              <img className="bro-photo bro-photo-tile" src={img} alt={name} />
              <p className="bro-photo-name" style={{ fontSize: "10.5pt" }}>{name}</p>
              <p className="bro-figcap">{tag}</p>
            </div>
          ))}
        </div>
      </Page>

      {/* 16 · CONTACT */}
      <Page n="15" section="Contact">
        <Head kicker="Join us in Hyderabad">
          The future <span className="bro-em">is now</span>
        </Head>
        <p className="bro-lede">{conference.closing}</p>

        <div className="bro-btn-row" style={{ margin: "8mm 0" }}>
          <a className="bro-btn bro-btn-red" href={LINK.register}>Register now</a>
          <a className="bro-btn bro-btn-ghost" href={LINK.abstracts}>Submit an abstract</a>
        </div>

        <div className="bro-cols bro-c2" style={{ gap: "8mm", marginTop: "4mm" }}>
          <div className="bro-cell">
            <span className="bro-mono">Secretariat</span>
            <p className="bro-h3" style={{ fontSize: "10.5pt" }}>{secretariat.department}</p>
            <p className="bro-note">{secretariat.city}</p>
            <p className="bro-note" style={{ marginTop: "2mm" }}>{secretariat.email}</p>
            {secretariat.phones.map((p) => (
              <p key={p.number} className="bro-note" style={{ marginTop: "1.5mm", color: "var(--crimson)" }}>
                {p.name} · +91 {p.number}
              </p>
            ))}
          </div>
          <div className="bro-cell">
            <span className="bro-mono">{registrationHelpline.label}</span>
            <p className="bro-h3" style={{ fontSize: "10.5pt", color: "var(--crimson)" }}>
              {registrationHelpline.name} · +91 {registrationHelpline.number}
            </p>
            <p className="bro-note" style={{ marginTop: "3mm" }}>{LINK.site.replace(/^https?:\/\//, "")}</p>
            <p className="bro-note" style={{ marginTop: "3mm" }}>{conference.dates.label}</p>
            <p className="bro-note">{conference.city}</p>
          </div>
        </div>

        <p className="bro-label bro-label-red" style={{ marginTop: "10mm", letterSpacing: ".26em" }}>
          Learn it · Do it · Challenge it · Innovate it
        </p>
      </Page>
    </div>
  );
}
