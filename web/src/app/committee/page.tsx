import type { Metadata } from "next";
import PageShell from "@/components/site/PageShell";
import Committee from "@/components/sections/Committee";
import { conference } from "@/data/conference";
export const metadata: Metadata = { title: `Organising Committee — ${conference.name}` };
export default function Page() {
  return (
    <PageShell title="Organising" accent="committee" lede="The patrons, leadership and executive committee convening the conference.">
      <Committee />
    </PageShell>
  );
}
