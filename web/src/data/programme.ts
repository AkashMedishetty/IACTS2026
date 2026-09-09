/**
 * FULL SCIENTIFIC PROGRAMME — transcribed from the client's own
 * IACTS Trade Brochure V5, which publishes the session-by-session schedule
 * with times and named faculty.
 *
 * PROVENANCE MATTERS HERE. conference.ts deliberately says "session timings and
 * faculty to be announced", because at the time it was written the committee had
 * not published them. This module is the committee's published version and is
 * the only place that detail lives. Two things follow:
 *
 *   1. Faculty marked `tentative` are flagged in the source document itself.
 *      Keep the flag; do not quietly promote a tentative name to confirmed.
 *   2. If the committee reissues the programme, edit THIS file — it is the sole
 *      source for the brochure's programme pages.
 */

export interface Slot {
  time?: string;
  title: string;
  who?: string;
  /** A break, a panel, or a headline moment — rendered differently from a talk. */
  kind?: "break" | "panel" | "keynote" | "ceremony";
  tentative?: boolean;
}

export interface SessionBlock {
  code?: string;
  title: string;
  window?: string;
  slots: Slot[];
  note?: string;
}

/** Day Zero — the five parallel stations at NIMS. */
export const day0Stations = [
  {
    code: "01",
    title: "Aortic Surgery Laboratory",
    blurb: "Hands-on training in contemporary aortic surgical techniques and technologies.",
  },
  {
    code: "02",
    title: "Coronary Anastomosis Laboratory",
    blurb: "Focused training in the principles and practice of coronary anastomosis.",
  },
  {
    code: "03",
    title: "Technology Olympics",
    blurb: "A competitive surgical skills challenge across coronary, aortic, robotic and MIS skills.",
  },
  {
    code: "04",
    title: "Innovation Display & Young Innovators' Forum",
    blurb: "A platform to present innovative ideas, devices, techniques and technology solutions.",
  },
  {
    code: "05",
    title: "Young Surgeons' Paper Presentation",
    blurb: "A competitive scientific session showcasing high-quality trainee research.",
  },
] as const;

export const day0 = {
  label: "Day 0",
  date: "23 October 2026",
  window: "8:30 AM – 6:00 PM",
  title: "Surgical Skills & Innovation",
  venue: "NIMS · Nizam's Institute of Medical Sciences, Punjagutta",
  blurb:
    "A highly interactive, capacity-limited pre-conference workshop for postgraduate trainees, fellows and young surgeons — five core components run in parallel stations.",
  closing: "Every station is built around doing — not watching.",
} as const;

/** Day 1 — 24 October, Dr. MCR HRD Auditorium. */
export const day1: { label: string; date: string; window: string; venue: string; title: string; blocks: SessionBlock[] } = {
  label: "Day 1",
  date: "24 October 2026",
  window: "8:15 AM – 6:00 PM",
  venue: "Dr. MCR HRD Auditorium",
  title: "Minimally Invasive, Robotic & Aortic",
  blocks: [
    {
      title: "Inauguration & Keynote",
      window: "8:15 – 10:45 AM",
      slots: [
        { time: "8:15", title: "Registration & Breakfast", kind: "break" },
        { time: "9:00", title: "Inauguration · The Future-Ready Cardiothoracic Surgeon", who: "Welcome address & introduction to IACTS TechnoCollege" },
        {
          time: "9:45",
          title: "Keynote — Scientific Fervour: From Curiosity to Discovery & Innovation",
          who: "Prof. V. Ramgopal Rao · Group Vice-Chancellor, BITS Pilani",
          kind: "keynote",
          tentative: true,
        },
        { time: "10:30", title: "Keynote Discussion", kind: "panel" },
        { time: "10:45", title: "Tea Break", kind: "break" },
      ],
    },
    {
      code: "S1",
      title: "Minimally Invasive & Robotic Cardiac Surgery",
      window: "11:00 AM – 1:00 PM",
      slots: [
        { time: "11:00", title: "MICS in 2026: Where Should a Young Surgeon Start?", who: "Dr. Nitin Rajput" },
        { time: "11:15", title: "Mini-MVR: Patient Selection, Port Placement & Exposure", who: "Dr. Nitin Rajput" },
        { time: "11:30", title: "Mini-AVR: How I Do It", who: "Dr. Nagesh" },
        { time: "11:45", title: "Robotic Mitral Surgery: From Simulation to Independent Surgery", who: "Dr. Vishal Khante" },
        { time: "12:00", title: "Robotic CABG: What Does the Evidence Really Show?", who: "Dr. Gokhale" },
        { time: "12:15", title: "Endoscopic / Robotic Conduit Harvesting", who: "Dr. Ritwick Bhuyan" },
        { time: "12:30", title: "Cannulation & Perfusion Strategies for MICS", who: "Dr. Nagesh" },
        { time: "12:45", title: "Panel — Is Robotic Cardiac Surgery Ready for Every Centre?", who: "Expert Panel", kind: "panel" },
        { time: "1:00", title: "Lunch", kind: "break" },
      ],
    },
    {
      code: "S2",
      title: "Contemporary Aortic Surgery",
      window: "1:45 – 3:45 PM",
      slots: [
        { time: "1:45", title: "Acute Type A Dissection: The First 30 Minutes", who: "Dr. Praveen Varma" },
        { time: "2:00", title: "Aortic Root: Valve-Sparing vs Bentall — How I Decide", who: "Dr. Idhrees" },
        { time: "2:15", title: "Arch Replacement: Cerebral Protection Strategies", who: "Dr. Idhrees" },
        { time: "2:30", title: "Frozen Elephant Trunk: Who Needs It and How I Do It", who: "Dr. Amaresh Rao Malempati" },
        { time: "2:45", title: "Hybrid Arch & TEVAR: Where Does the Surgeon Fit?", who: "Dr. Kaladhar" },
        { time: "3:00", title: "Proximal Anastomotic Devices: Do We Really Need Them?", who: "Dr. Praveen Varma" },
        { time: "3:15", title: "Choosing the Right Graft", who: "Dr. Amaresh Rao Malempati" },
        { time: "3:30", title: "Aortic Case Battle — Two Surgeons, One Difficult Arch Case", who: "Expert Panel", kind: "panel" },
      ],
      note:
        "Case battle decision points — operative strategy · cannulation · cerebral protection · extent of arch replacement · FET vs conventional · hybrid options · management of complications.",
    },
    {
      code: "S3",
      title: "Pediatric & The Digital Surgeon",
      window: "4:00 – 5:30 PM",
      slots: [
        { time: "4:00", title: "Pediatric Valve Repairs: Principles and Pitfalls", who: "Dr. Rajasekhar" },
        { time: "4:15", title: "Changing Face of Redo Surgery in the Pediatric Population", who: "Dr. Rajasekhar" },
        { time: "4:30", title: "AI in Cardiac Surgery: From ChatGPT to the Operating Room", who: "Dr. Amaresh Rao" },
        { time: "4:45", title: "AI for Postoperative Follow-up Care: AID–PaMS", who: "Mr. Khetan Bhokray" },
        { time: "5:00", title: "Digital Twin, VR & Surgical Simulation: Where Are We Going?", who: "University of Hyderabad" },
        { time: "5:15", title: "Interactive Panel — Will AI Replace the Surgeon, or the Surgeon Who Doesn't Use AI?", who: "Expert Panel", kind: "panel" },
      ],
    },
  ],
};

/** Closes Day 1 — three short talks. */
export const youngSurgeonsToolkit = {
  title: "The Young Surgeon's Toolkit",
  window: "5:30 – 6:00 PM · three short talks",
  items: [
    {
      title: "Personal Finance for Young Surgeons",
      blurb: "Building financial independence from day one of a surgical career.",
    },
    {
      title: "Entrepreneurship for the Young Surgeon",
      blurb: "From clinical problem to sustainable enterprise.",
    },
    {
      title: "Academic & Professional Identity",
      blurb: "Research, networking, teaching and responsible social media.",
    },
  ],
} as const;

/** Day 2 — 25 October, Dr. MCR HRD Auditorium. */
export const day2: { label: string; date: string; window: string; venue: string; title: string; blocks: SessionBlock[] } = {
  label: "Day 2",
  date: "25 October 2026",
  window: "9:00 AM – 6:00 PM",
  venue: "Dr. MCR HRD Auditorium",
  title: "Transplant, Thoracic & Innovation",
  blocks: [
    {
      code: "S4",
      title: "Heart, Lung & Heart–Lung Transplantation",
      window: "9:00 – 11:00 AM",
      slots: [
        { time: "9:00", title: "Heart Transplantation in India: Where Are We Today?", who: "Dr. Kaladhar" },
        { time: "9:15", title: "Recipient Selection: Who Should Get a Transplant?", who: "Dr. Bala Subramanyam" },
        { time: "9:30", title: "Donor Management & Organ Procurement: The Critical Steps", who: "Dr. Bala Subramanyam" },
        { time: "9:45", title: "Lung Transplantation: What a Cardiac Surgeon Should Know", who: "Dr. Attawar" },
        { time: "10:00", title: "Heart–Lung Transplantation: When and How?", who: "Dr. Attawar" },
        { time: "10:15", title: "LVAD: Bridge, Destination or Bridge-to-Decision?", who: "Dr. Gokhale" },
        { time: "10:30", title: "ECMO as Bridge to Transplant / Recovery", who: "Dr. Gokhale" },
        { time: "10:45", title: "Panel — Optimal Management in CAD & Congestive Heart Failure", who: "Expert Panel", kind: "panel" },
        { time: "11:00", title: "Tea Break", kind: "break" },
      ],
    },
    {
      code: "S5",
      title: "VATS, Robotic & Minimally Invasive Thoracic Surgery",
      window: "11:15 AM – 1:15 PM",
      slots: [
        { time: "11:15", title: "VATS in 2026: What Every Young Thoracic Surgeon Must Know", who: "Dr. P. S. S. Gopal" },
        { time: "11:30", title: "Robotic Lobectomy: How I Do It", who: "Dr. Aravind" },
        { time: "11:45", title: "Robotic Thoracic Surgery: Is It Worth the Investment?", who: "Dr. Bala Subramanyam" },
        { time: "12:00", title: "Uniportal VATS: Getting Started", who: "Dr. Manjunath Bale" },
        { time: "12:15", title: "Complex Segmentectomy: Beyond the Basics", who: "Dr. Bala Subramanyam" },
        { time: "12:30", title: "Mediastinal Surgery Through Minimal Access", who: "Dr. P. S. S. Gopal" },
        { time: "12:45", title: "VATS Thymectomy: Tips for the Young Surgeon", who: "Dr. Manjunath Bale" },
        { time: "1:00", title: "Panel — Making Sense of Newer Hardware in Thoracic Surgery", who: "Expert Panel", kind: "panel" },
        { time: "1:15", title: "Lunch & Innovation Display", kind: "break" },
      ],
    },
    {
      code: "S6",
      title: "From Surgical Problem to MedTech Innovation",
      window: "2:00 – 3:30 PM",
      slots: [
        { time: "2:00", title: "From Surgical Problem to Device: Where Do I Start?" },
        { time: "2:10", title: "Design Thinking for Surgeons" },
        { time: "2:20", title: "Patent vs Publication: What Should I Do First?" },
        { time: "2:30", title: "Prototype to Product: The MedTech Journey" },
        { time: "2:40", title: "Regulatory Approval in India: What a Surgeon Needs to Know" },
        { time: "2:50", title: "Working with Engineers: How Not to Kill Your Idea" },
        {
          time: "3:00",
          title: "Young Innovators' Pitch Session",
          who: "Problem → Idea → Prototype → Impact → What's Next",
          kind: "panel",
        },
      ],
    },
    {
      code: "S7",
      title: "Research That Changes Practice",
      window: "3:45 – 4:45 PM",
      slots: [
        {
          time: "3:45",
          title: "Clinical Problem to Research Question — and Publishing Your First Good Paper",
          who: "A practical master class for trainees and young surgeons",
        },
        {
          time: "4:15",
          title: "Big Data, Registries & Real-World Evidence in CVTS",
          who: "Registries, AI-enabled datasets and multicentre collaboration",
        },
      ],
    },
  ],
};

/** The closing panel that ends Day 2. */
export const cvts2035 = {
  code: "S8",
  title: "CVTS 2035 — The Future Operating Room",
  window: "4:45 – 5:30 PM",
  question: "What will the young surgeon actually need to learn?",
  topics: [
    "Robotics",
    "Artificial intelligence",
    "AR & VR",
    "Surgical simulation",
    "Digital twins",
    "Image-guided surgery",
    "3-D printing",
    "Transcatheter–surgical convergence",
    "Remote & telesurgery",
    "Personalised surgery",
    "Tissue engineering",
    "Implantable sensors",
    "Autonomous surgical assistance",
  ],
  panel: [
    "Cardiac Surgeon",
    "Thoracic Surgeon",
    "Transplant Surgeon",
    "Robotic Surgeon",
    "AI / Data Scientist",
    "Biomedical Engineer",
    "Industry Representative",
    "Young CVTS Surgeon",
  ],
  closing: {
    title: "Closing Ceremony · The Next-Generation Cardiothoracic Surgeon",
    body:
      "Operate well. Think critically. Research relentlessly. Innovate responsibly. Embrace technology without losing the art of surgery.",
  },
} as const;

/** Industry × surgeon technology labs, run alongside the scientific programme. */
export const technologyLabs = [
  {
    title: "Robotic Surgery Lab",
    blurb: "Console · camera control · instrument manipulation · needle driving · suturing · knot tying · emergency undocking",
  },
  {
    title: "Aortic Technology Lab",
    blurb: "Frozen Elephant Trunk · TEVAR · hybrid arch · proximal anastomotic devices · aortic grafts · cerebral protection",
  },
  {
    title: "Coronary Anastomosis Lab",
    blurb: "Anastomotic devices · surgical instruments · sutures · beating-heart simulation · microsurgical techniques",
  },
  {
    title: "Thoracic Stapling Lab",
    blurb: "Vascular · bronchial · parenchymal and difficult-angle stapling · staple-line reinforcement · troubleshooting",
  },
  {
    title: "ECMO & MCS Lab",
    blurb: "ECMO cannulation · circuit configuration · troubleshooting · LVAD technology · emergency MCS scenarios",
  },
  {
    title: "Digital Surgery Lab",
    blurb: "3-D surgical planning · VR simulation · digital twins · AI-assisted imaging · surgical video analytics",
  },
] as const;

/** The formats the programme is built from. */
export const signatureFormats = [
  "“How I Do It” technical presentations",
  "Hands-on surgical laboratories & tech demos",
  "Technology Olympics — competitive skills",
  "Case battles & expert panels",
  "Young Innovators' pitch & paper sessions",
  "AI, digital twins & simulation",
  "Entrepreneurship & personal finance",
  "Industry technology labs",
] as const;

/** The three-day arc, as the committee summarises it. */
export const threeDayFlow = [
  {
    label: "Day 0",
    title: "Pre-Conference Workshop",
    blurb:
      "Surgical skills & innovation — aortic and coronary labs, Technology Olympics, innovation forum and young surgeons' papers.",
  },
  {
    label: "Day 1",
    title: "MIS, Robotic & Aortic Surgery",
    blurb:
      "The new operating room — MICS, robotics, contemporary aortic surgery, pediatric and the digital surgeon.",
  },
  {
    label: "Day 2",
    title: "Transplant, Thoracic & Innovation",
    blurb:
      "Heart/lung transplant and MCS, VATS and robotic thoracic, surgeon-led MedTech, research and the future of CVTS.",
  },
] as const;
