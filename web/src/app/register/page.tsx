import type { Metadata } from "next";
import SiteHeader from "@/components/site/SiteHeader";
import RegisterForm from "@/components/register/RegisterForm";
import Footer from "@/components/sections/Footer";
import { conference } from "@/data/conference";
import { getCurrentTierKey, tierLabel } from "@/lib/registration";
import { conferenceConfig } from "@/config/conference.config";

export const metadata: Metadata = {
  title: `Register — ${conference.name}`,
  description: `Delegate registration for ${conference.name}, ${conference.dates.label}, ${conference.city}.`,
};

export default function RegisterPage() {
  const tier = tierLabel(getCurrentTierKey());
  const window = conferenceConfig.payment.tiers[getCurrentTierKey()];

  return (
    <div className="conference-site relative isolate min-h-svh">
      <SiteHeader cta={false} />
      <main id="main" className="relative z-10 px-[var(--gutter)] pb-24 pt-[92px]">
        <div className="mx-auto w-full max-w-[1180px]">
          <header className="border-b border-[var(--hair)] pb-8">
            <p className="flex items-center gap-3 font-mono text-[9px] uppercase tracking-[.24em] text-[#7d656c]">
              <span aria-hidden className="h-px w-8 bg-[#b3122a]" /> {conference.dates.label} · {conference.city}
            </p>
            <h1 className="mt-4 text-[clamp(2.2rem,6vw,4.5rem)] font-black uppercase leading-[.86] tracking-[-.06em] text-[#160a0d]">
              Delegate <span className="text-[#b3122a]">registration</span>
            </h1>
            <p className="mt-4 max-w-[54ch] text-[15px] leading-[1.7] text-[#614d53]">
              {conference.name} — {conference.organisedBy}. Complete the form below to reserve your place.
            </p>
            <p className="mt-4 inline-flex items-center gap-2 border border-[#b3122a]/20 bg-white px-3 py-1.5 font-mono text-[9px] uppercase tracking-[.16em] text-[#b3122a]">
              {tier} rate active{window?.endDate ? ` · until ${window.endDate.split("-").reverse().join("/")}` : ""}
            </p>
          </header>

          <div className="pt-8">
            <RegisterForm />
          </div>
        </div>
      </main>
      <div className="relative z-10"><Footer /></div>
    </div>
  );
}
