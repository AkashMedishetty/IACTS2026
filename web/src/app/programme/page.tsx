import type { Metadata } from "next";
import PageShell from "@/components/site/PageShell";
import ProgrammeStructure from "@/components/sections/ProgrammeStructure";
import Programme from "@/components/sections/Programme";
import { conference } from "@/data/conference";

export const metadata: Metadata = { title: `Programme — ${conference.name}` };

export default function Page() {
  return (
    <PageShell
      title="Programme"
      lede="A hands-on pre-conference workshop on 23 October at NIMS, followed by two days of scientific sessions on 24 & 25 October at the Dr. MCR HRD Institute Auditorium."
    >
      <ProgrammeStructure />
      <Programme />
    </PageShell>
  );
}
