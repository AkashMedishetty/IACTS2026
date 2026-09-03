import HeroFieldMock from "@/components/lab/HeroFieldMock";
import HeroBandMock from "@/components/lab/HeroBandMock";
import HeroSignalMock from "@/components/lab/HeroSignalMock";

const DIRECTIONS = [
  {
    id: "lab-field",
    no: "01",
    name: "Operative Field",
    idea: "The sterile field is the interface.",
    note: "Protected editorial copy + heart held inside a theatre-light aperture.",
  },
  {
    id: "lab-band",
    no: "02",
    name: "Helical Band",
    idea: "The anatomy becomes the axis.",
    note: "The double helix cuts diagonally through a four-quadrant scientific layout.",
  },
  {
    id: "lab-signal",
    no: "03",
    name: "The Signal",
    idea: "Time is the grid.",
    note: "A 2026 timecode and ECG baseline carry the complete information system.",
  },
] as const;

export default function HeroLabPage() {
  return (
    <main className="bg-ink text-bone">
      <section className="u-shell py-[clamp(3rem,10vh,8rem)]">
        <p className="font-mono text-[.62rem] uppercase tracking-[.22em] text-crimson">
          IACTS / Hero composition lab / Production untouched
        </p>
        <h1 className="mt-5 max-w-[13ch] text-[clamp(2.8rem,7vw,7.8rem)] font-black leading-[.82] tracking-[-.065em]">
          Three concepts.
          <span className="block font-display font-normal italic tracking-[-.05em] text-crimson">
            Three different grammars.
          </span>
        </h1>
        <p className="mt-7 max-w-[58ch] text-[clamp(.92rem,1.2vw,1.15rem)] leading-[1.65] text-muted-foreground">
          These are composition specifications, not production routes. Each one
          uses the real conference content and real cardiac canvas, with a
          deliberate 360px geometry rather than a compressed desktop hero.
        </p>

        <nav aria-label="Hero directions" className="mt-12 grid gap-px bg-black/10 md:grid-cols-3">
          {DIRECTIONS.map((d) => (
            <a
              key={d.id}
              href={`#${d.id}`}
              className="group bg-ink p-[clamp(1.25rem,2.5vw,2.5rem)] text-bone no-underline transition-colors hover:bg-ink-2"
            >
              <span className="font-mono text-[.58rem] tracking-[.18em] text-crimson">{d.no}</span>
              <strong className="mt-5 block text-[clamp(1.25rem,2vw,1.8rem)]">{d.name}</strong>
              <span className="mt-2 block font-display italic text-crimson">{d.idea}</span>
              <span className="mt-5 block text-[.78rem] leading-[1.55] text-muted-foreground">{d.note}</span>
            </a>
          ))}
        </nav>
      </section>

      <HeroFieldMock />
      <HeroBandMock />
      <HeroSignalMock />
    </main>
  );
}
