/**
 * THE SCIENTIFIC SCHEDULE, from the committee's two spreadsheets of
 * 30 September 2026: "Scientific Schedule Final" and
 * "Workshop_Breakthrough_Final".
 *
 * The sheet heads itself "TENTATIVE SCIENTIFIC SCHEDULE", and several talks are
 * marked unconfirmed by the committee. Both facts are carried through to the
 * page rather than smoothed over: `scheduleStatus` prints the tentative notice,
 * and an unconfirmed talk keeps the committee's own wording ("To Be Confirmed",
 * "Subject To Confirmation", "Yet To Be Confirmed").
 *
 * WHAT WAS CHANGED IN TRANSCRIPTION, and nothing else:
 *  - Times are written consistently as "8:30 – 8:50 am"; the sheet mixes dots
 *    and spacing. No time was moved.
 *  - Plain English typos in session titles are corrected: VALIDECTORY →
 *    Valedictory, Pediartic → Pediatric, Enchaned → Enhanced, MItral → Mitral,
 *    Veinn → Vein.
 *  - Speaker names are spelled as the published faculty list spells them, where
 *    they are plainly the same person (Gokahle → Gokhale, Muthirevula →
 *    Mutharevula, Nithin → Nitin Kumar Rajput, Smirti → Smriti Ranjan Mohanty,
 *    Dopade → Dhopade, Kutti → Kutty, and the missing
 *    space in "Dr.Vitaly").
 *  - One supplied time ran backwards ("3.30 - 3.15pm", High Tea on day two) and
 *    clashed with the panel that followed. Corrected on the committee's
 *    instruction, 30 September 2026: High Tea is 3:30 – 3:45 pm and everything
 *    after it moves 30 minutes later, so day two now closes at 5:10 pm.
 *  - "Dr. Balasubramanyam" and "Dr. Balasubramoniam K R" are one person; the
 *    faculty-list spelling is used for both talks, on the same instruction.
 */

export type ScheduleKind = "talk" | "panel" | "break" | "ceremony" | "special" | "session";

export interface ScheduleItem {
  /** The committee's own running number, where the sheet gives one. */
  n?: number;
  time?: string;
  title: string;
  speaker?: string;
  track?: string;
  kind: ScheduleKind;
  /** A "session" item opens a numbered session; these are its chairpersons. */
  chairpersons?: readonly string[];
  /** Panel discussions: moderator and panelists. */
  moderator?: string;
  panelists?: readonly string[];
  /** Ceremonies: the dignitaries on the dais. */
  guests?: readonly string[];
}

export interface ScheduleDay {
  id: string;
  label: string;
  date: string;
  venue: string;
  items: readonly ScheduleItem[];
}

export const scheduleStatus = "Timings may be adjusted on the day.";

/**
 * 23 October, NIMS. Two halls run in parallel. Faculty and timings from the
 * committee's revised "Workshop_Breakthrough_Final" sheet, 15 October 2026.
 * Names follow the committee list's spelling where it is the same person
 * (Dr. B. Kaladhar, Dr. P. S. S. Gopal, Dr. P. Sai Surabhi, Dr. D. Praveen);
 * "Dr. Naresh K L" is as supplied.
 */
export const workshopHalls = [
  {
    hall: "Hall A",
    items: [
      { time: "9:00 – 11:00 am", title: "Applied Anatomy of Heart", faculty: ["Dr. Anil Tendolkar"] },
      { time: "11:00 am – 1:00 pm", title: "Coronary Anastomosis", faculty: ["Dr. P. S. S. Gopal", "Dr. B. Kaladhar"] },
      { time: "2:00 – 4:00 pm", title: "Valve Replacement", faculty: ["Dr. P. Sai Surabhi", "Dr. D. Praveen"] },
      { time: "4:00 – 6:00 pm", title: "Proximal Coronary Anastomosis Contest", faculty: ["Dr. Abhijeet M Dashetwar", "Dr. Vinayak Shukla"] },
    ],
  },
  {
    hall: "Hall B",
    items: [
      { time: "9:00 – 11:00 am", title: "Sizing and Planning for FET — Aortic Aneurysm and Dissection", faculty: ["Dr. Niranjan Hiremath"] },
      { time: "11:00 am – 1:00 pm", title: "Deployment of FET", faculty: ["Dr. Niranjan Hiremath"] },
      { time: "2:00 – 3:00 pm", title: "MICS CABG Planning & Demo Workshop Simulator", faculty: ["Dr. Naresh K L", "Dr. Vishal Khante", "Dr. Nagesh Ayalasomayajula", "Dr. Harish Badami"] },
      { time: "3:00 – 5:00 pm", title: "Endoscopic Saphenous Vein and Radial Artery Harvest Simulation", faculty: ["Dr. Devika Krishnakumar"] },
    ],
  },
] as const;

/** Lunch on the workshop day, shared by both halls. */
export const workshopLunch = "1:00 – 2:00 pm";

/**
 * Breakthrough Sessions. They sit on 24 October, not on the workshop day, and
 * run alongside the main scientific programme rather than after it — moved and
 * labelled on the committee's instruction, 2 October 2026.
 */
export const breakthroughNote = "Hall B · runs in parallel with the main scientific programme in Hall A.";
export const breakthroughDayId = "day-1";

export const breakthroughTopics = [
  "Young Surgeon's Forum",
  "Women in Cardiothoracic Surgery",
  "Demo on Endoscopic Saphenous Vein and Radial Artery Harvest",
  "ECMO, Cell Saver",
  "CentriMag, LVAD",
  "Perceval Sutureless Valve — Demo and Implantation",
  "NIMS Alumni Get-Together",
  "AIIMS Alumni Get-Together",
  "Sri Jayadeva Institute of Cardiovascular Sciences and Research Alumni Get-Together",
  "Abstract Presentations",
] as const;

/** Breakthrough Sessions run in Hall B, alongside the main programme in Hall A. */
export const breakthroughHall = "Hall B";

/*
 * Days 1 and 2 from the committee's "Scientific Schedule IACTS Techno College
 * CME 2026" (19 October 2026), which supersedes the 30 September sheet: talks
 * are now grouped into numbered sessions with chairpersons, both days run in
 * Hall A, and several speakers and topics changed.
 *
 * Its time cells were exported overlapping ("8.30 - 8.50am 8.50 -"); each row
 * runs from its own start to the next row's, which is how they are written
 * here. Speakers use the faculty list's spelling where they are plainly the
 * same person (Rajashekar — his own spelling, 22 Oct 2026 —, Gokhale, Mutharevula, Dhopade, Balasubramoniam K R,
 * Chandrashekhar, Amaresh Rao Malempati); "Pediartic", "Veinn" and
 * "orMereHype" are corrected. The PDF writes both "Smruti" and the faculty
 * list "Smriti" Ranjan Mohanty — the faculty-list spelling is used.
 */
const S = (title: string, chairpersons: string[]): ScheduleItem => ({ title, kind: "session", chairpersons })

const day1: ScheduleDay = {
  id: "day-1",
  label: "Day 1",
  date: "24 October 2026",
  venue: "Dr. MCR HRD Institute Auditorium · Hall A",
  items: [
    S("Session 1", ["Dr. Vinayak Shukla", "Dr. Prasanna Simha Rao", "Dr. Rajashekar K V", "Dr. Rakesh Naik L"]),
    { n: 1, time: "8:30 – 8:50 am", speaker: "Dr. Praveen Varma", title: "Aortic Root Anatomy for the Modern Times", kind: "talk" },
    { n: 2, time: "8:50 – 9:10 am", speaker: "Dr. Vikram Reddy", title: "A Beginner's Guide to an Aortic Surgery Programme", kind: "talk" },
    { n: 3, time: "9:10 – 9:30 am", speaker: "Dr. P V Naresh", title: "Newer Hardware — Simplifying Complex Aortic Surgeries", kind: "talk" },
    { n: 4, time: "9:30 – 9:50 am", speaker: "Dr. Tushar Dhopade", title: "Surgeon Driven Structural Heart Programme", kind: "talk" },
    S("Session 2", ["Dr. R V Kumar", "Dr. Vijay Grover", "Dr. K Ganapathy Subramaniam", "Dr. Vivek Tewarson"]),
    { n: 5, time: "9:50 – 10:10 am", speaker: "Dr. Devagourou Velayoudam", title: "The Narrow Aortic Root", kind: "talk" },
    { n: 6, time: "10:10 – 10:30 am", speaker: "Dr. Gopichand Mannam", title: "The Frozen Elephant Trunk", kind: "talk" },
    { n: 7, time: "10:30 – 10:50 am", speaker: "Dr. Lokeshwar Rao Sajja", title: "Predict Trial — India's Own Trial Comparing Grafting Strategies", kind: "talk" },
    { n: 8, time: "10:50 – 11:10 am", speaker: "Dr. B Bhaskar Rao", title: "The Entrepreneurial Cardiac Surgeon — From Clinical Expertise to Creating Value", kind: "talk" },
    {
      time: "11:10 am – 12:10 pm",
      title: "Inaugural Ceremony",
      kind: "ceremony",
      guests: ["Dr. Satyajit Bose", "Dr. Jacob Jamesraj", "Dr. P N Rao", "Dr. S Vengal Reddy", "Dr. Chirag Doshi", "Dr. Rahul Devraj", "Dr. P. Chandrashekhar", "Dr. Amaresh Rao Malempati", "Dr. Abhijeet M Dashetwar"],
    },
    { n: 9, speaker: "Dr. Chirag Doshi", title: "Keynote Address: Strategic Roadmap for Young Cardiac Surgeons", kind: "special" },
    S("Session 3", ["Dr. Dharma Rakshak", "Dr. Satya Sridhar K", "Dr. Manish Pangi", "Dr. Renjith S"]),
    { n: 10, time: "12:10 – 12:30 pm", speaker: "Dr. Satyajit Bose", title: "Valve Sparing Aortic Root Surgeries", kind: "talk" },
    { n: 11, time: "12:30 – 12:50 pm", speaker: "Dr. Niranjan Hiremath", title: "Hybrid Arch Procedures", kind: "talk" },
    { time: "12:50 – 1:35 pm", title: "Lunch", kind: "break" },
    S("Session 4", ["Dr. G Ramasubrahmanyam", "Dr. Namrata Gaur", "Dr. Sandeep Khanzode", "Dr. Rashmi Arunkumar"]),
    { n: 12, time: "1:35 – 1:55 pm", speaker: "Dr. Manoj Durairaj", title: "Beginner's Guide to Starting a Thoracic Organ Transplant Program", kind: "talk" },
    { n: 13, time: "1:55 – 2:15 pm", speaker: "Dr. Sandeep Attawar", title: "Mechanical Circulatory Support & Thoracic Transplant: Where do Young Surgeons fit in?", kind: "talk" },
    { n: 14, time: "2:15 – 2:35 pm", speaker: "Dr. Maruti Haranal", title: "Complex Redo's and The Changing Face of Pediatric Cardiac Surgery", kind: "talk" },
    { n: 15, time: "2:35 – 2:55 pm", speaker: "Dr. P. Rajashekar", title: "Pediatric Aortic and Mitral Valve Repairs", kind: "talk" },
    { n: 16, time: "2:55 – 3:15 pm", speaker: "Dr. Alla Gopala Krishna Gokhale", title: "Heart Transplant in Borderline Recipients", kind: "talk" },
    { n: 17, time: "3:15 – 3:35 pm", speaker: "Dr. Dhaval Naik", title: "Starting an LVAD Program", kind: "talk" },
    { time: "3:35 – 3:50 pm", title: "High Tea Break", kind: "break" },
    S("Session 5", ["Dr. N Nageshwar Rao", "Dr. Krishna Prasad", "Dr. S Vengal Reddy", "Dr. Sai Krishna C"]),
    { n: 18, time: "3:50 – 4:10 pm", speaker: "Dr. Balasubramoniam K R", title: "Workflow of Lung Transplant", kind: "talk" },
    { n: 19, time: "4:10 – 4:30 pm", speaker: "Dr. C S Hiremath", title: "Evolution of Homograft Valve Bank in India", kind: "talk" },
    { n: 20, time: "4:30 – 4:50 pm", speaker: "Dr. Sridhar Bodapati", title: "AI as Surgeon's Practice Co-pilot: Evidence, Planning, Communication & Research", kind: "talk" },
    { n: 21, time: "4:50 – 5:05 pm", speaker: "Dr. Prashant Vaijyanath", title: "Transcatheter Structural Heart Interventions", kind: "talk" },
    { n: 22, time: "5:05 – 5:20 pm", speaker: "Dr. Prashant Vaijyanath", title: "The Active Role of the Endo-Cardiovascular Surgeon in the Heart Team", kind: "talk" },
    {
      time: "5:20 – 5:50 pm",
      title: "Panel Discussion — Legal Issues in a Cardiac Surgeon Driven Structural Heart Program",
      kind: "panel",
      panelists: ["Dr. Prashant Vaijyanath", "Dr. Shailesh Jain", "Dr. Tushar Dhopade", "Dr. Varun G"],
    },
    { time: "5:50 pm", title: "Quiz", kind: "special" },
    { n: 23, speaker: "Dr. Vinitha Nair", title: "Quiz Master", kind: "special" },
    { time: "7:30 – 10:30 pm", title: "Gala Dinner", kind: "break" },
  ],
};

const day2: ScheduleDay = {
  id: "day-2",
  label: "Day 2",
  date: "25 October 2026",
  venue: "Dr. MCR HRD Institute Auditorium · Hall A",
  items: [
    S("Session 6", ["Dr. Vinayak Shukla", "Dr. Sanjeev Rao", "Dr. Pramod Reddy K"]),
    { n: 1, time: "8:30 – 8:50 am", speaker: "Dr. Sai Kiran", title: "Beginner's Guide to Start MICS Valvular Heart Surgery", kind: "talk" },
    { n: 2, time: "8:50 – 9:10 am", speaker: "Dr. Harish Badami", title: "Transitioning from Open to MICS to Robotics", kind: "talk" },
    { n: 3, time: "9:10 – 9:30 am", speaker: "Dr. Nitin Kumar Rajput", title: "How to Avoid Injuries to IMA in Robotics and MICS", kind: "talk" },
    { n: 4, time: "9:30 – 9:50 am", speaker: "Dr. Nitin Kumar Rajput", title: "How to Select Targets for CABG in MICS", kind: "talk" },
    S("Session 7", ["Dr. Amarendra Singh", "Dr. Vedanth", "Dr. Rhazane Nalluri", "Dr. Chandana N C"]),
    { n: 5, time: "9:50 – 10:10 am", speaker: "Dr. Nagesh Ayalasomayajula", title: "Robotic BIMA and Multivessel Grafting — The Controversies and the Answers", kind: "talk" },
    { n: 6, time: "10:10 – 10:30 am", speaker: "Dr. Alla Gopala Krishna Gokhale", title: "Selecting Instrumentation for MICS and Robotics", kind: "talk" },
    { time: "10:30 – 10:40 am", title: "Tea Break", kind: "break" },
    { n: 7, time: "10:40 – 11:00 am", speaker: "Dr. John Murala", title: "Man & Machine — The Next Industrial Revolution in Cardiac Surgery", kind: "talk" },
    { n: 8, time: "11:00 – 11:20 am", speaker: "Dr. Sudhir Srivastava", title: "Analysis of the First 195 Multi-Speciality Telesurgery Cases: How Technology will Democratize Access", kind: "talk" },
    S("Session 8", ["Dr. Usha Rani", "Dr. Venkat Reddy K", "Dr. Gopi Nallaiyan", "Dr. Narmada"]),
    { n: 9, time: "11:20 – 11:40 am", speaker: "Dr. Jacob Jamesraj", title: "Anastomotic Disasters: Recognition and Management", kind: "talk" },
    { n: 10, time: "11:40 am – 12:00 pm", speaker: "Dr. Sanjay Theodore", title: "Graft Flow Measurement & Transit-Time Flow Measurement (TTFM)", kind: "talk" },
    { n: 11, time: "12:00 – 12:10 pm", speaker: "Dr. Archana Pathy", title: "Enhanced Recovery After Surgery", kind: "talk" },
    { n: 12, time: "12:10 – 12:30 pm", speaker: "Dr. Smriti Ranjan Mohanty", title: "Closed Technique is the Way Forward in Arterial Switch Operation", kind: "talk" },
    {
      n: 13,
      time: "12:30 – 1:00 pm",
      title: "Panel Discussion — Pediatric Cardiac Program and the Pediatric Surgeon: The Art, Science & Economics",
      kind: "panel",
      moderator: "Dr. Debasis Das",
      panelists: ["Dr. Smriti Ranjan Mohanty", "Dr. Ganapathy Subramaniam", "Dr. Sunil Kumar Swain", "Dr. Sandeep Khanzode", "Dr. P. Rajashekar"],
    },
    { time: "1:00 – 1:45 pm", title: "Lunch", kind: "break" },
    S("Session 9", ["Dr. Satya Bhaskar Raju", "Dr. Avinash Dal", "Dr. Madasu Sudhakar Rao", "Dr. Siddarth Sathia", "Dr. Kalluri Sriram"]),
    { n: 14, time: "1:45 – 2:05 pm", speaker: "Dr. Ramprassath", title: "No Robo? — Start an Endoscopic Cardiac Surgery", kind: "talk" },
    { n: 15, time: "2:05 – 2:25 pm", speaker: "Dr. Paneer Selvam Krishnamoorthy", title: "Complex Mitral Valve Repairs", kind: "talk" },
    { n: 16, time: "2:25 – 2:45 pm", speaker: "Dr. Balasubramoniam K R", title: "Thoracic Surgery as a Great Career Choice", kind: "talk" },
    { n: 17, time: "2:45 – 3:05 pm", speaker: "Dr. Manjunath Bale", title: "How to Start Robotic Thoracic Surgery Programme", kind: "talk" },
    { n: 18, time: "3:05 – 3:25 pm", speaker: "Dr. Aravind Mutharevula", title: "Building the Future Surgeon: Robotics, Reconstruction, and Beyond", kind: "talk" },
    { time: "3:25 – 3:40 pm", title: "High Tea Break", kind: "break" },
    {
      n: 19,
      time: "3:40 – 4:10 pm",
      title: "Panel Discussion — Robotic Cardiac Surgery: Future Gold Standard or Mere Hype?",
      kind: "panel",
      moderator: "Dr. Vishal Khante",
      panelists: ["Dr. Alla Gopala Krishna Gokhale", "Dr. P N Rao", "Dr. Nitin Kumar Rajput", "Dr. Nagesh Ayalasomayajula"],
    },
    { n: 20, time: "4:10 – 4:30 pm", speaker: "Dr. Randolph Wong", title: "The Commando Procedure — Video Presentation", kind: "talk" },
    { n: 21, time: "4:30 – 4:50 pm", speaker: "TSMC", title: "Medical Ethics / Good Clinical Practice / Lab Practice / Legal Issues", kind: "special" },
    { time: "4:50 – 5:00 pm", title: "Valedictory", kind: "ceremony" },
  ],
};

export const scheduleDays: readonly ScheduleDay[] = [day1, day2];
