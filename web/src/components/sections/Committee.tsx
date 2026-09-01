import { patrons, leadership, executiveCommittee } from "@/data/conference";

/**
 * Every `portrait` is null and will stay null: the flyer's headshots are
 * ~200-300px crops, unusable on web, and originals have not arrived. So this
 * communicates standing through composition instead of photography — engraved
 * nameplates, not placeholder avatars or grey initial-boxes that read as a
 * broken loading state.
 *
 * When portraits do arrive they slot in as `portrait: { src, alt }` on the
 * leadership entries; only Plate needs to change.
 */
function Plate({
  name,
  role,
  size = "lead",
}: {
  name: string;
  role: string;
  size?: "patron" | "lead";
}) {
  const big = size === "patron";
  return (
    <div data-r className="group relative border-t border-[var(--hair-gold)] pt-4">
      <p className="u-eyebrow text-gold-lift">{role}</p>
      <p
        className={`mt-2 font-bold tracking-[-0.02em] transition-colors duration-500 group-hover:text-crimson-lift ${
          big
            ? "text-[clamp(1.15rem,2.2vw,1.9rem)]"
            : "text-[clamp(1rem,1.7vw,1.45rem)]"
        }`}
      >
        {name}
      </p>
      <span
        aria-hidden
        className="absolute left-0 top-0 h-px w-0 bg-crimson-lift transition-all duration-700 ease-[var(--ease-out-expo)] group-hover:w-full"
      />
    </div>
  );
}

export default function Committee() {
  return (
    <section id="committee" className="u-shell py-[clamp(4rem,10vh,9rem)]">
      <header className="max-w-3xl">
        <p className="u-eyebrow flex items-center gap-3" data-r>
          <span className="text-gold">03</span> Organising Committee
        </p>
        <h2
          className="mt-5 text-[clamp(1.9rem,4.4vw,3.6rem)] font-extrabold leading-[1.02] tracking-[-0.025em]"
          data-r
        >
          Organising <span className="u-serif">committee</span>
        </h2>
        <p className="mt-5 max-w-xl text-[0.95rem] leading-relaxed text-muted" data-r>
          Convened by the Department of Cardiovascular &amp; Thoracic Surgery at
          NIMS, Hyderabad, under the patronage of the institute&apos;s Director
          and Dean.
        </p>
      </header>

      <div className="mt-[clamp(2.5rem,6vh,4.5rem)] grid gap-[clamp(1.25rem,3vw,3rem)] sm:grid-cols-2">
        {patrons.map((p) => (
          <Plate key={p.name} name={p.name} role={p.role} size="patron" />
        ))}
      </div>

      <div className="mt-[clamp(2rem,5vh,3.5rem)] grid gap-[clamp(1.25rem,2.5vw,2.5rem)] sm:grid-cols-2 lg:grid-cols-3">
        {leadership.map((l) => (
          <Plate key={l.name} name={l.name} role={l.role} />
        ))}
      </div>

      <div id="executive-committee" className="mt-[clamp(2.5rem,6vh,4.5rem)]">
        <p className="u-eyebrow" data-r>Executive Committee</p>
        <ul className="mt-5 grid list-none grid-cols-1 gap-x-[clamp(1.5rem,3vw,3.5rem)] p-0 sm:grid-cols-2 lg:grid-cols-3">
          {executiveCommittee.map((n, i) => (
            <li
              key={n}
              data-r
              className="group grid grid-cols-[auto_1fr] items-baseline gap-4 border-b border-[var(--hair)] py-3"
            >
              <span className="font-mono text-[0.6rem] text-gold">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-[0.95rem] transition-colors duration-500 group-hover:text-crimson-lift">
                {n}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-8 font-mono text-[0.68rem] uppercase tracking-[0.16em] text-faint">
        Faculty list to be announced
      </p>
    </section>
  );
}
