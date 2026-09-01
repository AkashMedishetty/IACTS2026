import { days } from "@/data/conference";

/**
 * Abstract submission.
 *
 * `pending.abstractDeadline` and `pending.abstractRules` are BOTH null, so no
 * date, word limit or file spec is stated. What IS real comes from the
 * programme: the presentation formats the scientific days actually carry. The
 * frame is therefore honest — these are the routes your work can take, the
 * rules for taking them are not published yet.
 */
const SUBMITTABLE = ["Paper & Video Presentations", "Young Surgeons Forum"];

const UNPUBLISHED = [
  ["Submission window", "Opening and closing dates"],
  ["Format", "Structured-abstract sections and word limit"],
  ["Categories", "Topic categories and subspecialty routing"],
  ["E-poster spec", "Dimensions, file format and upload route"],
  ["Video spec", "Duration, codec and narration requirements"],
  ["Review", "Notification date and presenting-author rules"],
];

export default function Abstracts() {
  const formats = days[1].items.map((i) => i.title);

  return (
    <section id="abstracts" className="border-t border-[var(--hair)] u-shell py-[clamp(4rem,10vh,9rem)]">
      <header className="max-w-3xl">
        <p className="u-eyebrow flex items-center gap-3" data-r>
          <span className="text-gold">05</span> Abstracts
        </p>
        <h2
          className="mt-5 text-[clamp(1.9rem,4.4vw,3.6rem)] font-extrabold leading-[1.02] tracking-[-0.025em]"
          data-r
        >
          Abstract <span className="u-serif">submission</span>
        </h2>
        <p className="mt-5 max-w-xl text-[0.95rem] leading-relaxed text-muted" data-r>
          Two of the scientific programme&apos;s seven formats take submitted
          work. Submission itself opens with registration.
        </p>
      </header>

      <div className="mt-[clamp(2.5rem,6vh,4.5rem)] grid gap-[clamp(2rem,4vw,4rem)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div>
          <p className="u-eyebrow text-gold-lift" data-r>Routes for submitted work</p>
          <ul className="mt-4 list-none border-t border-[var(--hair)] p-0">
            {formats.map((f) => {
              const open = SUBMITTABLE.includes(f);
              return (
                <li
                  key={f}
                  data-r
                  className="grid grid-cols-[1fr_auto] items-baseline gap-4 border-b border-[var(--hair)] py-3"
                >
                  <span className={`text-[0.95rem] ${open ? "" : "text-faint"}`}>{f}</span>
                  <span
                    className={`font-mono text-[0.6rem] uppercase tracking-[0.16em] ${
                      open ? "text-crimson-lift" : "text-faint"
                    }`}
                  >
                    {open ? "Accepts abstracts" : "Invited"}
                  </span>
                </li>
              );
            })}
          </ul>
          <p className="mt-5 font-mono text-[0.66rem] uppercase leading-[1.8] tracking-[0.14em] text-crimson-lift">
            Submission portal opens with registration
          </p>
        </div>

        <div>
          <p className="u-eyebrow text-gold-lift" data-r>To be published</p>
          <ul className="mt-4 list-none border-t border-[var(--hair)] p-0">
            {UNPUBLISHED.map(([t, d]) => (
              <li key={t} data-r className="border-b border-[var(--hair)] py-3">
                <p className="text-[0.92rem] font-semibold">{t}</p>
                <p className="mt-0.5 text-[0.8rem] text-muted">{d}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
