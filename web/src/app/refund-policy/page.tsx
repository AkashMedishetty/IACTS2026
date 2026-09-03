import type { Metadata } from "next";
import LegalPage from "@/components/site/LegalPage";
import { conference } from "@/data/conference";
import { conferenceConfig } from "@/config/conference.config";

export const metadata: Metadata = { title: `Refund & Cancellation Policy — ${conference.name}` };

export default function Page() {
  return (
    <LegalPage title="Refund & Cancellation Policy">
      <h2>Scope</h2>
      <p>
        This policy applies to delegate registration fees paid for {conference.name},
        {" "}{conference.dates.label}, {conference.city}.
      </p>

      <h2>Cancellation by a delegate</h2>
      <div className="tbc">
        <strong>To be confirmed.</strong> The cancellation deadlines and the proportion of the fee refundable at
        each stage are being finalised by the organising committee and will be published here before they take
        effect. Until then, please contact the secretariat directly to discuss any cancellation.
      </div>
      <p>
        All cancellation requests must be made in writing to{" "}
        <a href={`mailto:${conferenceConfig.contact.email}`}>{conferenceConfig.contact.email}</a>, quoting the
        registration ID issued at the time of registration. The date the written request is received is the date
        used to assess any refund.
      </p>

      <h2>How refunds are made</h2>
      <ul>
        <li>Approved refunds are returned to the <strong>original bank account used for payment</strong>. Refunds cannot be redirected to a third party.</li>
        <li>Bank charges or transfer fees incurred on the original payment are not refundable.</li>
        <li>Refunds are processed after the conference concludes, unless the organisers state otherwise.</li>
      </ul>

      <h2>Non-refundable items</h2>
      <ul>
        <li>Registrations cancelled after the published deadline, once set.</li>
        <li>Failure to attend (&ldquo;no show&rdquo;) without prior written cancellation.</li>
        <li>Travel, visa and personal expenses, which remain the delegate&rsquo;s responsibility.</li>
      </ul>

      <h2>Substitutions</h2>
      <p>
        Where a delegate cannot attend, the secretariat may permit a colleague to attend in their place, subject to
        written request and to the replacement meeting the same category eligibility. A difference in fee may apply.
      </p>

      <h2>Cancellation or postponement by the organisers</h2>
      <p>
        If the conference is cancelled by the organisers, registration fees will be refunded in full. If it is
        postponed, registrations will be carried over to the rescheduled dates; delegates unable to attend the new
        dates may request a refund. In either case the organisers are not liable for travel, accommodation or other
        incidental costs.
      </p>

      <h2>Duplicate or incorrect payments</h2>
      <p>
        Duplicate payments, or amounts paid in excess of the applicable fee, are refunded in full on verification.
        Contact the secretariat with the transaction reference.
      </p>
    </LegalPage>
  );
}
