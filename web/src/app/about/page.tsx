import type { Metadata } from "next";
import PageShell from "@/components/site/PageShell";
import About from "@/components/sections/About";
import Capabilities from "@/components/sections/Capabilities";
import { conference } from "@/data/conference";
export const metadata: Metadata = { title: `About — ${conference.name}` };
export default function Page() {
  return (
    <PageShell title="About the" accent="conference" lede={conference.positioning}>
      <About /><Capabilities variant="instrument" />
    </PageShell>
  );
}
