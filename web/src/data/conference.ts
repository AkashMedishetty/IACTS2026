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
      "Hands-on sessions for postgraduate trainees, each with limited capacity.",
    items: [
      { title: "Young Innovators Forum", tag: "Forum" },
      { title: "Coronary Anastomosis Contest", tag: "Contest" },
      { title: "Advanced Aortic Workshop", tag: "Workshop" },
      { title: "Coronary anastomosis and valve anastomosis wet lab", tag: "Wet lab" },
      /* Added from New_additions.pdf, 10 September 2026. */
      { title: "MICS CABG planning and demo workshop", tag: "Workshop" },
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
  {
    name: "Dr. Rahul Devraj",
    title: "Chief Patron",
    role: "Director, NIMS Hyderabad",
    portrait: "/committee/rahul-devraj.jpg",
  },
  {
    name: "Dr. P. Chandrashekhar",
    title: "Co-Patron",
    role: "Dean, NIMS Hyderabad",
    portrait: "/committee/chandrashekhar.jpg",
  },
] as const;

/** portrait: null until the committee supplies usable high-res files.
    The flyer crops are ~200-300px and are NOT web-usable. */
/**
 * Office-bearers. `title` is the institutional designation, supplied in
 * New_additions.pdf after the 10 September 2026 review asked for these five to
 * carry the same "role + actual designation" treatment the patrons already had.
 *
 * portrait: these five files are ~81-106px flyer crops, an order of magnitude
 * smaller than the patrons' 704-760px photographs, which is why they render
 * visibly soft next to them. That is a SOURCE limitation, not a rendering bug —
 * replacing them needs real files from the committee.
 */
export const leadership = [
  {
    name: "Dr. G. Ravindra",
    role: "Organising Chairman",
    title: "Prof and HOD, CVTS, Gandhi Hospital",
    portrait: "/committee/ravindra.png",
  },
  {
    name: "Dr. Amaresh Rao Malempati",
    role: "Organising Secretary",
    title: "Prof and HOD, CVTS, NIMS",
    portrait: "/committee/amaresh.png",
  },
  {
    name: "Dr. Tella Rama Krishna Dev",
    role: "Organising Co-Secretary",
    title: "Prof and Unit Chief, CVTS, NIMS",
    portrait: "/committee/rama-krishna.png",
  },
  {
    name: "Dr. Anita Bhalla",
    role: "Organising Co-Secretary",
    title: "Prof and HOD, Osmania Medical College",
    portrait: "/committee/anita.png",
  },
  {
    name: "Dr. Abhijeet M Dashetwar",
    role: "Treasurer",
    title: "Prof and HOD, ESI Hospital, Hyderabad",
    portrait: "/committee/abhijeet.png",
  },
] as const;

/**
 * Executive committee. Portraits supplied by the committee on 9 September 2026.
 *
 * `portrait: null` means NO photograph was supplied for that member — it is not
 * a missing file to hunt for. Those two entries render the type-only treatment,
 * which is why the field is explicit rather than inferred from a filename that
 * happens not to exist.
 */
/**
 * Explicitly typed rather than `as const`: every member now has a photograph, so
 * literal narrowing collapsed `portrait` to `string` and TypeScript correctly
 * called the no-photo fallback unreachable. The fallback must survive for the
 * next member who joins without one, so the type stays `string | null`.
 */
export const executiveCommittee: readonly { name: string; portrait: string | null }[] = [
  { name: "Dr. B. Kaladhar", portrait: "/committee/kaladhar.jpg" },
  { name: "Dr. P. S. S. Gopal", portrait: "/committee/gopal.jpg" },
  { name: "Dr. P. Sai Surabhi", portrait: "/committee/sai-surabhi.jpg" },
  { name: "Dr. D. Praveen", portrait: "/committee/praveen.jpg" },
  { name: "Dr. K. Sahir Vardhan Reddy", portrait: "/committee/sahir-vardhan-reddy.jpg" },
  { name: "Dr. T. Uday", portrait: "/committee/uday.jpg" },
  { name: "Dr. A. Bhargavi", portrait: "/committee/bhargavi.jpg" },
  { name: "Dr. S. Sireesha", portrait: "/committee/sireesha.jpg" },
  { name: "Dr. J. Pramodh Reddy", portrait: "/committee/pramodh-reddy.jpg" },
  /* Surname initial added from New_additions.pdf (was "Dr. Harshita"). */
  { name: "Dr. Y. Harshita", portrait: "/committee/harshita.jpg" },
  { name: "Dr. M. Tribhuvan", portrait: "/committee/tribhuvan.jpg" },
];

export const venues = [
  {
    id: "nims",
    name: "NIMS Hyderabad",
    full: "Nizam's Institute of Medical Sciences",
    hosts: "Pre-Conference Workshop — October 23",
    address: "Punjagutta, Hyderabad, Telangana 500082",
    mapQuery: "Nizam's Institute of Medical Sciences, Punjagutta, Hyderabad",
    image: "/venues/nims.jpg",
  },
  {
    id: "mcr",
    name: "Dr. MCR HRD Institute",
    full: "Dr. MCR HRD Institute Auditorium",
    hosts: "Scientific Programme — October 24 & 25",
    address: "Road No. 25, Jubilee Hills, Hyderabad, Telangana 500033",
    mapQuery: "Dr. MCR HRD Institute of Telangana, Jubilee Hills, Hyderabad",
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

/**
 * What a delegate receives for the registration fee, from New_additions.pdf.
 *
 * Requested on the 10 September 2026 review specifically for residents and
 * trainees — "they'll be thinking what all I get … so that they know what they
 * are paying for." Verbatim from the client's list; do not embellish it, and do
 * not promise anything the committee has not listed here.
 */
export const registrationIncludes = [
  "Access to workshops",
  "Access to abstract submission",
  "Free accommodation for Early Birds",
  "Breakfast on Days 2 and 3",
  "Lunch on Days 1, 2 and 3",
  "Banquet dinner on Day 2",
] as const;

/**
 * CME credit. APPLIED FOR, not granted — the council has not confirmed, so the
 * wording here stays conditional and must not be upgraded to "accredited" or
 * "approved" until it does. Two points per day across all three days, the
 * pre-conference workshop day included, so six in total.
 *
 * `days` is derived from the conference dates rather than typed, so the total
 * cannot drift if the programme ever gains or loses a day.
 */
const conferenceDayCount =
  Math.round(
    (Date.parse(conference.dates.end) - Date.parse(conference.dates.start)) / 86_400_000,
  ) + 1;

export const creditPoints = {
  authority: "Telangana State Medical Council",
  abbreviation: "TSMC",
  status: "applied" as const,
  perDay: 2,
  days: conferenceDayCount,
  total: 2 * conferenceDayCount,
} as const;

/**
 * Registration helpline, supplied by the committee on 9 September 2026.
 * This is the number a delegate rings about registration itself — distinct
 * from the secretariat's scientific contacts above.
 */
export const registrationHelpline = {
  label: "Registration helpline",
  name: "Virinchi",
  number: "9014772432",
} as const;

/**
 * What the CME is and who it is for. Every sentence here is derived from the
 * Organising Secretary's own message (Organising_Secretary_message.pdf) and the
 * committee's programme note (About_the_techno_programme_.pdf) — nothing is
 * invented copy.
 */
export const about = {
  heading: "Built for the surgeons who will practise the next decade.",
  lede: "Conceived primarily for postgraduate students and young surgeons in the early stages of their careers, Technocollege is designed to bridge the gap between conventional surgical training and the rapidly evolving technological landscape of our specialty.",
  body: "Young surgeons should not have to wait until they are established in their careers to encounter the technologies that are transforming our specialty. Technocollege brings together young surgeons and pioneers of the field, creating an environment where experiences can be shared, ideas challenged and the learning curve shortened.",
  /** The Secretary's five verbs, verbatim: "to expose, train, question, interact and innovate". */
  verbs: ["Expose", "Train", "Question", "Interact", "Innovate"],
  closing:
    "Technocollege 2026 is not merely about predicting what cardiac and thoracic surgery will look like tomorrow. It is about experiencing the technology that is already shaping it today.",
  /**
   * About_the_techno_programme_.pdf, VERBATIM and complete.
   *
   * The 10 September committee review asked for exactly this text on the About
   * section — "we just want exactly what is written coming here" — rather than
   * the summarised version that was there. Do not paraphrase, reorder or trim
   * it, and do not split it back out into a structured Day-Zero/domains layout:
   * that layout was explicitly removed from the About section on the same call.
   */
  programmeNote: [
    "The programme begins on Day Zero with the Pre-conference Hands-on Workshops at Nizam's Institute of Medical Sciences, Hyderabad, providing postgraduate trainees with an opportunity to develop and refine essential surgical skills. Through focused practical sessions on vascular and coronary anastomosis, valve replacement techniques, CABG and Aortic surgical planning, participants will learn not merely what to do, but how to think through a surgical procedure.",
    "The following two days at Dr. Marri Channa Reddy Human Resource Development Institute will take participants beyond conventional CME learning. The scientific programme is structured around four major domains shaping the future of our specialty: Minimally Invasive and Robotic Cardiac Surgery; Aortic Surgery; Heart-Lung Transplantation; Complex Congenital and Thoracic Surgery, including VATS and Robotic Thoracic Surgery.",
    "A distinctive feature of Technocollege will be the Breakthrough Sessions, where industry partners and technology innovators will showcase emerging technologies and demonstrate their real-world applications. These sessions are intended to provide participants with an opportunity to see, understand and critically evaluate technologies that may define their practice in the years ahead.",
  ],
} as const;

/** Everything the site must NOT invent. Surfaces read this to render
    honest "announced soon" states instead of placeholder values. */
export const pending = {
  /* Published — see config/pricing.config.ts for the authoritative matrix. */
  registrationFees: "published",
  delegateCategories: "published",
  abstractDeadline: "2026-10-11",
  abstractRules: "published",
  cmeCreditHours: null,
  accreditingCouncil: null,
  sponsorshipTiers: null,
  accommodation: "early-bird-complimentary",
  sessionTimetable: null,
  phones: "published",
} as const;

/**
 * Welcome messages, supplied by the office-bearers themselves
 * (Organising_Chairman.pdf, Organising_Secretary_message.pdf). Verbatim —
 * these are signed statements and must not be paraphrased or trimmed.
 */
export const messages = [
  {
    id: "chairman",
    role: "Organising Chairman",
    name: "Dr. G. Ravindra",
    portrait: "/committee/ravindra.png",
    salutation: "Dear colleagues,",
    paragraphs: [
      "It gives me immense pleasure to welcome you all to IACTS Technocollege CME 2026, being conducted under the aegis of the Indian Association of Cardiovascular and Thoracic Surgeons.",
      "Technocollege is a timely initiative that brings together young surgeons, postgraduate trainees, experienced practitioners, innovators and technology leaders on a common platform. It is not simply a programme to learn new techniques; it is an opportunity to develop a mindset of adaptability, innovation and lifelong learning. The interactions, demonstrations and exchange of experiences during these three days will, I hope, inspire participants to look beyond the operating room of today and envision the possibilities of tomorrow.",
      "Hyderabad provides a wonderful setting for this meeting. A city that seamlessly combines a rich cultural heritage with a rapidly growing ecosystem of medicine, technology, innovation and entrepreneurship, Hyderabad truly reflects the spirit of this conference. I warmly invite all delegates to experience not only the scientific programme, but also the legendary hospitality, culture, cuisine and warmth of Hyderabad.",
      "I am confident that Technocollege 2026 will be an enriching experience—academically stimulating, professionally inspiring and personally memorable.",
      "I look forward to welcoming each one of you to Hyderabad and to this exciting journey into the future of cardiothoracic surgery.",
    ],
  },
  {
    id: "secretary",
    role: "Organising Secretary",
    name: "Dr. Amaresh Rao Malempati",
    portrait: "/committee/amaresh.png",
    salutation: "Dear Colleagues,",
    paragraphs: [
      "Cardiovascular and thoracic surgery is witnessing an unprecedented transformation. Technologies that were once considered futuristic—minimally invasive and robotic surgery, advanced aortic interventions, mechanical circulatory support, organ transplantation, image-guided procedures and sophisticated thoracic techniques—are rapidly becoming part of contemporary surgical practice. The future is no longer something we are waiting for; it is already happening in our operating rooms.",
      "It is with this conviction that we present IACTS Technocollege CME 2026, under the aegis of the Indian Association of Cardiovascular and Thoracic Surgeons (IACTS). Conceived primarily for postgraduate students and young surgeons in the early stages of their careers, Technocollege is designed to bridge the gap between conventional surgical training and the rapidly evolving technological landscape of our specialty.",
      "We believe that young surgeons should not have to wait until they are established in their careers to encounter the technologies that are transforming our specialty. Technocollege is therefore conceived as a platform to expose, train, question, interact and innovate. More importantly, it brings together young surgeons and pioneers of the field, creating an environment where experiences can be shared, ideas challenged and the learning curve shortened.",
      "Technocollege 2026 is not merely about predicting what cardiac and thoracic surgery will look like tomorrow. It is about experiencing the technology that is already shaping it today.",
      "The future is now. And we invite you to be a part of it.",
    ],
  },
] as const;

/**
 * Programme narrative, from About_the_techno_programme_.pdf. Day Zero is the
 * hands-on day at NIMS; the two following days at Dr. MCR HRD Institute are
 * structured around four domains plus the Breakthrough Sessions.
 */
export const programmeOverview = {
  dayZero: {
    label: "Day Zero",
    heading: "Pre-conference Hands-on Workshops",
    venue: "Nizam's Institute of Medical Sciences, Hyderabad",
    body: "Providing postgraduate trainees with an opportunity to develop and refine essential surgical skills. Through focused practical sessions on vascular and coronary anastomosis, valve replacement techniques, CABG and Aortic surgical planning, participants will learn not merely what to do, but how to think through a surgical procedure.",
    skills: [
      "Vascular and coronary anastomosis",
      "Valve replacement techniques",
      "CABG surgical planning",
      "Aortic surgical planning",
    ],
  },
  scientific: {
    label: "Days One & Two",
    heading: "Beyond conventional CME learning",
    venue: "Dr. Marri Channa Reddy Human Resource Development Institute",
    body: "The scientific programme is structured around four major domains shaping the future of our specialty.",
  },
  domains: [
    { code: "01", title: "Minimally Invasive and Robotic Cardiac Surgery" },
    { code: "02", title: "Aortic Surgery" },
    { code: "03", title: "Heart-Lung Transplantation" },
    { code: "04", title: "Complex Congenital and Thoracic Surgery", note: "Including VATS and Robotic Thoracic Surgery" },
  ],
  breakthrough: {
    heading: "Breakthrough Sessions",
    body: "A distinctive feature of Technocollege, where industry partners and technology innovators will showcase emerging technologies and demonstrate their real-world applications. These sessions are intended to provide participants with an opportunity to see, understand and critically evaluate technologies that may define their practice in the years ahead.",
  },
} as const;

export const closingPromises = [
  "Learn from Experts",
  "Experience Innovation",
  "Advance Your Practice",
  "Network & Collaborate",
  "Shape the Future",
] as const;
