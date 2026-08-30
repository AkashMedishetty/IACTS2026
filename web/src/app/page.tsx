import Link from "next/link";
import { EVENT_INFO, CONCEPTS } from "@/lib/constants";

export default function Page() {
  return (
    <main id="main" className="min-h-svh flex flex-col justify-center u-shell py-[clamp(3rem,8vh,7rem)]">
      <p className="u-eyebrow" data-r>
        {EVENT_INFO.acronym} · {EVENT_INFO.dateLabel} · {EVENT_INFO.city}
      </p>

      <h1 className="u-word mt-6 text-[clamp(2.4rem,7vw,5.5rem)]">
        Three directions
      </h1>
      <p className="mt-5 max-w-xl text-[0.95rem] leading-relaxed text-muted">
        Each concept is a complete route with its own signature mechanic, built
        on one shared design system. Open them side by side.
      </p>

      <ul className="mt-[clamp(2rem,5vh,4rem)] border-t border-[var(--hair)]">
        {CONCEPTS.map((c, i) => (
          <li key={c.id} data-r>
            <Link
              href={`/${c.id}`}
              className="group grid grid-cols-[auto_1fr_auto] items-baseline gap-[clamp(1rem,3vw,3rem)] border-b border-[var(--hair)] py-[clamp(1.1rem,2.6vh,2rem)] no-underline"
            >
              <span className="font-mono text-[0.7rem] text-gold">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span>
                <span className="block text-[clamp(1.15rem,2.6vw,2.1rem)] font-extrabold tracking-[-0.02em] transition-colors duration-500 group-hover:text-crimson-lift">
                  {c.name}
                </span>
                <span className="mt-1 block text-[0.82rem] text-muted">{c.mechanic}</span>
              </span>
              <span className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-faint transition-colors duration-500 group-hover:text-gold-lift">
                Open
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
