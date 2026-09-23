import type { Metadata } from "next";
import SiteHeader from "@/components/site/SiteHeader";
import RegisterForm from "@/components/register/RegisterForm";
import Footer from "@/components/sections/Footer";
import { conference, registrationHelpline } from "@/data/conference";
import { conferenceConfig } from "@/config/conference.config";
import { isValidFacultyKey } from "@/lib/facultyRegistration";

/**
 * Faculty registration — the delegate form, with no payment.
 *
 * Reached only through the invited link, which carries the key. Without a
 * valid key the form is not rendered at all, and the API refuses the free
 * category as well, so the page cannot be bypassed by posting directly.
 */
export const metadata: Metadata = {
  title: `Faculty registration — ${conference.name}`,
  robots: { index: false, follow: false },
};

export default async function FacultyRegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ key?: string }>;
}) {
  const { key } = await searchParams;
  const valid = isValidFacultyKey(key);

  return (
    <div className="conference-site relative isolate min-h-svh">
      <SiteHeader cta={false} />
      <main id="main" className="relative z-10 pb-24 pt-[104px]">
        <div className="u-shell">
          <header className="border-b border-[var(--hair)] pb-8">
            <p className="flex items-center gap-3 font-mono text-[9px] uppercase tracking-[.24em] text-[#7d656c]">
              <span aria-hidden className="h-px w-8 bg-[#b3122a]" /> {conference.dates.label} · {conference.city}
            </p>
            <h1 className="mt-4 text-[clamp(2.2rem,6vw,4.5rem)] font-black uppercase leading-[.86] tracking-[-.06em] text-[#160a0d]">
              Faculty <span className="text-[#b3122a]">registration</span>
            </h1>
            {valid ? (
              <>
                <p className="mt-4 max-w-[54ch] text-[15px] leading-[1.7] text-[#614d53]">
                  {conference.name} — {conference.organisedBy}. Please complete the form below to confirm your
                  participation as faculty.
                </p>
                <p className="mt-5 inline-flex items-center gap-2 border-l-4 border-[#b3122a] bg-[#f8e9ed] px-5 py-3 text-[clamp(1rem,1.8vw,1.35rem)] font-black uppercase tracking-[-.01em] text-[#b3122a]">
                  Complimentary · no payment required
                </p>
              </>
            ) : null}
          </header>

          {valid ? (
            <div className="pt-8">
              <RegisterForm variant="faculty" facultyKey={key as string} />
            </div>
          ) : (
            <div className="pt-10">
              <p className="max-w-[60ch] text-[15px] leading-[1.8] text-[#614d53]">
                This faculty registration link is not valid. Faculty registration is by invitation, so please use the
                link the secretariat sent you. If you no longer have it, contact us and we will send it again.
              </p>
              <p className="mt-6 text-[15px] leading-[1.9] text-[#160a0d]">
                <a href={`mailto:${conferenceConfig.contact.email}`} className="font-semibold text-[#b3122a]">
                  {conferenceConfig.contact.email}
                </a>
                <br />
                {registrationHelpline.name} · +91 {registrationHelpline.number}
              </p>
              <p className="mt-8 text-[13px] text-[#6a545a]">
                Registering as a delegate instead?{" "}
                <a href="/register" className="font-semibold text-[#b3122a] underline">
                  Delegate registration
                </a>
              </p>
            </div>
          )}
        </div>
      </main>
      <div className="relative z-10"><Footer /></div>
    </div>
  );
}
