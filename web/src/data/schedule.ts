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
 *    Dopade → Dhopade, Rajashekar → Rajashekhar, Kutti → Kutty, and the missing
 *    space in "Dr.Vitaly").
 *  - One supplied time ran backwards ("3.30 - 3.15pm", High Tea on day two) and
 *    clashed with the panel that followed. Corrected on the committee's
 *    instruction, 30 September 2026: High Tea is 3:30 – 3:45 pm and everything
 *    after it moves 30 minutes later, so day two now closes at 5:10 pm.
 *  - "Dr. Balasubramanyam" and "Dr. Balasubramoniam K R" are one person; the
 *    faculty-list spelling is used for both talks, on the same instruction.
 */

export type ScheduleKind = "talk" | "panel" | "break" | "ceremony" | "special";

export interface ScheduleItem {
  /** The committee's own running number, where the sheet gives one. */
  n?: number;
  time?: string;
  title: string;
  speaker?: string;
  track?: string;
  kind: ScheduleKind;
  chairpersons?: readonly string[];
}

export interface ScheduleDay {
  id: string;
  label: string;
  date: string;
  venue: string;
  items: readonly ScheduleItem[];
}

export const scheduleStatus =
  "Tentative schedule — sessions, speakers and timings may change.";

/** 23 October, NIMS. Two halls run in parallel. */
export const workshopHalls = [
  {
    hall: "Hall A",
    items: [
      { title: "Applied Anatomy of Heart", speaker: "Dr. Anil Tendolkar" },
      { title: "Coronary Anastomosis" },
      { title: "Valve Replacement" },
      { title: "Proximal Coronary Anastomosis Contest" },
    ],
  },
  {
    hall: "Hall B",
    items: [
      { title: "Sizing and Planning for FET — Aortic Aneurysm and Dissection" },
      { title: "Deployment of FET" },
      { title: "MICS CABG Planning & Demo Workshop Simulator" },
      { title: "Endoscopic Saphenous Vein and Radial Artery Harvest Simulation" },
    ],
  },
] as const;

/**
 * Breakthrough Sessions. They sit on 24 October, not on the workshop day, and
 * run alongside the main scientific programme rather than after it — moved and
 * labelled on the committee's instruction, 2 October 2026.
 */
export const breakthroughNote = "Runs in parallel with the main scientific programme.";
export const breakthroughDayId = "day-1";

export const breakthroughTopics = [
  "Young Surgeon's Forum",
  "Women in Cardiothoracic Surgery",
  "Session on Endoscopic Saphenous Vein and Radial Artery Harvest",
  "ECMO, Cell Saver",
  "CentriMag, LVAD",
] as const;

const day1: ScheduleDay = {
  id: "day-1",
  label: "Day 1",
  date: "24 October 2026",
  venue: "Dr. MCR HRD Institute Auditorium",
  items: [
    { n: 1, time: "8:30 – 8:50 am", track: "Aortic", speaker: "Dr. Praveen Varma", title: "Aortic Root Anatomy for the Modern Times", kind: "talk" },
    { n: 2, time: "8:50 – 9:10 am", track: "Aortic", speaker: "Dr. Vikram Reddy", title: "A Beginner's Guide to an Aortic Surgery Programme", kind: "talk" },
    { n: 3, time: "9:10 – 9:30 am", track: "Aortic", speaker: "Dr. Mohammed Idhrees", title: "Newer Hardware — Simplifying Complex Aortic Surgeries", kind: "talk" },
    { n: 4, time: "9:30 – 10:00 am", track: "Aortic", speaker: "Dr. Vitaly A Sorokin", title: "To Be Confirmed", kind: "talk" },
    { n: 5, time: "10:00 – 10:20 am", track: "Aortic", speaker: "Dr. Devagourou Velayoudam", title: "The Narrow Aortic Root", kind: "talk" },
    { n: 6, time: "10:20 – 10:40 am", track: "Aortic", speaker: "Dr. Gopichand Mannam", title: "The Frozen Elephant Trunk", kind: "talk" },
    { n: 7, time: "10:40 – 11:00 am", track: "Aortic", speaker: "Dr. Tushar Dhopade", title: "Surgeon Driven Structural Heart Programme", kind: "talk" },
    { n: 8, time: "11:00 – 11:20 am", track: "Aortic", speaker: "Dr. Lokeshwar Rao Sajja", title: "Predict Trial — India's Own Trial Comparing Grafting Strategies", kind: "talk" },
    { title: "Inauguration", kind: "ceremony" },
    { n: 9, time: "11:20 am – 12:20 pm", speaker: "Dr. Chirag Doshi", title: "Key Note Address: Strategic Roadmap For Young Cardiac Surgeons", kind: "special" },
    { n: 10, time: "12:20 – 12:40 pm", speaker: "Dr. Satyajit Bose", title: "Valve Sparing Aortic Root Replacement (VSARR)", kind: "talk" },
    { n: 11, time: "12:40 – 1:00 pm", speaker: "Dr. Niranjan Hiremath", title: "Hybrid Arch Procedures", kind: "talk" },
    { time: "1:00 – 1:45 pm", title: "Lunch", kind: "break" },
    { n: 12, time: "1:45 – 2:05 pm", track: "Transplant", speaker: "Dr. Manoj Durairaj", title: "Beginner's Guide to Starting a Thoracic Organ Transplant", kind: "talk" },
    { n: 13, time: "2:05 – 2:25 pm", track: "Transplant", speaker: "Dr. Sandeep Attawar", title: "Mechanical Circulatory Support & Thoracic Transplant: Where do Young Surgeons fit in?", kind: "talk" },
    { n: 14, time: "2:25 – 2:45 pm", track: "Congenital", speaker: "Dr. Maruti Haranal", title: "Complex Redo's and The Changing Face of Pediatric Cardiac Surgery", kind: "talk" },
    { n: 15, time: "2:45 – 3:05 pm", track: "Congenital", speaker: "Dr. P. Rajashekhar", title: "Pediatric Aortic and Mitral Valve Repairs", kind: "talk" },
    { n: 16, time: "3:05 – 3:25 pm", track: "Transplant", speaker: "Dr. Alla Gopala Krishna Gokhale", title: "Heart Transplant in Borderline Recipients", kind: "talk" },
    { n: 17, time: "3:25 – 3:45 pm", track: "Transplant", speaker: "Dr. Dhaval Naik", title: "Starting an LVAD Program", kind: "talk" },
    { time: "3:45 – 4:00 pm", title: "High Tea Break", kind: "break" },
    { n: 18, time: "4:00 – 4:20 pm", speaker: "Dr. Balasubramoniam K R", title: "Workflow of Lung Transplant", kind: "talk" },
    { n: 19, time: "4:20 – 4:40 pm", speaker: "Dr. C S Hiremath", title: "Evolution of Homograft Valve Bank in India", kind: "talk" },
    { n: 20, time: "4:40 – 5:00 pm", speaker: "Dr. Bijoy Kutty", title: "Subject To Confirmation", kind: "talk" },
    { n: 21, time: "5:00 – 5:20 pm", speaker: "International Zoom Meeting", title: "Subject To Confirmation", kind: "talk" },
    { n: 22, time: "5:20 – 5:35 pm", speaker: "Dr. Prashanth Vaidyanath", title: "Transcatheter Structural Heart Interventions", kind: "talk" },
    { time: "5:35 – 5:50 pm", title: "The Active Role of the Endo-Cardiovascular Surgeon in the Heart Team", kind: "talk" },
    {
      time: "5:50 – 6:30 pm",
      title: "Panel Discussion — Legal Issues in a Cardiac Surgeon Driven Structural Heart Program",
      kind: "panel",
      chairpersons: ["Dr. Prashanth Vaidyanath", "Dr. Shailesh Jain", "Dr. Tushar Dhopade", "Dr. Varun"],
    },
    { time: "6:30 pm", title: "Quiz", kind: "special" },
    { n: 23, speaker: "Dr. Vinitha Nair", title: "Quiz Master", kind: "special" },
    { time: "7:30 – 10:30 pm", title: "Gala Dinner", kind: "break" },
  ],
};

const day2: ScheduleDay = {
  id: "day-2",
  label: "Day 2",
  date: "25 October 2026",
  venue: "Dr. MCR HRD Institute Auditorium",
  items: [
    { n: 24, time: "8:30 – 8:50 am", track: "MICS", speaker: "Dr. Sai Kiran", title: "Beginner's Guide to Start MICS Valvular Heart Surgery", kind: "talk" },
    { n: 25, time: "8:50 – 9:10 am", track: "MICS", speaker: "Dr. Harish Badami", title: "Transitioning from Open to MICS to Robotics", kind: "talk" },
    { n: 26, time: "9:10 – 9:30 am", track: "MICS", speaker: "Dr. Nitin Kumar Rajput", title: "How to Avoid Injuries to IMA in Robotic and MICS", kind: "talk" },
    { n: 27, time: "9:30 – 9:50 am", track: "MICS", speaker: "Dr. Ritwick Raj Bhuyan", title: "How to Select Targets for CABG in MICS", kind: "talk" },
    { n: 28, time: "9:50 – 10:10 am", track: "MICS", speaker: "Dr. Nagesh Ayalasomayajula", title: "Robotic BIMA and Multivessel Grafting — The Controversies and the Answers", kind: "talk" },
    { n: 29, time: "10:10 – 10:30 am", track: "MICS", speaker: "Dr. Alla Gopala Krishna Gokhale", title: "Selecting Instrumentation for MICS and Robotics", kind: "talk" },
    { time: "10:30 – 10:40 am", title: "Tea Break", kind: "break" },
    { n: 30, time: "10:40 – 11:00 am", speaker: "Dr. M. M. Yousuf", title: "Yet To Be Confirmed", kind: "talk" },
    { n: 31, time: "11:00 – 11:20 am", track: "Off Beat", speaker: "Dr. Sudhir Srivastava", title: "Zoom Meeting", kind: "talk" },
    { n: 32, time: "11:20 – 11:40 am", speaker: "Dr. Jacob Jamesraj", title: "Anastomotic Disasters: Recognition and Management", kind: "talk" },
    { n: 33, time: "11:40 am – 12:00 pm", speaker: "Dr. Sanjay Theodore", title: "Yet To Be Confirmed", kind: "talk" },
    { n: 34, time: "12:00 – 12:10 pm", speaker: "Dr. Archana", title: "Enhanced Recovery After Surgery", kind: "talk" },
    { n: 35, time: "12:10 – 12:30 pm", track: "Congenital", speaker: "Dr. Smriti Ranjan Mohanty", title: "Closed Technique is the Way Forward in Arterial Switch Operation", kind: "talk" },
    {
      n: 36,
      time: "12:30 – 1:00 pm",
      track: "Congenital",
      speaker: "Dr. Debasis Das",
      title: "Panel Discussion — Pediatric Cardiac Program and the Pediatric Surgeon: The Art, Science & Economics",
      kind: "panel",
      chairpersons: ["Dr. Smriti Ranjan Mohanty", "Dr. P. Rajashekhar", "Dr. Sandeep Khanzode", "Dr. Ganapathy Subramaniam"],
    },
    { time: "1:00 – 1:45 pm", title: "Lunch", kind: "break" },
    { n: 37, time: "1:45 – 2:00 pm", track: "Thoracic", speaker: "Dr. Paneer Selvam Krishnamoorthy", title: "Complex Mitral Valve Repairs", kind: "talk" },
    { n: 38, time: "2:00 – 2:30 pm", track: "Thoracic", speaker: "Dr. Balasubramoniam K R", title: "Thoracic Surgery as a Great Career Choice", kind: "talk" },
    { n: 39, time: "2:30 – 2:50 pm", track: "Thoracic", speaker: "Dr. Ramprassath", title: "No Robo? — Start an Endoscopic Cardiac Surgery", kind: "talk" },
    { n: 40, time: "2:50 – 3:10 pm", track: "Thoracic", speaker: "Dr. Manjunath Bale", title: "How to Start Robotic Thoracic Surgery Programme", kind: "talk" },
    { n: 41, time: "3:10 – 3:30 pm", track: "Thoracic", speaker: "Dr. Aravind Mutharevula", title: "Building the Future Surgeon: Robotics, Reconstruction, and Beyond", kind: "talk" },
    { time: "3:30 – 3:45 pm", title: "High Tea Break", kind: "break" },
    {
      n: 42,
      time: "3:45 – 4:25 pm",
      speaker: "Dr. Vishal Khante",
      title: "Panel Discussion — Robotic Cardiac Surgery: Future Gold Standard or Mere Hype?",
      kind: "panel",
      chairpersons: ["Dr. Alla Gopala Krishna Gokhale", "Dr. Nitin Kumar Rajput", "Dr. Nagesh Ayalasomayajula", "Dr. Ritwick Raj Bhuyan"],
    },
    { n: 43, time: "4:25 – 4:45 pm", speaker: "Dr. Randolph Wong", title: "The Commando Procedure — Video Presentation", kind: "talk" },
    { time: "4:45 – 4:55 pm", speaker: "TSMC", title: "Medical Ethics / Good Clinical Practice / Lab Practice / Legal Issues", kind: "special" },
    { time: "4:55 – 5:10 pm", title: "Valedictory", kind: "ceremony" },
  ],
};

export const scheduleDays: readonly ScheduleDay[] = [day1, day2];
