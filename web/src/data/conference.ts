/**
 * CANONICAL CONTENT — every fact here is decoded from the client's own flyer.
 *
 * HONESTY RULE: anything the committee has not given us is `null` and must
 * render as an explicit "announced soon" state. Never invent a price, a
 * deadline, a credit-hour count, or a phone number.
 */

export const conference = {
  association: "Indian Association of Cardiovascular-Thoracic Surgeons",
  acronym: "IACTS",
  name: "IACTS Technocollege CME 2026",
  theme: "The Future Is Now !",
  values: ["Learn.", "Collaborate.", "Innovate.", "Transform."],
  positioning: "The Next Generation of Cardiothoracic Surgery.",
  pillars: ["Science.", "Skill.", "Innovation."],
  closing: "Advancing care today, shaping the future of tomorrow.",
  dates: { start: "2026-10-23", end: "2026-10-25", label: "23 — 25 October 2026" },
  city: "Hyderabad, India",
  organisedBy: "Department of CTVS, NIMS Hyderabad",
  registrationStatus: "open" as const,
} as const;

export const days = [
  {
    id: "workshop",
    date: "October 23, 2026",
    kicker: "Pre-Conference Workshop",
    venue: "NIMS (Nizam's Institute of Medical Sciences), Hyderabad",
    stage: "Approach",
    blurb:
      "Five parallel hands-on tracks, each with limited capacity.",
    items: [
      { title: "Hands-on Wet Lab Sessions", tag: "Cadaveric" },
      { title: "Robotic Simulation Training", tag: "Simulator" },
      { title: "Suturing & Anastomosis Lab", tag: "Bench" },
      { title: "Endovascular Skills Workshop", tag: "Cath lab" },
      { title: "Perfusion & ECMO Basics", tag: "Circuit" },
    ],
  },
  {
    id: "scientific",
    date: "October 24 & 25, 2026",
    kicker: "Scientific Programme",
    venue: "Dr. MCR HRD Institute Auditorium, Hyderabad",
    stage: "Exposure",
    blurb: "Two days of keynote lectures, orations, plenary sessions, panel discussions and submitted presentations.",
    items: [
      { title: "Keynote Lectures by Eminent Faculty", tag: "Plenary" },
      { title: "State-of-the-Art Orations", tag: "Oration" },
      { title: "Plenary Sessions", tag: "Plenary" },
      { title: "Didactic Lectures", tag: "Teaching" },
      { title: "Paper & Video Presentations", tag: "Submitted" },
      { title: "Panel Discussions", tag: "Debate" },
      { title: "Young Surgeons Forum", tag: "Trainee" },
    ],
  },
] as const;

/** The eight scientific highlights, verbatim from flyer page 2. */
export const highlights = [
  {
    title: "Hands-On",
    sub: "Surgical Workshops & Live Demonstrations",
    points: [
      "Cadaveric & simulation based workshops",
      "Live surgical demonstrations by experts",
      "Real-time guidance and feedback",
    ],
  },
  {
    title: "Next-Gen Technology",
    sub: "Plenary Sessions & Didactic Lectures",
    points: [
      "Cutting-edge innovations in cardiothoracic surgery",
      "Evidence-based updates from global experts",
      "Emerging technologies shaping the future",
    ],
  },
  {
    title: "Scientific Exchange",
    sub: "Interactive Scientific Panels",
    points: [
      "Debates & discussions on current controversies",
      "Multidisciplinary knowledge sharing",
      "Case-based learning sessions",
    ],
  },
  {
    title: "Collaboration",
    sub: "Networking Dinner & Scientific Interaction",
    points: [
      "Connect, collaborate & build the future together",
      "Networking with national & international faculty",
      "Strengthening professional partnerships",
    ],
  },
  {
    title: "Young Surgeons' Forum",
    sub: "A platform for emerging talent",
    points: [
      "Platform for young talent to present & interact",
      "Encouraging research & new ideas",
      "Mentorship & career guidance",
    ],
  },
  {
    title: "Best Paper & E-Poster Awards",
    sub: "Recognition of excellence",
    points: [
      "Recognition of excellence in research",
      "Encouraging innovation & academic growth",
      "Rewarding impactful contributions",
    ],
  },
  {
    title: "Patient Centric Care",
    sub: "Quality outcomes & patient safety",
    points: [
      "Focus on quality outcomes & patient safety",
      "Translating science into better patient care",
      "Patient-first approach in every decision",
    ],
  },
  {
    title: "Global Perspective",
    sub: "International faculty & collaborations",
    points: [
      "International faculty & global collaborations",
      "Insights into the future of cardiothoracic surgery",
      "Benchmarking best practices worldwide",
    ],
  },
] as const;

/** The six capabilities called out around the flyer's heart. */
export const capabilities = [
  { code: "01", title: "3D Anatomical Reconstruction", scope: "Imaging" },
  { code: "02", title: "AI-Assisted Segmentation", scope: "Compute" },
  { code: "03", title: "Precision Navigation", scope: "Intra-operative" },
  { code: "04", title: "Robotic Surgery Planning", scope: "Pre-operative" },
  { code: "05", title: "Real-Time Imaging", scope: "Intra-operative" },
  { code: "06", title: "Physiological Monitoring", scope: "Peri-operative" },
] as const;

export const patrons = [
  { name: "Dr. Rahul Devraj", role: "Director, NIMS Hyderabad" },
  { name: "Dr. P Chandrashekhar", role: "Dean, NIMS Hyderabad" },
] as const;

/** portrait: null until the committee supplies usable high-res files.
    The flyer crops are ~200-300px and are NOT web-usable. */
export const leadership = [
  { name: "Dr. G. Ravindra", role: "Organising Chairman", portrait: "/committee/ravindra.png" },
  { name: "Dr. Amaresh Rao Malempati", role: "Organising Secretary", portrait: "/committee/amaresh.png" },
  { name: "Dr. Tella Rama Krishna Dev", role: "Organising Co-Secretary", portrait: "/committee/rama-krishna.png" },
  { name: "Dr. Anita Bhalla", role: "Organising Co-Secretary", portrait: "/committee/anita.png" },
  { name: "Dr. Abhijeet Dashetwar", role: "Treasurer", portrait: "/committee/abhijeet.png" },
] as const;

export const executiveCommittee = [
  "Dr. Kaladhar",
  "Dr. P. S. S. Gopal",
  "Dr. Sai Surabhi",
  "Dr. Praveen",
  "Dr. Sahir Reddy",
  "Dr. Uday",
  "Dr. Bhargavi",
  "Dr. Sireesha",
  "Dr. Pramod",
  "Dr. Harshita",
  "Dr. Tribhuvan",
] as const;

export const venues = [
  {
    id: "nims",
    name: "NIMS Hyderabad",
    full: "Nizam's Institute of Medical Sciences",
    hosts: "Pre-Conference Workshop — October 23",
    address: null,
    image: "/venues/nims.jpg",
  },
  {
    id: "mcr",
    name: "Dr. MCR HRD Institute",
    full: "Dr. MCR HRD Institute Auditorium",
    hosts: "Scientific Programme — October 24 & 25",
    address: null,
    image: "/venues/mcr.jpg",
  },
] as const;

export const secretariat = {
  department: "Department of CTVS, NIMS",
  city: "Hyderabad, Telangana",
  email: "nimscvts@gmail.com",
  /** Supplied by the committee (absent from the flyer itself). */
  phones: [
    { name: "Dr. Abhijeet M Dashetwar", number: "9866010604" },
    { name: "Dr. K. Sahir Vardhan Reddy", number: "9177099793" },
  ],
} as const;

/** Everything the site must NOT invent. Surfaces read this to render
    honest "announced soon" states instead of placeholder values. */
export const pending = {
  /* Published — see config/pricing.config.ts for the authoritative matrix. */
  registrationFees: "published",
  delegateCategories: "published",
  abstractDeadline: null,
  abstractRules: null,
  cmeCreditHours: null,
  accreditingCouncil: null,
  sponsorshipTiers: null,
  accommodation: "early-bird-complimentary",
  sessionTimetable: null,
  phones: "published",
} as const;

export const closingPromises = [
  "Learn from Experts",
  "Experience Innovation",
  "Advance Your Practice",
  "Network & Collaborate",
  "Shape the Future",
] as const;
