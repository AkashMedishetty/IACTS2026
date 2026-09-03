import { EVENT_INFO } from "@/lib/constants";
import { conferenceConfig } from "@/config/conference.config";
import { pricingTiers } from "@/config/pricing.config";
import { getCurrentTierKey, tierLabel } from "@/lib/registration";

/**
 * Registration is OPEN. Fees come from config/pricing.config.ts — the same
 * matrix the server charges against — so the published table can never drift
 * from what a delegate is actually billed.
 */
const TIER_KEYS = ["earlyBird", "regular", "onsite"] as const;

function fmtDate(iso?: string) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export default function RegisterCta() {
  const activeKey = getCurrentTierKey();
  const categories = conferenceConfig.registration.categories.filter(
    (c) => !["complimentary", "sponsored"].includes(c.key),
  );

  return (
    <section id="register" className="relative overflow-hidden border-t border-[var(--hair)]">
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 size-[48vw] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40 blur-[90px]"
        style={{ background: "radial-gradient(circle,rgba(179,18,42,.35) 0%,transparent 70%)" }} />

      <div className="relative u-shell py-[clamp(4rem,10vh,8rem)]">
        <p className="u-eyebrow" data-r>{EVENT_INFO.dateLabel} · {EVENT_INFO.city}</p>

        <h2 className="mt-6 max-w-4xl text-[clamp(2.2rem,6.5vw,5rem)] font-extrabold leading-[0.95] tracking-[-0.035em]" data-r>
          Registration is
          <span className="u-serif block"> open.</span>
        </h2>

        <p className="mt-5 max-w-[52ch] text-[clamp(.9rem,1.1vw,1.05rem)] leading-[1.7] text-muted-foreground" data-r>
          {tierLabel(activeKey)} rates apply
          {conferenceConfig.payment.tiers[activeKey]?.endDate
            ? ` until ${fmtDate(conferenceConfig.payment.tiers[activeKey]?.endDate)}`
            : ""}. {conferenceConfig.accommodation.note}
        </p>

        {/* fee matrix */}
        <div className="mt-[clamp(2rem,5vh,3rem)] overflow-x-auto" data-r>
          <table className="w-full min-w-[560px] border-collapse text-left">
            <thead>
              <tr>
                <th className="border-b border-[var(--hair)] pb-3 font-mono text-[9px] uppercase tracking-[.16em] text-faint">Category</th>
                {TIER_KEYS.map((k) => {
                  const w = conferenceConfig.payment.tiers[k];
                  const active = k === activeKey;
                  return (
                    <th key={k} className={`border-b pb-3 text-right font-mono text-[9px] uppercase tracking-[.16em] ${active ? "border-[#b3122a] text-[#b3122a]" : "border-[var(--hair)] text-faint"}`}>
                      {tierLabel(k)}
                      <span className="mt-1 block font-normal normal-case tracking-normal opacity-70">
                        {w?.endDate ? `till ${fmtDate(w.endDate)}` : "at the venue"}
                      </span>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.key}>
                  <td className="border-b border-[var(--hair)] py-3.5 text-[0.95rem] font-semibold text-bone">{cat.label}</td>
                  {TIER_KEYS.map((k) => {
                    const amt = pricingTiers[k]?.categories?.[cat.key]?.amount ?? 0;
                    const active = k === activeKey;
                    return (
                      <td key={k} className={`border-b py-3.5 text-right tabular-nums ${active ? "border-[#b3122a] text-[1.05rem] font-bold text-[#b3122a]" : "border-[var(--hair)] text-[0.95rem] text-muted-foreground"}`}>
                        ₹{amt.toLocaleString("en-IN")}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-[clamp(2rem,4vh,3rem)] flex flex-wrap items-center gap-3" data-r>
          <a href="/register" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[#b3122a] px-7 font-mono text-[10px] font-semibold uppercase tracking-[.15em] text-white no-underline transition-transform hover:-translate-y-0.5">
            Register now
            <svg viewBox="0 0 20 20" className="size-4" fill="none" aria-hidden="true">
              <path d="M4 10h11M11 6l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
          <a href="/pricing" className="inline-flex min-h-12 items-center border-b border-[#b3122a]/30 px-1 font-mono text-[10px] font-semibold uppercase tracking-[.15em] text-[#b3122a] no-underline">
            Full fee details
          </a>
        </div>

        <p className="mt-6 max-w-[60ch] text-[0.8rem] leading-[1.7] text-faint" data-r>
          Fees are charged at the tier active on the date payment is received. Concessional categories require proof of
          eligibility. Questions:{" "}
          <a href={`mailto:${conferenceConfig.contact.email}`} className="text-[#b3122a]">{conferenceConfig.contact.email}</a>
        </p>
      </div>
    </section>
  );
}
