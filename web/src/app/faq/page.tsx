import type { Metadata } from "next";
import PageShell from "@/components/site/PageShell";
import Faq from "@/components/sections/Faq";
import { conference } from "@/data/conference";
export const metadata: Metadata = { title: `FAQ — ${conference.name}` };
export default function Page() {
  return (
    <PageShell title="Frequently asked" accent="questions" lede="Registration, fees, abstracts, venues and what is still to be announced.">
      <Faq />
    </PageShell>
  );
}
