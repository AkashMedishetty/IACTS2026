import type { Metadata } from "next";
import PageShell from "@/components/site/PageShell";
import ComingSoon from "@/components/site/ComingSoon";
import { conference } from "@/data/conference";

export const metadata: Metadata = { title: `Faculty — ${conference.name}` };

export default function Page() {
  return (
    <PageShell title="Faculty" lede="Invited national and international faculty.">
      <ComingSoon
        label="Announcing soon"
        lines={["The faculty list is being confirmed and will be published here."]}
      />
    </PageShell>
  );
}
