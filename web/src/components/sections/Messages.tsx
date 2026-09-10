import { messages } from "@/data/conference";

/**
 * Welcome messages — restructured to the 10 September 2026 committee review.
 *
 * The review replaced the previous two-up layout: "in one page, it's not to be
 * side by side … the message will be one by one, organising chairman's message
 * and then organising secretary's message." The shared "From the organising
 * office-bearers" headline was dropped with it — each message now carries its
 * own heading, e.g. "Organising Chairman's Message".
 *
 * The text is reproduced verbatim from the signed statements the office-bearers
 * supplied. Do not paraphrase or trim it.
 */
export default function Messages() {
  return (
    <section
      id="messages"
      className="border-t border-[var(--hair)] u-shell py-[clamp(4rem,10vh,9rem)]"
    >
      <div className="mx-auto grid max-w-3xl gap-[clamp(3rem,8vh,6rem)]">
        {messages.map((message) => (
          <article key={message.id} data-r>
            <h2
              className="text-[clamp(1.7rem,4vw,3rem)] font-extrabold leading-[1.05] tracking-[-0.028em]"
              data-r
            >
              <span className="u-word">{message.role}&rsquo;s Message</span>
            </h2>

            <div className="mt-7 flex items-center gap-5 border-b border-[var(--hair-gold)] pb-6">
              {message.portrait ? (
                <img
                  src={message.portrait}
                  alt={message.name}
                  loading="lazy"
                  width={104}
                  height={124}
                  /* object-cover with an upward bias: these are head-and-
                     shoulders photographs, so a centred crop cuts foreheads. */
                  className="h-[124px] w-[104px] shrink-0 rounded-sm border border-[var(--hair)] bg-white object-cover object-[50%_18%]"
                />
              ) : null}
              <div>
                <p className="text-[clamp(1.15rem,2.2vw,1.7rem)] font-bold tracking-[-0.02em]">
                  {message.name}
                </p>
                <p className="u-eyebrow mt-1.5 text-gold-lift">{message.role}</p>
              </div>
            </div>

            <p className="mt-7 font-mono text-[0.8rem] uppercase tracking-[0.16em] text-crimson-lift">
              {message.salutation}
            </p>

            <div className="mt-4 grid gap-5">
              {message.paragraphs.map((paragraph) => (
                <p
                  key={paragraph.slice(0, 48)}
                  className="text-[clamp(1rem,1.15vw,1.1rem)] leading-[1.8] text-muted-foreground"
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
