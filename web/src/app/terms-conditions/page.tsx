import type { Metadata } from "next";
import LegalPage from "@/components/site/LegalPage";
import { conference } from "@/data/conference";
import { conferenceConfig } from "@/config/conference.config";

export const metadata: Metadata = { title: `Terms & Conditions — ${conference.name}` };

export default function Page() {
  return (
    <LegalPage title="Terms & Conditions">
      <h2>1. These terms</h2>
      <p>
        These terms govern registration for and attendance at {conference.name} (&ldquo;the conference&rdquo;),
        held {conference.dates.label} in {conference.city}, organised by {conference.organisedBy} under
        {" "}{conferenceConfig.organizationName}. By registering you accept these terms.
      </p>

      <h2>2. Registration</h2>
      <ul>
        <li>Registration is personal to the named delegate and may not be transferred without written approval from the secretariat.</li>
        <li>A registration is <strong>confirmed only when payment has been received and verified</strong> by the secretariat. Until then it is held as pending.</li>
        <li>Concessional categories (Resident/Trainee, {conferenceConfig.registration.categories.find((c) => c.requiresMembership)?.label}) require valid proof of eligibility. The secretariat may request documentation and may re-rate a registration if eligibility cannot be evidenced.</li>
        <li>Delegates must supply accurate details. Incorrect information may delay confirmation, badge issue or certification.</li>
      </ul>

      <h2>3. Fees and pricing tiers</h2>
      <p>
        Fees are charged according to the tier active on the date payment is received, not the date the form is
        submitted. The tiers are Early Bird (to {conferenceConfig.payment.tiers.earlyBird?.endDate}), Standard
        (to {conferenceConfig.payment.tiers.regular?.endDate}) and Spot Registration. All amounts are in
        {" "}{conferenceConfig.payment.currency} and are inclusive of applicable taxes unless stated otherwise.
      </p>

      <h2>4. Accommodation</h2>
      <p>
        {conferenceConfig.accommodation.note} Accommodation is subject to availability and is allocated by the
        secretariat. Requested nights are limited to the conference dates
        ({conferenceConfig.accommodation.checkInFrom} to {conferenceConfig.accommodation.checkOutBy}).
      </p>

      <h2>5. Workshops</h2>
      <p>
        Pre-conference workshop places are limited and allocated on a first-confirmed basis. The organisers may
        reallocate a delegate to another track, or withdraw a track, where numbers require it.
      </p>

      <h2>6. Programme changes</h2>
      <p>
        The scientific programme, faculty and venues are correct at the time of publication. The organisers may
        alter the programme, substitute faculty or change venue where circumstances require, without liability.
      </p>

      <h2>7. Cancellation by the organisers</h2>
      <p>
        If the conference is cancelled by the organisers, registration fees will be refunded in accordance with the
        <a href="/refund-policy"> refund policy</a>. The organisers are not liable for travel, accommodation or other
        incidental costs incurred by delegates.
      </p>

      <h2>8. Conduct</h2>
      <p>
        Delegates are expected to behave professionally. The organisers may withdraw, without refund, the
        registration of any delegate whose conduct endangers or disrupts others. Unauthorised recording or
        photography of sessions and of patient-identifiable material is prohibited.
      </p>

      <h2>9. Liability</h2>
      <p>
        Scientific content represents the views of individual presenters and is provided for educational purposes.
        It does not constitute clinical advice, and the organisers accept no liability for decisions taken on the
        basis of it. Delegates attend at their own risk and are advised to hold their own insurance.
      </p>

      <h2>10. Data</h2>
      <p>
        Personal data supplied at registration is handled as described in our <a href="/privacy-policy">privacy policy</a>.
      </p>

      <h2>11. Governing law</h2>
      <p>These terms are governed by the laws of India, with jurisdiction in Hyderabad, Telangana.</p>
    </LegalPage>
  );
}
