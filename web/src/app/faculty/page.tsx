import type { Metadata } from "next";
import PageShell from "@/components/site/PageShell";
import { conference, faculty } from "@/data/conference";

export const metadata: Metadata = { title: `Faculty — ${conference.name}` };

/**
 * Faculty, as supplied by the committee on 24 September 2026. Replaced the
 * "announcing soon" placeholder. Source order is kept rather than re-sorted,
 * so the page can be checked against the committee's own sheet line by line.
 */
function NameList({ names }: { names: readonly string[] }) {
  return (
    <ul className="mt-6 grid list-none gap-x-[clamp(1.5rem,3vw,3rem)] p-0 sm:grid-cols-2 lg:grid-cols-3">
      {names.map((name, i) => (
        <li
          key={name}
          data-r
          className="flex items-baseline gap-3 border-b border-[var(--hair)] py-3"
        >
          <span className="font-mono text-[0.7rem] tabular-nums text-gold">
            {String(i + 1).padStart(2, "0")}
          </span>
          <span className="text-[1rem] leading-snug">{name}</span>
        </li>
      ))}
    </ul>
  );
}

export default function Page() {
  return (
    <PageShell title="Faculty" lede="Invited national and international faculty.">
      <section className="u-shell py-[clamp(3rem,8vh,7rem)]">
        <p
          className="border-l-2 border-[#b3122a] bg-white/70 px-5 py-4 text-[clamp(0.98rem,1.15vw,1.08rem)] font-semibold leading-[1.7] text-[#160a0d]"
          data-r
        >
          Faculty are being confirmed and this list is added to as invitations are accepted.
        </p>

        <h2 className="mt-[clamp(2.5rem,6vh,4rem)] u-heading" data-r>
          International <span className="u-serif">faculty</span>
        </h2>
        <NameList names={faculty.international} />

        <h2 className="mt-[clamp(2.5rem,6vh,4rem)] u-heading" data-r>
          National <span className="u-serif">faculty</span>
        </h2>
        <NameList names={faculty.national} />
      </section>
    </PageShell>
  );
}
