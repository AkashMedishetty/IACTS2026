import type { Metadata } from "next";
import PageShell from "@/components/site/PageShell";
import Programme from "@/components/sections/Programme";
import Strata from "@/components/sections/Strata";
import Abstracts from "@/components/sections/Abstracts";
import { conference } from "@/data/conference";
export const metadata: Metadata = { title: `Programme — ${conference.name}` };
export default function Page() {
  return (
    <PageShell title="Scientific" accent="programme" lede="Three days, two venues. A hands-on pre-conference workshop followed by two days of scientific sessions.">
      <Programme /><Strata /><Abstracts />
    </PageShell>
  );
}
