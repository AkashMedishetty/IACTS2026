import ConferenceHero from "@/components/home/ConferenceHero";
import About from "@/components/sections/About";
import Strata from "@/components/sections/Strata";
import Messages from "@/components/sections/Messages";
import Committee from "@/components/sections/Committee";
import Venues from "@/components/sections/Venues";
import Hyderabad from "@/components/sections/Hyderabad";
import RegisterCta from "@/components/sections/RegisterCta";
import Footer from "@/components/sections/Footer";

/**
 * Home page order is set by the committee review of 10 September 2026:
 * hero, then About the CME, then the eight scientific highlights, then the
 * Chairman's and Secretary's messages, then the committee.
 *
 * ProgrammeStructure was REMOVED from this page on the same instruction —
 * "all this will be coming in the programme" — so Day Zero, the four scientific
 * domains and the Breakthrough Sessions live on /programme only, not here.
 */
export default function Page() {
  return (
    <div className="conference-site relative isolate bg-[#fffdfc]">
      <main id="main">
        <ConferenceHero>
          <div className="conference-content relative z-10">
            <About />
            <Strata />
            <Messages />
            <Committee />
            <Venues />
            <Hyderabad />
            <RegisterCta />
          </div>
        </ConferenceHero>
      </main>
      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
}
