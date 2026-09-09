import { messages } from "@/data/conference";

/**
 * Welcome messages from the Organising Chairman and Organising Secretary.
 *
 * Requested in the 9 Sep committee review: these must appear immediately BEFORE
 * the organising committee. The text is reproduced verbatim from the signed
 * statements the office-bearers supplied — do not paraphrase or trim it.
 */
export default function Messages() {
  return (
    <section
      id="messages"
      className="border-t border-[var(--hair)] u-shell py-[clamp(4rem,10vh,9rem)]"
    >
      <header className="max-w-3xl">
        <p className="u-eyebrow flex items-center gap-3" data-r>
          <span className="text-gold">Welcome</span> Messages
        </p>
        <h2
          className="mt-5 text-[clamp(1.9rem,4.4vw,3.6rem)] font-extrabold leading-[1.02] tracking-[-0.025em]"
          data-r
        >
          From the <span className="u-serif">organising office-bearers</span>
        </h2>
      </header>

      <div className="mt-[clamp(2.5rem,6vh,4.5rem)] grid gap-[clamp(2rem,4vw,4rem)] lg:grid-cols-2">
        {messages.map((message) => (
          <article
            key={message.id}
            data-r
            className="flex flex-col border-t border-[var(--hair-gold)] pt-6"
          >
            <div className="flex items-start gap-4">
              {message.portrait ? (
                <img
                  src={message.portrait}
                  alt={message.name}
                  loading="lazy"
                  width={92}
                  height={104}
                  className="h-[104px] w-[92px] shrink-0 rounded-sm border border-[var(--hair)] bg-white object-contain"
                />
              ) : null}
              <div>
                <p className="u-eyebrow text-gold-lift">{message.role}</p>
                <p className="mt-2 text-[clamp(1.1rem,2vw,1.6rem)] font-bold tracking-[-0.02em]">
                  {message.name}
                </p>
              </div>
            </div>

            <p className="mt-6 font-mono text-[0.8rem] uppercase tracking-[0.16em] text-crimson-lift">
              {message.salutation}
            </p>

            <div className="mt-5 grid gap-5">
              {message.paragraphs.map((paragraph) => (
                <p
                  key={paragraph.slice(0, 48)}
                  /* text-muted resolves to --color-muted (#f8e9ed) — the muted
                     BACKGROUND — so these verbatim messages rendered near-white
                     on a near-white surface and were invisible. The readable
                     token is text-muted-foreground (#614d53). */
                  className="text-[clamp(1rem,1.1vw,1.08rem)] leading-[1.8] text-muted-foreground"
                >
                  {paragraph}
                </p>
              ))}
            </div>

            <p className="mt-7 border-t border-[var(--hair)] pt-4 text-[1rem] font-semibold">
              {message.name}
              <span className="mt-1 block font-mono text-[0.7rem] font-normal uppercase tracking-[0.16em] text-faint">
                {message.role} · IACTS Technocollege CME 2026
              </span>
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
