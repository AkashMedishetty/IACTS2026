import type { Metadata } from "next";
import PageShell from "@/components/site/PageShell";
import About from "@/components/sections/About";
import Strata from "@/components/sections/Strata";
import Messages from "@/components/sections/Messages";
import Committee from "@/components/sections/Committee";
import { conference } from "@/data/conference";

export const metadata: Metadata = { title: `About — ${conference.name}` };

/**
 * The 10 September 2026 committee review asked for this page to carry the SAME
 * information as the homepage: "the homepage and about will be the same."
 *
 * The reason given was navigational, not editorial — a delegate who lands on
 * Registration Details and then clicks About had no way back to the substance
 * without going via the logo: "where is all the information that I have just
 * seen … I wouldn't know that I have to click on this thing." So this page now
 * mounts the same four informational sections in the same order as the home
 * page, rather than About + Capabilities.
 */
export default function Page() {
  return (
    <PageShell title="About" lede={conference.positioning}>
      <About />
      <Strata />
      <Messages />
      <Committee />
    </PageShell>
  );
}
