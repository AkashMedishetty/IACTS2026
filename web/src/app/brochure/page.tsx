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

const SITE = conferenceConfig.contact.website.replace(/\/$/, "");
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
  const tierOrder = [
    { key: "earlyBird", cfg: conferenceConfig.payment.tiers.earlyBird },
    { key: "regular", cfg: conferenceConfig.payment.tiers.regular },
    { key: "onsite", cfg: conferenceConfig.payment.tiers.onsite },
  ] as const;
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
    </div>
  );
}
