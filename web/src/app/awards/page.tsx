import type { Metadata } from "next";
import PageShell from "@/components/site/PageShell";
import Awards from "@/components/sections/Awards";
import { conference } from "@/data/conference";
export const metadata: Metadata = { title: `Awards — ${conference.name}` };
export default function Page() {
  return (
    <PageShell title="Papers &" accent="awards" lede="Best Paper and E-Poster awards, and the Young Surgeons Forum.">
      <Awards />
    </PageShell>
  );
}
