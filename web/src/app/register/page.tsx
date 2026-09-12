import type { Metadata } from "next";
import SiteHeader from "@/components/site/SiteHeader";
import RegisterForm from "@/components/register/RegisterForm";
import Footer from "@/components/sections/Footer";
import { conference, creditPoints } from "@/data/conference";
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
      <main id="main" className="relative z-10 pb-24 pt-[104px]">
        {/* Same column as every other page, so the form lines up with the nav
            above it instead of sitting in its own 1180px box. */}
        <div className="u-shell">
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
            <p className="mt-5 inline-flex items-center gap-2 border-l-4 border-[#b3122a] bg-[#f8e9ed] px-5 py-3 text-[clamp(1rem,1.8vw,1.35rem)] font-black uppercase tracking-[-.01em] text-[#b3122a]">
              {tier} rate active{window?.endDate ? ` · until ${window.endDate.split("-").reverse().join("/")}` : ""}
            </p>
            {/* Applied for, not granted — keep the wording conditional. */}
            <p className="mt-5 max-w-[62ch] text-[15px] leading-[1.7] text-[#614d53]">
              <span className="font-semibold text-[#160a0d]">
                {creditPoints.abbreviation} credit points applied for
              </span>{" "}
              — {creditPoints.perDay} points per day across all {creditPoints.days} days,
              the pre-conference workshop included, for a total of {creditPoints.total} points,
              subject to {creditPoints.authority} approval.
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
