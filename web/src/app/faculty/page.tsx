import type { Metadata } from "next";
import PageShell from "@/components/site/PageShell";
import Faculty from "@/components/sections/Faculty";
import Committee from "@/components/sections/Committee";
import { conference } from "@/data/conference";
export const metadata: Metadata = { title: `Faculty & Committee — ${conference.name}` };
export default function Page() {
  return (
    <PageShell title="Faculty &" accent="committee" lede="The organising committee, and the invited faculty as they are confirmed.">
      <Faculty /><Committee />
    </PageShell>
  );
}
