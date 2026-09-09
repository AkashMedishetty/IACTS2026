import ConferenceHero from "@/components/home/ConferenceHero";
import About from "@/components/sections/About";
import ProgrammeStructure from "@/components/sections/ProgrammeStructure";
import Strata from "@/components/sections/Strata";
import Messages from "@/components/sections/Messages";
import Committee from "@/components/sections/Committee";
import Venues from "@/components/sections/Venues";
import Hyderabad from "@/components/sections/Hyderabad";
import RegisterCta from "@/components/sections/RegisterCta";
import Footer from "@/components/sections/Footer";

export default function Page() {
  return (
    <div className="conference-site relative isolate bg-[#fffdfc]">
      <main id="main">
        <ConferenceHero>
          <div className="conference-content relative z-10">
            <About />
            <ProgrammeStructure />
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
