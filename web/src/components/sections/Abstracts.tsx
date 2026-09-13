import { conferenceConfig } from "@/config/conference.config";

/**
 * Abstract submission. The committee has now published the rules and the
 * deadline, so this states them plainly instead of listing what is unknown.
 * Submitters do NOT choose paper vs poster — the scientific committee assigns
 * the format after review.
 */
export default function Abstracts() {
  const rules = conferenceConfig.abstracts.submissionRules || [];
  const deadline = conferenceConfig.abstracts.submissionWindow?.end;

  return (
    <section id="abstracts" className="border-t border-[var(--hair)] u-shell py-[clamp(3rem,8vh,6rem)]">
      <header className="max-w-3xl">
        <p className="u-eyebrow flex items-center gap-3" data-r>
          <span className="text-gold">05</span> Abstracts
        </p>
        <h2 className="mt-5 u-heading" data-r>
          Abstract submission
        </h2>
        <p className="mt-4 text-[clamp(.95rem,1.1vw,1.1rem)] leading-[1.72] text-muted-foreground" data-r>
          Submit your work for the scientific programme. You do not choose the presentation format — the scientific
          committee reviews each submission and decides whether it is presented as a paper or a poster.
        </p>
      </header>

      {deadline ? (
        <div className="mt-7 inline-flex items-baseline gap-3 border-l-2 border-[#b3122a] bg-white px-5 py-4" data-r>
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[.14em] text-[#7d656c]">
            Last date for submission
          </span>
          <span className="text-[clamp(1.2rem,2.4vw,1.8rem)] font-black tracking-[-.02em] text-[#b3122a]">
            {deadline.split("-").reverse().join("/")}
          </span>
        </div>
      ) : null}

      <ol className="mt-8 grid list-none grid-cols-1 gap-x-[clamp(1.5rem,3vw,3rem)] gap-y-0 p-0 md:grid-cols-2" data-r>
        {rules.map((rule, i) => (
          <li key={rule} className="flex gap-4 border-b border-[var(--hair)] py-3.5">
            <span className="font-mono text-[12px] font-semibold text-[#b3122a]">{String(i + 1).padStart(2, "0")}</span>
            <span className="text-[14px] leading-[1.65] text-[#3d2b30]">{rule}</span>
          </li>
        ))}
      </ol>

      <div className="mt-8 flex flex-wrap items-center gap-3" data-r>
        <a
          href="/abstracts"
          className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[#b3122a] px-7 font-mono text-[12px] font-semibold uppercase tracking-[.12em] text-white no-underline transition-transform hover:-translate-y-0.5"
        >
          Submit an abstract
        </a>
        <span className="font-mono text-[12px] uppercase tracking-[.1em] text-[#7d656c]">
          Registration is required before submitting
        </span>
      </div>
    </section>
  );
}
