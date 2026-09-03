import type { Metadata } from "next";
import LegalPage from "@/components/site/LegalPage";
import { conference } from "@/data/conference";
import { conferenceConfig } from "@/config/conference.config";

export const metadata: Metadata = { title: `Cookies Policy — ${conference.name}` };

export default function Page() {
  return (
    <LegalPage title="Cookies Policy">
      <h2>What we use</h2>
      <p>
        This site uses a deliberately small number of cookies. We do not use advertising cookies, and we do not
        sell or share browsing data.
      </p>

      <h2>Strictly necessary cookies</h2>
      <ul>
        <li><strong>Session cookie</strong> — set when you sign in to your delegate account, so the site knows you are logged in. It is removed when you sign out or when the session expires.</li>
        <li><strong>Security tokens</strong> — used to protect forms against cross-site request forgery.</li>
      </ul>
      <p>
        These are required for registration and the delegate dashboard to function, and cannot be turned off
        without breaking those features.
      </p>

      <h2>Preference storage</h2>
      <p>
        Your browser may keep small preferences (such as a dismissed notice) in local storage. This stays on your
        device and is never transmitted to us.
      </p>

      <h2>Analytics</h2>
      <p>
        We do not currently run third-party analytics or tracking on this site. Should that change, this page will
        be updated before any such cookie is set.
      </p>

      <h2>Managing cookies</h2>
      <p>
        You can clear or block cookies in your browser settings. Blocking the strictly necessary cookies above will
        prevent you from signing in or completing a registration.
      </p>

      <h2>Questions</h2>
      <p>
        Write to <a href={`mailto:${conferenceConfig.contact.email}`}>{conferenceConfig.contact.email}</a>.
      </p>
    </LegalPage>
  );
}
