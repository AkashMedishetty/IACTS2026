import { conference, secretariat, venues } from "@/data/conference";

/**
 * schema.org Event JSON-LD.
 *
 * HONESTY: no `offers` block is emitted. Registration fees are unconfirmed,
 * and a fabricated price in structured data would be published to Google as a
 * factual claim about the conference. Same reason there is no `performer`
 * (faculty is not finalised) and no street address (both are null).
 *
 * Add `offers` only once the committee supplies real fees.
 */
export function eventJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: conference.name,
    alternateName: "IACTS Technocollege CME 2026",
    description: `${conference.positioning} ${conference.pillars.join(" ")} Hands-on surgical workshops, next-generation technology and scientific exchange, presented by the ${conference.association}.`,
    startDate: conference.dates.start,
    endDate: conference.dates.end,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    inLanguage: "en-IN",
    isAccessibleForFree: false,
    location: venues.map((v) => ({
      "@type": "Place",
      name: v.full,
      address: {
        "@type": "PostalAddress",
        addressLocality: "Hyderabad",
        addressRegion: "Telangana",
        addressCountry: "IN",
      },
    })),
    organizer: {
      "@type": "Organization",
      name: conference.association,
      alternateName: conference.acronym,
    },
    sponsor: {
      "@type": "Organization",
      name: conference.organisedBy,
    },
    audience: {
      "@type": "Audience",
      audienceType: "Cardiovascular and thoracic surgeons, residents and allied professionals",
    },
    about: {
      "@type": "Thing",
      name: "Cardiothoracic surgery",
    },
    email: secretariat.email,
  };
}
