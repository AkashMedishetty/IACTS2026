import Nav from "@/components/site/Nav";
import Ribbon from "@/components/site/Ribbon";
import Footer from "@/components/site/Footer";
import Hero from "@/components/hero/Hero";
import Programme from "@/components/programme/Programme";
import Highlights from "@/components/highlights/Highlights";
import Capabilities from "@/components/highlights/Capabilities";
import Leadership from "@/components/people/Leadership";
import Committee from "@/components/people/Committee";
import Venues from "@/components/venue/Venues";
import RegisterCta from "@/components/venue/RegisterCta";

export default function Page() {
  return (
    <>
      <Nav />
      <main id="main">
        <Hero />
        <Ribbon />
        <Programme />
        <Capabilities />
        <Highlights />
        <Leadership />
        <Committee />
        <Venues />
        <RegisterCta />
      </main>
      <Footer />
    </>
  );
}
