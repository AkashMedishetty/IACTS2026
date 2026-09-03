import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/site/SmoothScroll";
import { eventJsonLd } from "@/lib/event-schema";
import { SessionProvider } from "@/components/providers/SessionProvider";

/* Self-hosted at build time by next/font — no runtime Google request, which is
   what keeps LCP honest on Indian mobile networks. */
const sans = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "800", "900"],
  variable: "--f-sans",
  display: "swap",
});

const display = Playfair_Display({
  subsets: ["latin"],
  weight: ["500", "700"],
  style: ["italic"],
  variable: "--f-display",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--f-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "IACTS Technocollege CME 2026 — The Future Is Now",
  description:
    "The Indian Association of Cardiovascular-Thoracic Surgeons presents Technocollege CME 2026. Hands-on surgical workshops, next-generation technology and scientific exchange. 23–25 October 2026, Hyderabad.",
  keywords: [
    "IACTS",
    "Technocollege CME 2026",
    "cardiothoracic surgery",
    "cardiac surgery conference India",
    "Hyderabad 2026",
    "NIMS Hyderabad",
  ],
  openGraph: {
    title: "IACTS Technocollege CME 2026 — The Future Is Now",
    description:
      "23–25 October 2026, Hyderabad. Hands-on workshops at NIMS, scientific programme at Dr. MCR HRD Institute.",
    type: "website",
    locale: "en_IN",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#fffdfc",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${sans.variable} ${display.variable} ${mono.variable}`}>
        <SmoothScroll />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-crimson focus:px-4 focus:py-2 focus:text-bone"
        >
          Skip to content
        </a>
        <SessionProvider>
          <div className="field-shell">{children}</div>
        </SessionProvider>
        <script
          type="application/ld+json"
          // structured data is static and contains no user input
          dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd()) }}
        />
      </body>
    </html>
  );
}
