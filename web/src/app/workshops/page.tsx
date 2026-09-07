import type { Metadata } from "next";
import PageShell from "@/components/site/PageShell";
import ComingSoon from "@/components/site/ComingSoon";
import { conference } from "@/data/conference";

export const metadata: Metadata = { title: `Workshops — ${conference.name}` };

export default function Page() {
  return (
    <PageShell
      title="Workshops"
      lede="Pre-conference workshops, 23 October 2026, at NIMS Hyderabad."
    >
      <ComingSoon
        label="Announcing soon"
        lines={[
          "The workshop programme is being finalised by the organising committee. Seats are limited.",
          "You can register your interest in the registration form — we will write to you with the tracks and any applicable charge once confirmed.",
        ]}
      />
    </PageShell>
  );
}
