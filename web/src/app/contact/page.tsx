import type { Metadata } from "next";
import PageShell from "@/components/site/PageShell";
import { conference, secretariat, venues } from "@/data/conference";
import { conferenceConfig } from "@/config/conference.config";
export const metadata: Metadata = { title: `Contact — ${conference.name}` };
export default function Page() {
  return (
    <PageShell title="Contact the" accent="secretariat" lede="For registration, abstracts, sponsorship and any question about the conference.">
      <section id="contact">
        <div className="u-shell grid gap-8 py-2 sm:grid-cols-2">
          <div className="border-l-2 border-[#b3122a] bg-white px-5 py-4">
            <p className="font-mono text-[9px] uppercase tracking-[.16em] text-[#7d656c]">Conference secretariat</p>
            <p className="mt-2 text-[14px] leading-[1.9] text-[#614d53]">
              {secretariat.department}<br />{secretariat.city}<br />
              <a href={`mailto:${conferenceConfig.contact.email}`} className="text-[#b3122a]">{conferenceConfig.contact.email}</a>
            </p>
            {secretariat.phones.length === 0 ? (
              <p className="mt-3 font-mono text-[9px] uppercase tracking-[.14em] text-[#7d656c]">Telephone numbers to be announced</p>
            ) : null}
          </div>
          <div className="border border-[#b3122a]/15 bg-white px-5 py-4">
            <p className="font-mono text-[9px] uppercase tracking-[.16em] text-[#7d656c]">Venues</p>
            <ul className="mt-2 list-none space-y-3 p-0">
              {venues.map((v) => (
                <li key={v.id}>
                  <p className="m-0 text-[14px] font-semibold text-[#160a0d]">{v.full}</p>
                  <p className="m-0 text-[12px] text-[#7d656c]">{v.hosts}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
