import { EVENT_INFO } from "@/lib/constants";

export default function LabHeader({ index }: { index: string }) {
  return (
    <header className="relative z-30 flex h-[clamp(4.5rem,9vh,7rem)] items-center justify-between border-b border-black/10 px-[clamp(1rem,3vw,3rem)]">
      <div className="flex items-center gap-[clamp(.75rem,1.5vw,1.5rem)]">
        <span className="grid size-[clamp(2.2rem,3vw,3rem)] shrink-0 place-items-center rounded-full border border-crimson/35 font-mono text-[clamp(.55rem,.65vw,.68rem)] font-bold tracking-[.1em] text-crimson">
          IA
        </span>
        <p className="m-0 max-w-[24ch] text-[clamp(.62rem,.76vw,.78rem)] font-semibold leading-[1.25] tracking-[-.01em] text-bone">
          Indian Association of
          <span className="block font-normal text-muted">
            Cardiovascular–Thoracic Surgeons
          </span>
        </p>
      </div>

      <p className="absolute left-1/2 m-0 hidden -translate-x-1/2 font-mono text-[.62rem] uppercase tracking-[.24em] text-faint 2xl:block">
        IACTS / Technocollege / {index}
      </p>

      <nav aria-label="Mockup navigation" className="hidden items-center gap-[clamp(1rem,2vw,2.2rem)] md:flex">
        {[
          ["Programme", "#programme"],
          ["Faculty", "#faculty"],
          ["Abstracts", "#abstracts"],
          ["Venue", "#venue"],
        ].map(([label, href]) => (
          <a
            key={label}
            href={href}
            className="font-mono text-[clamp(.55rem,.6vw,.65rem)] uppercase tracking-[.18em] text-muted no-underline transition-colors hover:text-crimson"
          >
            {label}
          </a>
        ))}
        <a
          href="#register"
          className="rounded-full bg-crimson px-[clamp(1rem,1.6vw,1.7rem)] py-[.7rem] font-mono text-[.58rem] font-semibold uppercase tracking-[.16em] text-white no-underline"
        >
          {EVENT_INFO.dateLabel.split(" 2026")[0]}
        </a>
      </nav>

      <button
        type="button"
        aria-label="Open navigation"
        className="grid size-11 shrink-0 place-items-center rounded-full border border-black/15 bg-white md:hidden"
      >
        <span className="relative h-3.5 w-4 before:absolute before:left-0 before:top-0 before:h-px before:w-4 before:bg-bone after:absolute after:bottom-0 after:left-0 after:h-px after:w-4 after:bg-bone" />
      </button>
    </header>
  );
}
