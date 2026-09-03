import type { Metadata } from "next";
import PageShell from "@/components/site/PageShell";
import Venues from "@/components/sections/Venues";
import { conference } from "@/data/conference";
export const metadata: Metadata = { title: `Venue — ${conference.name}` };
export default function Page() {
  return (
    <PageShell title="Venue &" accent="travel" lede={`${conference.city}. Day one at NIMS, days two and three at the Dr. MCR HRD Institute Auditorium.`}>
      <Venues />
    </PageShell>
  );
}
