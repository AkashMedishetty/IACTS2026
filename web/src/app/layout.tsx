import type { Metadata, Viewport } from "next";
import { Archivo, Instrument_Serif, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/site/SmoothScroll";
import { eventJsonLd } from "@/lib/event-schema";

/* next/font downloads and SELF-HOSTS these at build time — no runtime request
   to Google, which is what keeps LCP honest on Indian mobile networks. */
const display = Archivo({
  subsets: ["latin"],
  weight: ["400", "600", "800", "900"],
  variable: "--f-display",
  display: "swap",
});

const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: "italic",
  variable: "--f-serif",
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
  themeColor: "#f7f4ef",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${serif.variable} ${mono.variable}`}>
        <SmoothScroll />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-crimson focus:px-4 focus:py-2 focus:text-bone"
        >
          Skip to content
        </a>
        <div className="field-shell">{children}</div>
        <script
          type="application/ld+json"
          // structured data is static and contains no user input
          dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd()) }}
        />
      </body>
    </html>
  );
}
