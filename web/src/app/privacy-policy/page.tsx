import type { Metadata } from "next";
import LegalPage from "@/components/site/LegalPage";
import { conference } from "@/data/conference";
import { conferenceConfig } from "@/config/conference.config";

export const metadata: Metadata = { title: `Privacy Policy — ${conference.name}` };

export default function Page() {
  return (
    <LegalPage title="Privacy Policy">
      <h2>Who we are</h2>
      <p>
        {conference.organisedBy}, under {conferenceConfig.organizationName}, is the data controller for personal
        data collected through this site for {conference.name}. Contact:{" "}
        <a href={`mailto:${conferenceConfig.contact.email}`}>{conferenceConfig.contact.email}</a>.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li><strong>Identity &amp; contact:</strong> name, title, email address, telephone number, city and state.</li>
        <li><strong>Professional:</strong> designation, specialisation, institution, medical registration (MCI/NMC) number and, where applicable, society membership number.</li>
        <li><strong>Registration:</strong> delegate category, workshop selection, accommodation request and dietary requirements.</li>
        <li><strong>Payment:</strong> the amount due, method and transaction reference. <strong>We do not collect or store card numbers, UPI PINs or net-banking credentials.</strong></li>
        <li><strong>Abstracts:</strong> submitted text and files, where you choose to submit.</li>
        <li><strong>Technical:</strong> minimal server logs needed to operate and secure the site.</li>
      </ul>

      <h2>Why we use it</h2>
      <ul>
        <li>To process your registration, verify payment and issue your badge, invoice and certificate.</li>
        <li>To allocate workshop places and, where applicable, accommodation.</li>
        <li>To administer abstract submission and peer review.</li>
        <li>To send you information essential to your attendance.</li>
        <li>To meet accreditation, accounting and legal obligations.</li>
      </ul>

      <h2>Sensitive data</h2>
      <p>
        Dietary requirements and any accessibility needs you disclose may reveal health or belief information. We
        use them solely to make arrangements for you, and only staff who need them can see them.
      </p>

      <h2>Who sees your data</h2>
      <p>
        Access is limited to the organising secretariat and the service providers who run the conference
        infrastructure (hosting, database and email delivery), acting on our instructions. Abstract submissions are
        shared with assigned reviewers, in line with the review process. <strong>We do not sell your data, and we do
        not share it with sponsors or exhibitors without your explicit consent.</strong>
      </p>

      <h2>Retention</h2>
      <p>
        Registration and payment records are retained for the period required for accounting and accreditation
        purposes, then deleted or anonymised. Abstracts may be retained as part of the scientific record.
      </p>

      <h2>Your rights</h2>
      <p>
        You may request access to, correction of, or deletion of your personal data, and may object to or restrict
        certain processing. Write to <a href={`mailto:${conferenceConfig.contact.email}`}>{conferenceConfig.contact.email}</a>{" "}
        and we will respond within a reasonable period. Deletion requests may be limited where we must retain
        records to meet legal obligations.
      </p>

      <h2>Security</h2>
      <p>
        Passwords are stored only as salted hashes and are never readable by us or by the organisers. Access to
        delegate records is restricted to authenticated administrator accounts. Data is transmitted over encrypted
        connections.
      </p>

      <h2>Cookies</h2>
      <p>See our <a href="/cookies-policy">cookies policy</a>.</p>
    </LegalPage>
  );
}
