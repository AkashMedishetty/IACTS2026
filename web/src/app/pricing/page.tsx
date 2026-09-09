import type { Metadata } from "next";
import PageShell from "@/components/site/PageShell";
import RegisterCta from "@/components/sections/RegisterCta";
import { conference } from "@/data/conference";
export const metadata: Metadata = { title: `Registration fees — ${conference.name}` };
export default function Page() {
  return (
    <PageShell title="Registration Fees" lede="Fees are charged at the tier active on the date payment is received.">
      <RegisterCta />
    </PageShell>
  );
}
