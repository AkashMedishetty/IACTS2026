import { capabilities } from "@/data/conference";

/** Per-capability diagram drawn from primitives — crosshairs, registration
    marks, a slice stack, an isocontour, a waveform, a reticle. No icon
    library, no emoji, no images. */
function Glyph({ i }: { i: number }) {
  const s = "rgba(193,141,33,.55)";
  const paths = [
    "M8 32h48M32 8v48M32 32m-14 0a14 14 0 1 0 28 0a14 14 0 1 0-28 0", // reconstruction
    "M10 46c8-26 36-26 44 0M10 46h44M22 34h20", // segmentation
    "M32 6v52M6 32h52M32 32m-9 0a9 9 0 1 0 18 0a9 9 0 1 0-18 0M18 18l6 6M46 18l-6 6", // navigation
    "M12 20h40M12 32h40M12 44h40M20 14v36M44 14v36", // planning
    "M6 40c6 0 8-18 14-18s8 22 14 22 8-14 14-14 8 10 10 10", // imaging
    "M32 32m-24 0a24 24 0 1 0 48 0a24 24 0 1 0-48 0M32 32m-11 0a11 11 0 1 0 22 0a11 11 0 1 0-22 0M32 4v10M32 50v10", // monitoring
  ];
  return (
    <svg viewBox="0 0 64 64" className="w-[clamp(34px,3.4vw,54px)]" fill="none" aria-hidden="true">
      <path d={paths[i % paths.length]} stroke={s} strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}

export default function Capabilities({
  variant = "instrument",
}: {
  variant?: "instrument" | "telemetry";
}) {
  const telemetry = variant === "telemetry";

  return (
    <section
      id="capabilities"
      className={`border-t border-[var(--hair)] u-shell py-[clamp(4rem,10vh,9rem)] ${
        telemetry ? "bg-ink-2" : ""
      }`}
    >
      <header className="max-w-3xl">
        <p className="u-eyebrow flex items-center gap-3" data-r>
          <span className="text-gold">02</span>
          {telemetry ? "Instrumentation" : "Next-Gen Technology"}
        </p>
        <h2
          className="mt-5 text-[clamp(1.9rem,4.4vw,3.6rem)] font-extrabold leading-[1.02] tracking-[-0.025em]"
          data-r
        >
          {telemetry ? (
            <>Six channels, <span className="u-serif">read continuously</span></>
          ) : (
            <>Six capabilities, <span className="u-serif">one operating field</span></>
          )}
        </h2>
      </header>

      {telemetry ? (
        /* CONCEPT 3 — a monitor readout: ruled channel rows, mono throughout */
        <ul className="mt-[clamp(2rem,5vh,3.5rem)] list-none border-t border-[var(--hair)] p-0">
          {capabilities.map((c) => (
            <li
              key={c.code}
              data-r
              className="group grid grid-cols-[auto_1fr_auto] items-center gap-[clamp(0.9rem,2.5vw,2.5rem)] border-b border-[var(--hair)] py-[clamp(0.8rem,2vh,1.3rem)]"
            >
              <span className="font-mono text-[0.66rem] tabular-nums text-gold">CH{c.code}</span>
              <span className="font-mono text-[clamp(0.8rem,1.25vw,1.05rem)] uppercase tracking-[0.1em] transition-colors duration-500 group-hover:text-crimson-lift">
                {c.title}
              </span>
              <span className="u-eyebrow text-faint">{c.scope}</span>
            </li>
          ))}
        </ul>
      ) : (
        /* CONCEPT 1 — an instrument tray: each capability laid out with its diagram */
        <div className="mt-[clamp(2rem,5vh,3.5rem)] grid gap-[clamp(1.25rem,2.5vw,2.5rem)] sm:grid-cols-2 lg:grid-cols-3">
          {capabilities.map((c, i) => (
            <article
              key={c.code}
              data-r
              className="group relative border-t border-[var(--hair-gold)] pt-5"
            >
              <div className="flex items-start justify-between gap-4">
                <span className="font-mono text-[0.66rem] tabular-nums text-gold">{c.code}</span>
                <Glyph i={i} />
              </div>
              <h3 className="mt-4 text-[clamp(1rem,1.7vw,1.4rem)] font-bold leading-tight tracking-[-0.015em] transition-colors duration-500 group-hover:text-crimson-lift">
                {c.title}
              </h3>
              <p className="mt-1.5 u-eyebrow">{c.scope}</p>
              <span
                aria-hidden
                className="absolute left-0 top-0 h-px w-0 bg-crimson-lift transition-all duration-700 ease-[var(--ease-out-expo)] group-hover:w-full"
              />
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
