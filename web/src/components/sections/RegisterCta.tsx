import { EVENT_INFO } from "@/lib/constants";

/**
 * Registration is "opening soon" and `pending` carries NO fees, delegate
 * categories, abstract deadline, CME credit hours or accrediting council.
 *
 * So this is built around the one honest action available — capturing intent —
 * and the form is DISABLED WITH AN EXPLANATION rather than wired to a fake
 * success toast. Listing what is still to be announced, confidently, reads as
 * organised; hiding it reads as unfinished.
 */
const AWAITING = [
  ["Registration fees", "Delegate categories and early-bird tiers"],
  ["Abstract submission", "Window, word limit, categories, e-poster specs"],
  ["CME accreditation", "Credit hours and accrediting council"],
  ["Accommodation", "Room block, rates and shuttle plan"],
];

export default function RegisterCta() {
  return (
    <section id="register" className="relative overflow-hidden border-t border-[var(--hair)]">
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 size-[48vw] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60 blur-[90px]"
        style={{ background: "radial-gradient(circle,rgba(179,18,28,.45) 0%,transparent 70%)" }} />

      <div className="relative u-shell py-[clamp(4.5rem,12vh,10rem)]">
        <p className="u-eyebrow" data-r>{EVENT_INFO.dateLabel} · {EVENT_INFO.city}</p>

        <h2 className="mt-6 max-w-4xl text-[clamp(2.2rem,6.5vw,5.5rem)] font-extrabold leading-[0.95] tracking-[-0.035em]" data-r>
          Delegate registration
          <span className="u-serif block"> opens soon.</span>
        </h2>

        <div className="mt-[clamp(2rem,5vh,3.5rem)] max-w-xl" data-r>
          <label htmlFor="notify" className="u-eyebrow block">
            Email address — we will notify you when registration opens
          </label>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <input
              id="notify"
              type="email"
              disabled
              placeholder="name@hospital.org"
              className="min-h-[46px] flex-1 border border-[var(--hair-gold)] bg-white/[0.04] px-4 text-[0.9rem] text-bone placeholder:text-faint disabled:cursor-not-allowed"
            />
            <button
              type="button"
              disabled
              className="min-h-[46px] cursor-not-allowed rounded-full px-6 font-mono text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-white opacity-45"
              style={{ background: "linear-gradient(135deg,#B3122A 0%,#5F0717 130%)" }}
            >
              Notify me
            </button>
          </div>
          <p className="mt-3 font-mono text-[0.66rem] uppercase tracking-[0.14em] text-crimson-lift">
            Online registration is not yet open
          </p>
        </div>

        <div className="mt-[clamp(3rem,7vh,5rem)] border-t border-[var(--hair)]">
          <p className="u-eyebrow mt-6" data-r>Still to be announced</p>
          <ul className="mt-4 grid list-none grid-cols-1 gap-x-[clamp(1.5rem,3vw,3.5rem)] p-0 sm:grid-cols-2">
            {AWAITING.map(([t, d]) => (
              <li key={t} data-r className="border-b border-[var(--hair)] py-4">
                <p className="text-[0.95rem] font-semibold">{t}</p>
                <p className="mt-1 text-[0.82rem] text-muted">{d}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-10 flex items-center gap-3.5" aria-hidden>
          <span className="h-px flex-1 bg-[var(--hair-gold)]" />
          <span className="size-[7px] rotate-45 bg-gold" />
          <span className="h-px flex-1 bg-[var(--hair-gold)]" />
        </div>
      </div>
    </section>
  );
}
