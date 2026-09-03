import type { Metadata } from "next";
import PageShell from "@/components/site/PageShell";
import Strata from "@/components/sections/Strata";
import { conference } from "@/data/conference";
export const metadata: Metadata = { title: `Workshops — ${conference.name}` };
export default function Page() {
  return (
    <PageShell title="Pre-conference" accent="workshops" lede="Five parallel hands-on tracks at NIMS on 23 October 2026. Places are limited and allocated with registration.">
      <Strata />
    </PageShell>
  );
}
