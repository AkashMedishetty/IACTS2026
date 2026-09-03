import ConferenceHero from "@/components/home/ConferenceHero";
import About from "@/components/sections/About";
import Programme from "@/components/sections/Programme";
import Strata from "@/components/sections/Strata";
import Committee from "@/components/sections/Committee";
import Abstracts from "@/components/sections/Abstracts";
import Venues from "@/components/sections/Venues";
import Hyderabad from "@/components/sections/Hyderabad";
import Faq from "@/components/sections/Faq";
import RegisterCta from "@/components/sections/RegisterCta";
import Footer from "@/components/sections/Footer";

export default function Page() {
  return (
    <div className="conference-site relative isolate bg-[#fffdfc]">
      <main id="main">
        <ConferenceHero>
          <div className="conference-content relative z-10">
            <About />
            <Programme />
            <Strata />
            <Committee />
            <Abstracts />
            <Venues />
            <Hyderabad />
            <Faq />
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
