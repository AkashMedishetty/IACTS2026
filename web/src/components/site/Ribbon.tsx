import { Marquee } from "@/components/ui/Marquee";
import { EVENT_INFO } from "@/lib/constants";

function Dia() {
  return (
    <span
      aria-hidden="true"
      className="mx-[clamp(1.1rem,2.4vw,2.4rem)] inline-block size-2 shrink-0 rotate-45 bg-gold"
    />
  );
}

/** Values band. Alternating solid / stroked words so it reads as a designed
    band rather than scrolling text. -webkit-text-stroke is the only reliable
    cross-browser text outline. */
export default function Ribbon() {
  return (
    <section
      aria-label="Conference values"
      className="border-y border-[var(--hair)] bg-ink-2 py-[clamp(1.3rem,3vw,2.5rem)]"
    >
      <Marquee seconds={40}>
        {EVENT_INFO.values.map((word, i) => (
          <span key={word} className="flex shrink-0 items-center">
            <span
              className="text-[clamp(2rem,5.4vw,4.6rem)] font-extrabold uppercase leading-none tracking-[-0.02em]"
              style={
                i % 2 === 1
                  ? { color: "transparent", WebkitTextStroke: "1px #B3121C" }
                  : { color: "#B3121C" }
              }
            >
              {word}
            </span>
            <Dia />
          </span>
        ))}
      </Marquee>

      <Marquee seconds={66} reverse className="mt-[clamp(0.5rem,1.4vw,1.1rem)]">
        <span className="flex shrink-0 items-center">
          <span className="u-eyebrow whitespace-nowrap">{EVENT_INFO.positioning}</span>
          <Dia />
          {EVENT_INFO.pillars.map((p) => (
            <span key={p} className="flex shrink-0 items-center">
              <span className="u-eyebrow whitespace-nowrap text-gold-lift">{p}</span>
              <Dia />
            </span>
          ))}
        </span>
      </Marquee>
    </section>
  );
}
