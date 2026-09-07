import type { Metadata } from "next";
import PageShell from "@/components/site/PageShell";
import ComingSoon from "@/components/site/ComingSoon";
import { conference } from "@/data/conference";
export const metadata: Metadata = { title: `Programme — ${conference.name}` };
export default function Page() {
  return (
    <PageShell title="Programme" lede="A hands-on pre-conference workshop on 23 October at NIMS, followed by two days of scientific sessions on 24 & 25 October at the Dr. MCR HRD Institute Auditorium.">
      <ComingSoon
        label="Detailed programme announcing soon"
        lines={[
          "The scientific schedule, session timings and faculty are being finalised by the committee and will be published here shortly.",
        ]}
      />
    </PageShell>
  );
}
