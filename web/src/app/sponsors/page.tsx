import type { Metadata } from "next";
import PageShell from "@/components/site/PageShell";
import Sponsors from "@/components/sections/Sponsors";
import { conference } from "@/data/conference";
export const metadata: Metadata = { title: `Industry Participation — ${conference.name}` };
export default function Page() {
  return (
    <PageShell title="Industry" accent="participation" lede="Partnership and exhibition opportunities for the cardiothoracic industry.">
      <Sponsors />
    </PageShell>
  );
}
