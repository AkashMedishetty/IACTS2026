import { patrons, leadership, executiveCommittee } from "@/data/conference";

/**
 * Committee, with portraits.
 *
 * The supplied files run from 0.77 to 1.12 aspect (tall phone portraits through
 * to one landscape frame), so they are NOT cropped on disk — that risks slicing
 * a head off irreversibly. Every portrait instead sits in a fixed 4:5 frame and
 * is fitted with object-cover at `object-[50%_20%]`: the crop is biased upward,
 * because in a head-and-shoulders photograph the face sits above centre and a
 * centred crop is what cuts foreheads. Non-destructive, so a member whose crop
 * reads badly can be nudged with one class instead of a re-export.
 *
 * `portrait: null` is an honest state, not a broken asset: two executive
 * members supplied no photograph and render the type-only plate.
 */
function Portrait({
  src,
  name,
  className = "",
}: {
  src: string;
  name: string;
  className?: string;
}) {
  return (
    <div
      className={`relative aspect-[4/5] w-full overflow-hidden rounded-sm border border-[var(--hair)] bg-[#f8e9ed] ${className}`}
    >
      <img
        src={src}
        alt={name}
        loading="lazy"
        className="size-full object-cover object-[50%_20%] transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.035]"
      />
    </div>
  );
}

/** Two initials, for a member with no photograph. */
function Initials({ name }: { name: string }) {
  const letters = name
    .replace(/^Dr\.?\s+/i, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("");
  return (
    <div className="relative flex aspect-[4/5] w-full items-center justify-center overflow-hidden rounded-sm border border-dashed border-[var(--hair-gold)] bg-[#fdf6f8]">
      <span
        aria-hidden
        className="font-mono text-[clamp(1.4rem,3vw,2.2rem)] tracking-[0.06em] text-[#b3122a]/35"
      >
        {letters}
      </span>
    </div>
  );
}

function Plate({
  name,
  role,
  portrait,
  size = "lead",
}: {
  name: string;
  role: string;
  portrait?: string | null;
  size?: "patron" | "lead";
}) {
  const big = size === "patron";
  return (
    <div data-r className="group relative border-t border-[var(--hair-gold)] pt-4">
      <div className="mb-4">
        {portrait ? <Portrait src={portrait} name={name} /> : <Initials name={name} />}
      </div>
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
        <p className="mt-5 max-w-xl text-[1rem] leading-[1.8] text-muted-foreground" data-r>
          Convened by the Department of Cardiovascular &amp; Thoracic Surgery at
          NIMS, Hyderabad, under the patronage of the institute&apos;s Director
          and Dean.
        </p>
      </header>

      {/* PATRONS — the two most senior plates, so they get the widest frames. */}
      <div className="mt-[clamp(2.5rem,6vh,4.5rem)] grid gap-[clamp(1.25rem,3vw,3rem)] sm:grid-cols-2 lg:max-w-[54%]">
        {patrons.map((p) => (
          <Plate
            key={p.name}
            name={p.name}
            role={`${p.title} — ${p.role}`}
            portrait={p.portrait}
            size="patron"
          />
        ))}
      </div>

      {/* LEADERSHIP */}
      <div className="mt-[clamp(2rem,5vh,3.5rem)] grid grid-cols-2 gap-[clamp(1.25rem,2.5vw,2.5rem)] sm:grid-cols-3 lg:grid-cols-5">
        {leadership.map((l) => (
          <Plate key={l.name} name={l.name} role={l.role} portrait={l.portrait} />
        ))}
      </div>

      {/* EXECUTIVE COMMITTEE */}
      <div id="executive-committee" className="mt-[clamp(2.5rem,6vh,4.5rem)]">
        <p className="u-eyebrow" data-r>
          Executive Committee
        </p>
        <ul className="mt-6 grid list-none grid-cols-2 gap-x-[clamp(1rem,2vw,2rem)] gap-y-[clamp(1.5rem,3vh,2.5rem)] p-0 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {executiveCommittee.map((member, i) => (
            <li key={member.name} data-r className="group">
              {member.portrait ? (
                <Portrait src={member.portrait} name={member.name} />
              ) : (
                <Initials name={member.name} />
              )}
              <div className="mt-3 flex items-baseline gap-2 border-t border-[var(--hair)] pt-2.5">
                <span className="font-mono text-[0.66rem] tabular-nums text-gold">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-[0.95rem] leading-snug transition-colors duration-500 group-hover:text-crimson-lift">
                  {member.name}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-10 font-mono text-[0.7rem] uppercase tracking-[0.16em] text-faint">
        Faculty list to be announced
      </p>
    </section>
  );
}
