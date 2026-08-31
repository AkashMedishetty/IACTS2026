/**
 * House-pattern constants (EVENT_INFO / COLORS / STATS / NAV_ITEMS).
 *
 * These DERIVE from src/data/conference.ts — that file stays the single source
 * of truth for facts, and its `pending` export marks what the committee has
 * not supplied. Nothing here may introduce a new fact.
 */
import { conference, days, secretariat, pending } from "@/data/conference";

export const EVENT_INFO = {
  name: conference.name,
  acronym: conference.acronym,
  fullName: conference.association,
  organiser: conference.organisedBy,
  theme: conference.theme,
  positioning: conference.positioning,
  pillars: conference.pillars,
  values: conference.values,
  closing: conference.closing,
  dateLabel: conference.dates.label,
  start: conference.dates.start,
  end: conference.dates.end,
  city: conference.city,
  email: secretariat.email,
} as const;

export const COLORS = {
  ink: "#08080A",
  bone: "#F5F3EF",
  crimson: "#B3121C",
  crimsonLift: "#E0323C",
  maroon: "#7A0E14",
  gold: "#C18D21",
  goldLift: "#E4B75A",
  venous: "#689ECC",
  muted: "#8C8680",
} as const;

/**
 * Countable facts ONLY. Registration/attendance/faculty numbers are unknown,
 * so they are deliberately absent rather than invented — the reference sites
 * show "+800 registrations" because that event had a real figure.
 */
export const STATS = [
  { value: 3, label: "Days" },
  { value: days[0].items.length, label: "Hands-on Tracks" },
  { value: days[1].items.length, label: "Session Formats" },
  { value: 2, label: "Venues" },
] as const;

/**
 * Dock navigation. Every href MUST correspond to a real `id` on a rendered
 * section — the Dock resolves each one with getElementById, so a stale entry
 * renders a link that scrolls nowhere. `#about` was exactly that until
 * About.tsx was built. Verified against the rendered HTML, not just source.
 */
export const NAV_ITEMS = [
  { label: "About", href: "#about" },
  { label: "Programme", href: "#programme" },
  { label: "Workshops", href: "#workshops" },
  { label: "Faculty", href: "#faculty" },
  { label: "Committee", href: "#committee" },
  { label: "Abstracts", href: "#abstracts" },
  { label: "Awards", href: "#awards" },
  { label: "Industry", href: "#sponsors" },
  { label: "FAQ", href: "#faq" },
  { label: "Venue", href: "#venue" },
] as const;

/** Surfaces read this to render honest "announced soon" states. */
export const PENDING = pending;

export const CONCEPTS = [
  { id: "concept1", name: "The Operative Field", mechanic: "Scroll-driven dissection of an MRI-derived heart" },
  { id: "concept2", name: "The Helical Band", mechanic: "Torrent-Guasp myocardial band, three cardiac states" },
  { id: "concept3", name: "The Signal", mechanic: "One continuous ECG trace as the whole navigation" },
] as const;
