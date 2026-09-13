import type { CSSProperties } from "react";
import { patrons, leadership, executiveCommittee, iactsExecutiveCommittee } from "@/data/conference";

/**
 * Committee, with portraits.
 *
 * EVERY portrait is the same size and gets the same treatment — patrons,
 * office-bearers and executive members alike ("the photos of the committee,
 * make everyone the same"). One token, --portrait-w, sets the rendered width
 * for all of them, and one 4:5 frame sets the shape, so no plate can drift.
 *
 * The supplied files run from 0.77 to 1.12 aspect (tall phone portraits through
 * to one landscape frame), so they are NOT cropped on disk — that risks slicing
 * a head off irreversibly. Every portrait instead sits in that fixed 4:5 frame
 * and is fitted with object-cover at `object-[50%_20%]`: the crop is biased
 * upward, because in a head-and-shoulders photograph the face sits above centre
 * and a centred crop is what cuts foreheads. Non-destructive, so a member whose
 * crop reads badly can be nudged with one class instead of a re-export.
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
      className={`relative aspect-[4/5] w-full max-w-[var(--portrait-w)] overflow-hidden rounded-sm border border-[var(--hair)] bg-[#f8e9ed] ${className}`}
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
    <div className="relative flex aspect-[4/5] w-full max-w-[var(--portrait-w)] items-center justify-center overflow-hidden rounded-sm border border-dashed border-[var(--hair-gold)] bg-[#fdf6f8]">
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
  title,
  portrait,
}: {
  name: string;
  role: string;
  title?: string;
  portrait?: string | null;
}) {
  return (
    <div data-r className="group relative border-t border-[var(--hair-gold)] pt-4">
      <div className="mb-4">
        {portrait ? <Portrait src={portrait} name={name} /> : <Initials name={name} />}
      </div>
      <p className="u-eyebrow text-gold-lift">{role}</p>
      <p className="mt-2 text-[clamp(1rem,1.7vw,1.45rem)] font-bold tracking-[-0.02em] transition-colors duration-500 group-hover:text-crimson-lift">
        {name}
      </p>
      {title ? (
        <p className="mt-1.5 text-[0.86rem] leading-snug text-muted-foreground">{title}</p>
      ) : null}
      <span
        aria-hidden
        className="absolute left-0 top-0 h-px w-0 bg-crimson-lift transition-all duration-700 ease-[var(--ease-out-expo)] group-hover:w-full"
      />
    </div>
  );
}

/* One grid rhythm for patrons and office-bearers, so a patron's photograph is
   the same size as everyone else's. */
const PLATE_GRID =
  "grid grid-cols-2 gap-[clamp(1.25rem,2.5vw,2.5rem)] sm:grid-cols-3 lg:grid-cols-5";

export default function Committee() {
  return (
    <section
      id="committee"
      className="u-shell py-[clamp(4rem,10vh,9rem)]"
      style={{ "--portrait-w": "clamp(120px,13vw,168px)" } as CSSProperties}
    >
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

      {/* PATRONS */}
      <div className={`mt-[clamp(2.5rem,6vh,4.5rem)] ${PLATE_GRID}`}>
        {patrons.map((p) => (
          <Plate
            key={p.name}
            name={p.name}
            role={`${p.title} — ${p.role}`}
            portrait={p.portrait}
          />
        ))}
      </div>

      {/* LEADERSHIP */}
      <div className={`mt-[clamp(2rem,5vh,3.5rem)] ${PLATE_GRID}`}>
        {leadership.map((l) => (
          <Plate
            key={l.name}
            name={l.name}
            role={l.role}
            title={l.title}
            portrait={l.portrait}
          />
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

      {/* IACTS EXECUTIVE COMMITTEE — the association's national leadership, in
          the order iacts.org publishes it. Same Plate and the same portrait
          token as everyone above, so every photograph stays one size. */}
      <div id="iacts-executive-committee" className="mt-[clamp(2.5rem,6vh,4.5rem)]">
        <p className="u-eyebrow" data-r>
          IACTS Executive Committee
        </p>
        <div className={`mt-6 ${PLATE_GRID}`}>
          {iactsExecutiveCommittee.map((m) => (
            <Plate key={m.name} name={m.name} role={m.role} portrait={m.portrait} />
          ))}
        </div>
      </div>

      <p className="mt-10 font-mono text-[0.7rem] uppercase tracking-[0.16em] text-faint">
        Faculty list to be announced
      </p>
    </section>
  );
}
