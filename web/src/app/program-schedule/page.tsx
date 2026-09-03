"use client"

import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Navigation } from "../../components/Navigation"
import { conferenceConfig } from "../../config/conference.config"
import { Input } from "../../components/ui/input"
import { Button } from "../../components/ui/button"
import {
  Calendar, Clock, MapPin, Search, Radio, Bell, Download, ArrowRight,
  Activity, Presentation, MessageSquare, FileText, Award, Wrench, Coffee, X,
} from "lucide-react"
import { toast } from "sonner"

// ── Types ────────────────────────────────────────────────────────────────
type SType = 'live' | 'session' | 'panel' | 'paper' | 'keynote' | 'workshop' | 'social'
interface SubItem { time?: string; topic: string; faculty?: string }
interface Sess {
  time: string
  end: string
  hall: 'A' | 'B' | ''   // '' = plenary / both halls
  title: string
  type: SType
  faculty?: string       // single-session faculty (live surgery, oration, single talk)
  chairs?: string        // chairpersons / moderators
  items?: SubItem[]      // detailed breakdown, each with its own faculty
}
interface Day { id: string; date: string; label: string; theme: string; sessions: Sess[] }

// ── Program (source: TASCON 2026 brochure) ───────────────────────────────
const PROGRAM: Day[] = [
  {
    "id": "day1",
    "date": "2026-07-18",
    "label": "Day 1 · 18 July",
    "theme": "Knee & Sports Med · Wrist, Elbow · Papers",
    "sessions": [
      {
        "time": "08:00",
        "end": "08:30",
        "hall": "A",
        "title": "Knee Arthroscopy — Let's Get the Basics Right",
        "type": "session",
        "chairs": "Chairpersons: Raja Ramesh · Kirthi Chandra",
        "items": [
          {
            "topic": "Scope, Camera, Action — Basics of Arthroscopy Systems",
            "faculty": "Mithin Aachi",
            "time": "08:00"
          },
          {
            "topic": "Sterilisation & Disinfection of Instruments — What does the evidence say?",
            "faculty": "B. Sai Phani Chandra",
            "time": "08:08"
          },
          {
            "topic": "Knee Arthroscopic Portals: Small Holes, Big Consequences",
            "faculty": "Siva Kumar Kotra",
            "time": "08:15"
          }
        ]
      },
      {
        "time": "08:30",
        "end": "09:00",
        "hall": "A",
        "title": "Live Surgery 1 · ACLR with T-Button",
        "type": "live",
        "faculty": "Arvind Prasad Gupta"
      },
      {
        "time": "09:00",
        "end": "11:00",
        "hall": "A",
        "title": "ACL Session",
        "type": "session",
        "chairs": "Chairpersons: Alwal Reddy J · Y Thimma Reddy",
        "items": [
          {
            "topic": "The Art and Science of Graft Preparation",
            "faculty": "Srinivas Thati",
            "time": "09:00"
          },
          {
            "topic": "Autografts for ACL: Re-Live of Peroneal Tendon Harvest",
            "faculty": "Jagan Mohan Reddy V",
            "time": "09:08"
          },
          {
            "topic": "The Superficial Quadriceps Tendon: An Emerging Graft Choice for Ligament Reconstruction",
            "faculty": "Sardar Jaideep Singh",
            "time": "09:15"
          },
          {
            "topic": "Graft Choice in Challenging Situations — Choosing the Right Graft in 2026",
            "faculty": "Ravi Teja Rudraraju",
            "time": "09:24"
          },
          {
            "topic": "Graft Augmentations — Biologic and Synthetic",
            "faculty": "V V Rajasekhar",
            "time": "09:32"
          },
          {
            "topic": "My Experience with Synthetic Ligament Reconstruction",
            "faculty": "Vikram Mhaskar",
            "time": "09:39"
          },
          {
            "topic": "Femoral Tunnel in ACLR: Evidence, Pearls, and Avoiding Errors",
            "faculty": "K. Satish Kumar",
            "time": "09:51"
          },
          {
            "topic": "Concepts of ACLR in Female Athletes",
            "faculty": "Krishna Subramaniyam",
            "time": "09:59"
          },
          {
            "topic": "Additional Procedures to ACLR — Routine, Selective, or Unnecessary?",
            "faculty": "P. S Jaya Prasad",
            "time": "10:07"
          },
          {
            "topic": "When ACL Reconstruction Fails: A Practical Workflow for Revision Surgery",
            "faculty": "Arun Reddy Mallu",
            "time": "10:15"
          },
          {
            "topic": "Intraoperative Complications During ACLR — How to Avoid / Bailout?",
            "faculty": "Sachin Tapasvi",
            "time": "10:23"
          }
        ]
      },
      {
        "time": "09:00",
        "end": "10:30",
        "hall": "B",
        "title": "Free Papers",
        "type": "session",
        "chairs": "Chairpersons: Lalith Mohan · Praveen Mereddy",
        "items": [
          {
            "topic": "Post-Graduate Papers"
          },
          {
            "topic": "Junior Consultant Papers"
          },
          {
            "topic": "Consultant Papers"
          }
        ]
      },
      {
        "time": "10:30",
        "end": "10:50",
        "hall": "A",
        "title": "Panel Discussion: Challenging Situations in ACL Reconstruction",
        "type": "panel",
        "faculty": "Sachin Tapasvi",
        "chairs": "Panel: P. S Jaya Prasad, Preshith Gaddam, J. Uday Bhaskar, Ravi Teja Rudraraju, Kirthi Chandra"
      },
      {
        "time": "10:30",
        "end": "12:30",
        "hall": "B",
        "title": "Orthobiologics & Cartilage Session",
        "type": "session",
        "chairs": "Chairpersons: Srikanth J · VKV Prasad",
        "items": [
          {
            "topic": "Quality Control and Reporting Guidelines of Orthobiologics",
            "faculty": "Madhan Jeyaraman",
            "time": "10:30"
          },
          {
            "topic": "Exosomes: An Evolving Orthobiologic for Regenerative Medicine",
            "faculty": "Ashim Gupta",
            "time": "10:40"
          },
          {
            "topic": "Clinical and Therapeutic Grade of BMAC and SVF Injections in MSK Disorders",
            "faculty": "Sathish Muthu",
            "time": "10:50"
          },
          {
            "topic": "Allogenic Mesenchymal Stem Cell Therapy in Osteoarthritic Knee",
            "faculty": "Karun Jain",
            "time": "11:00"
          },
          {
            "topic": "Allogenic Stem Cells in Inflammatory arthritis of knee",
            "faculty": "Krishna Subramaniyam",
            "time": "11:10"
          },
          {
            "topic": "Role of Orthobiologics in Delayed and Non-Union of Fractures",
            "faculty": "Bishnu Prasad Patro",
            "time": "11:20"
          },
          {
            "topic": "Legal Aspects of Orthobiologics",
            "faculty": "Madhan Jeyaraman",
            "time": "11:30"
          },
          {
            "topic": "Orthobiologics-Augmented Rotator Cuff Repair",
            "faculty": "Karun Jain",
            "time": "11:40"
          },
          {
            "topic": "Biological Cartilage Restoration with Chondrofiller",
            "faculty": "Sujitkumar Vakati R",
            "time": "11:50"
          },
          {
            "topic": "Managing Osteochondral Lesion of Talus — What Works in Real Practice",
            "faculty": "Mithin Aachi",
            "time": "12:00"
          }
        ]
      },
      {
        "time": "10:50",
        "end": "11:20",
        "hall": "A",
        "title": "Live Surgery 2 · ACL with QuadPro + Meniscus",
        "type": "live",
        "faculty": "Nikhil S. Likhate"
      },
      {
        "time": "11:20",
        "end": "12:30",
        "hall": "A",
        "title": "Save the Meniscus: From Principles to Precision Repair",
        "type": "session",
        "chairs": "Chairpersons: G Ramesh · Bangari Swamy",
        "items": [
          {
            "topic": "Anatomy and Biomechanics of Meniscus — Why Should We Save Every Meniscal Tear?",
            "faculty": "Sujitkumar Vakati R",
            "time": "11:20"
          },
          {
            "topic": "All-Inside Meniscal Repair: The Contemporary Workhorse — Re-Live",
            "faculty": "V.S. Abhilash Kumar Sunkesula",
            "time": "11:28"
          },
          {
            "topic": "The Timeless Techniques: Inside-Out and Outside-In Repairs Revisited — Re-Live",
            "faculty": "Veerendra Mudnoor",
            "time": "11:36"
          },
          {
            "topic": "The Hidden Meniscus: Root Tears and Ramp Lesions — Re-Live Root Tear Repair",
            "faculty": "K.N. Subramanian",
            "time": "11:44"
          },
          {
            "topic": "Beyond Simple Tears: My Algorithm for Complex Meniscal Tears",
            "faculty": "Sai Thirumal Rao Veerla",
            "time": "11:52"
          },
          {
            "topic": "Radial Tear Repair — Re-Live",
            "faculty": "Miten Sheth",
            "time": "12:00"
          }
        ]
      },
      {
        "time": "12:08",
        "end": "12:25",
        "hall": "A",
        "title": "Panel Discussion: Meniscus Crossfire — Interactive Panel on Difficult Cases & Controversies",
        "type": "panel",
        "faculty": "Sukesh Rao Sankineani",
        "chairs": "Panel: Venu Madhav B, B. Sai Phani Chandra, Veerendra Mudnoor, Sai Thirumal Rao Veerla, V.S. Abhilash Kumar Sunkesula"
      },
      {
        "time": "12:10",
        "end": "12:30",
        "hall": "B",
        "title": "Panel Discussion",
        "type": "panel"
      },
      {
        "time": "12:30",
        "end": "13:00",
        "hall": "A",
        "title": "Inauguration",
        "type": "social"
      },
      {
        "time": "12:30",
        "end": "13:00",
        "hall": "B",
        "title": "Inauguration",
        "type": "social"
      },
      {
        "time": "13:00",
        "end": "13:30",
        "hall": "A",
        "title": "TAS Presidential Oration — PCL and PLC Reconstruction: Lessons from Anatomy, Biomechanics and Clinical Outcomes",
        "type": "keynote",
        "faculty": "Sunil Apsingi"
      },
      {
        "time": "13:00",
        "end": "13:30",
        "hall": "B",
        "title": "TAS Oration",
        "type": "keynote"
      },
      {
        "time": "13:30",
        "end": "14:00",
        "hall": "A",
        "title": "Lunch",
        "type": "social"
      },
      {
        "time": "13:30",
        "end": "14:00",
        "hall": "B",
        "title": "Lunch",
        "type": "social"
      },
      {
        "time": "14:00",
        "end": "14:30",
        "hall": "A",
        "title": "Live Surgery 3 · HTO + DFO",
        "type": "live",
        "faculty": "Sachin Tapasvi"
      },
      {
        "time": "14:00",
        "end": "17:00",
        "hall": "B",
        "title": "Session I · Wrist",
        "type": "session",
        "items": [
          {
            "topic": "Clinical Examination of the Wrist — What Every Surgeon Should Know",
            "faculty": "Manish Kumar Jain",
            "time": "14:00"
          },
          {
            "topic": "Wrist Arthroscopy — Portal Placement and Safety Pearls",
            "faculty": "Gopinath Bandari",
            "time": "14:10"
          },
          {
            "topic": "TFCC Injury — Anatomy, Arthroscopic Classification and Treatment Algorithm",
            "faculty": "Avinash Rao G",
            "time": "14:20"
          },
          {
            "topic": "Arthroscopic TFCC Repair — Various Techniques and Re-Live Video",
            "faculty": "Anup Bansode",
            "time": "14:30"
          },
          {
            "topic": "Open TFCC Repair and Reconstruction — Re-Live Video",
            "faculty": "Abhijeet Wahegaonkar",
            "time": "14:40"
          },
          {
            "topic": "Distal Radius Fractures — Role of Arthroscopy",
            "faculty": "Sujitkumar Vakati R",
            "time": "14:50"
          },
          {
            "topic": "Scapholunate Ligament Injury — Anatomy and Treatment Algorithm",
            "faculty": "Sandeep Sriram",
            "time": "15:00"
          },
          {
            "topic": "Arthroscopic Scapholunate Ligament Repair — Re-Live Video",
            "faculty": "Abhijeet Wahegaonkar",
            "time": "15:10"
          },
          {
            "topic": "Scaphoid Non-Union — Role of Arthroscopy",
            "faculty": "R. Suneel",
            "time": "15:20"
          }
        ]
      },
      {
        "time": "14:30",
        "end": "14:45",
        "hall": "A",
        "title": "15° Flexion — The Most Significant Critical Angle to Evaluate Patella Instability",
        "type": "session",
        "faculty": "Deepak Goyal"
      },
      {
        "time": "14:45",
        "end": "15:20",
        "hall": "A",
        "title": "Osteotomies",
        "type": "session",
        "chairs": "Chairpersons: P.L. Srinivas · TDR Reddy",
        "items": [
          {
            "topic": "The Science of Realignment: Principles and Types of Osteotomies Around the Knee",
            "faculty": "G K Sudhakar Reddy",
            "time": "14:45"
          },
          {
            "topic": "High Tibial Osteotomy: Indications, Planning, and Execution",
            "faculty": "G P R K Rohit",
            "time": "14:53"
          },
          {
            "topic": "Osteotomy in ACL & PCL Deficient Knees",
            "faculty": "K. Raghuveer Reddy",
            "time": "15:01"
          },
          {
            "topic": "Double Level Osteotomy — When and How?",
            "faculty": "Aditya Kapoor",
            "time": "15:09"
          }
        ]
      },
      {
        "time": "15:20",
        "end": "16:20",
        "hall": "A",
        "title": "Multiligament Injuries of the Knee",
        "type": "session",
        "chairs": "Chairpersons: Valya B · Gvs Murthy",
        "items": [
          {
            "topic": "Reading the Injured Knee: Clinical Assessment of Multiligament Injuries",
            "faculty": "Siddhartha Maredupaka",
            "time": "15:20"
          },
          {
            "topic": "The Medial Side Dilemma: MCL — Conserve, Repair, or Reconstruct?",
            "faculty": "Chirag Thonse",
            "time": "15:28"
          },
          {
            "topic": "The Forgotten Corner: PLC Surgical Anatomy for the Arthroscopy Surgeon",
            "faculty": "Shashi Kanth G",
            "time": "15:36"
          },
          {
            "topic": "Mastering the PCL: Arthroscopic Pearls and Pitfalls in Reconstruction",
            "faculty": "Ranajit Panigrahi",
            "time": "15:44"
          }
        ]
      },
      {
        "time": "15:30",
        "end": "16:00",
        "hall": "B",
        "title": "Wrist Panel Discussion",
        "type": "panel",
        "chairs": "Moderators: R. Suneel · Gopinath Bandari"
      },
      {
        "time": "15:55",
        "end": "16:15",
        "hall": "A",
        "title": "Panel Discussion — Putting It All Together: An Algorithmic Approach to the Multiligament-Injured Knee",
        "type": "panel",
        "faculty": "Nithin Kumar Bejjanki",
        "chairs": "Panel: Divya Bandari, Siddhartha Maredupaka, G P R K Rohit, Ranajit Panigrahi, Vamsi Kiran Badam"
      },
      {
        "time": "16:00",
        "end": "17:00",
        "hall": "B",
        "title": "Session II · Elbow",
        "type": "session",
        "items": [
          {
            "topic": "Elbow Arthroscopy — Portal Placement, Safety Pearls and Indications",
            "faculty": "Deepthi Nandan Reddy",
            "time": "16:00"
          },
          {
            "topic": "Stiff Elbow — Arthroscopic Management (Re-Live Video)",
            "faculty": "Deepthi Nandan Reddy",
            "time": "16:10"
          },
          {
            "topic": "Tennis Elbow Release — Re-Live Video",
            "faculty": "Abhijeet Wahegaonkar",
            "time": "16:20"
          }
        ]
      },
      {
        "time": "16:15",
        "end": "17:00",
        "hall": "A",
        "title": "Live Surgery 4 · PCL / Multiligament",
        "type": "live",
        "faculty": "Chirag Thonse"
      },
      {
        "time": "16:30",
        "end": "17:00",
        "hall": "B",
        "title": "Elbow Panel Discussion",
        "type": "panel",
        "chairs": "Moderators: Sandeep Sriram · Avinash Rao G Panel: Abhijeet Wahegaonkar, Deepthi Nandan Reddy, Anup Bansode"
      },
      {
        "time": "17:00",
        "end": "17:30",
        "hall": "A",
        "title": "Mastering Patellar Instability: Evaluate • Align • Stabilise",
        "type": "session",
        "items": [
          {
            "topic": "Decoding Patellar Instability: Clinical and Radiological Assessment",
            "faculty": "Vamsi Kiran Badam",
            "time": "17:00"
          },
          {
            "topic": "Soft Tissue Procedures for Patellar Instability — Re-Live of MPFL Reconstruction",
            "faculty": "Ajay Kumar Paruchuri",
            "time": "17:08"
          },
          {
            "topic": "Beyond the MPFL: TTO and Trochleoplasty — Who Needs What?",
            "faculty": "Hari Krishna Yadoji",
            "time": "17:16"
          }
        ]
      },
      {
        "time": "17:25",
        "end": "18:15",
        "hall": "A",
        "title": "Quiz",
        "type": "session",
        "faculty": "Siva Kumar Kotra / Jagan Velpula"
      },
      {
        "time": "18:15",
        "end": "18:45",
        "hall": "A",
        "title": "General Body Meeting",
        "type": "social"
      },
      {
        "time": "18:45",
        "end": "19:30",
        "hall": "A",
        "title": "Workshops",
        "type": "workshop"
      },
      {
        "time": "19:30",
        "end": "23:00",
        "hall": "A",
        "title": "Gala Dinner",
        "type": "social"
      }
    ]
  },
  {
    "id": "day2",
    "date": "2026-07-19",
    "label": "Day 2 · 19 July",
    "theme": "Shoulder & Sports Med · Hip & Ankle",
    "sessions": [
      {
        "time": "08:00",
        "end": "08:30",
        "hall": "A",
        "title": "Shoulder Basics",
        "type": "session",
        "chairs": "Chairpersons: Sandeep Kund Reddy · Venkata Ramana",
        "items": [
          {
            "topic": "Shoulder Examination: Pearls and Pitfalls for Arthroscopy Surgeons",
            "faculty": "Vamshi Krishna Terala",
            "time": "08:00"
          },
          {
            "topic": "Positioning and Portals for Shoulder Arthroscopy",
            "faculty": "Harshad Jawalkar",
            "time": "08:08"
          },
          {
            "topic": "15-Point Diagnostic Arthroscopy",
            "faculty": "Lalith Mohan",
            "time": "08:15"
          }
        ]
      },
      {
        "time": "08:30",
        "end": "09:00",
        "hall": "A",
        "title": "Live Surgery 5 · Arthroscopic Bankart's Repair + Remplissage",
        "type": "live",
        "faculty": "P. C. Jagadeesh"
      },
      {
        "time": "09:00",
        "end": "10:30",
        "hall": "A",
        "title": "Instability / Labrum Session",
        "type": "session",
        "chairs": "Chairpersons: Chintapeta Ravi · Naresh P. Hanagodu",
        "items": [
          {
            "topic": "Decision Making in the Management of Recurrent Dislocation",
            "faculty": "Ramana Murthy T",
            "time": "09:00"
          },
          {
            "topic": "The Perfect Bankart: Getting Labral Repair Right",
            "faculty": "Naren Subramani",
            "time": "09:08"
          },
          {
            "topic": "The Off-Track Shoulder: Bone Loss, Hill-Sachs and the Role of Remplissage",
            "faculty": "Diddi Hari Prakash",
            "time": "09:16"
          },
          {
            "topic": "The Hidden Lesions: SLAP, Paralabral Cysts and HAGL — Re-Live of Paralabral Cyst",
            "faculty": "Sunil Dachepalli",
            "time": "09:24"
          },
          {
            "topic": "Glenoid Reconstruction with Bone Grafts: Current Concepts",
            "faculty": "Sukesh Rao Sankineani",
            "time": "09:32"
          },
          {
            "topic": "Instability Beyond Bankart: Multidirectional Instability",
            "faculty": "Harshad Jawalkar",
            "time": "09:40"
          }
        ]
      },
      {
        "time": "09:48",
        "end": "10:20",
        "hall": "A",
        "title": "Panel Discussion: Instability and Labral Pathologies",
        "type": "panel",
        "faculty": "Chandra Shekar B",
        "chairs": "Panel: V V Rajasekhar, A Venkat Reddy, Natesh Kolusu, Harshad Jawalkar, Naren Subramani"
      },
      {
        "time": "10:20",
        "end": "10:50",
        "hall": "A",
        "title": "Live Surgery 6 · Reverse Shoulder Arthroplasty",
        "type": "live",
        "faculty": "Shirish Pathak"
      },
      {
        "time": "10:30",
        "end": "12:30",
        "hall": "B",
        "title": "Hip Arthroscopy",
        "type": "session",
        "chairs": "Moderators: P. S Jaya Prasad · Valya B · Jagan Mohan Reddy V",
        "items": [
          {
            "topic": "Patient Selection and Clinical Examination of Hip Arthroscopy",
            "faculty": "Lalith Mohan",
            "time": "10:30"
          },
          {
            "topic": "Radiology Made Easy for Hip Arthroscopy",
            "faculty": "Srinadh Boppana",
            "time": "10:40"
          },
          {
            "topic": "Hip Arthroscopy: Patient Positioning and Portals",
            "faculty": "Veerendra Mudnoor",
            "time": "10:50"
          },
          {
            "topic": "How to Enter the Hip Joint Safely — Access Techniques",
            "faculty": "P. S Jaya Prasad",
            "time": "11:00"
          },
          {
            "topic": "FAI: Labral Management",
            "faculty": "Sarthak Patnaik",
            "time": "11:10"
          },
          {
            "topic": "FAI: CAM and Pincer Management",
            "faculty": "Ajay Singh Thakur",
            "time": "11:20"
          },
          {
            "topic": "Extra-Articular Hip Arthroscopy — Indications and Techniques",
            "faculty": "Sukesh Rao Sankineani",
            "time": "11:30"
          },
          {
            "topic": "Gluteal Space Endoscopy — Indications and Techniques",
            "faculty": "R. A. Purnachandra Tejaswi",
            "time": "11:40"
          }
        ]
      },
      {
        "time": "10:50",
        "end": "12:00",
        "hall": "A",
        "title": "Rotator Cuff Session",
        "type": "session",
        "chairs": "Chairpersons: K. Raghuveer Reddy · Chandra Sekhar P",
        "items": [
          {
            "topic": "Imaging Pearls in Rotator Cuff Tears",
            "faculty": "Srinadh Boppana",
            "time": "10:50"
          },
          {
            "topic": "Partial-Thickness Tears: Controversies, Evidence-Based Decision-Making & Re-Live",
            "faculty": "Jayakrishna Reddy T",
            "time": "10:58"
          },
          {
            "topic": "Complete Tears — Know the Pattern, Win the Repair",
            "faculty": "Rajkumar S. Amaravati",
            "time": "11:06"
          },
          {
            "topic": "Biomechanics Meets Outcomes: Which Repair Configuration Wins?",
            "faculty": "R. A. Purnachandra Tejaswi",
            "time": "11:14"
          },
          {
            "topic": "Beyond Repair: When and How to Augment Rotator Cuff Healing",
            "faculty": "Sarthak Patnaik",
            "time": "11:22"
          },
          {
            "topic": "Subscapularis Repair — Re-Live",
            "faculty": "Sridhar Gangavarapu",
            "time": "11:30"
          },
          {
            "topic": "Double-Row Cuff Repair",
            "faculty": "Rajeev Raman",
            "time": "11:38"
          }
        ]
      },
      {
        "time": "11:45",
        "end": "12:00",
        "hall": "A",
        "title": "The Cuff Conclave: Pearls, Pitfalls, and Practice-Changing Decisions",
        "type": "panel",
        "faculty": "Deepthi Nandan Reddy",
        "chairs": "Panel: Srinivasa Reddy Medagam, Nagarjuna C, R. A. Purnachandra Tejaswi, Sridhar Gangavarapu"
      },
      {
        "time": "11:50",
        "end": "12:20",
        "hall": "B",
        "title": "Case Discussions: Case 1 — FAI · Case 2 — Snapping Hip",
        "type": "panel",
        "faculty": "R. A. Purnachandra Tejaswi & Ajay Singh Thakur"
      },
      {
        "time": "12:00",
        "end": "12:30",
        "hall": "A",
        "title": "Live Surgery 7 · Reverse Shoulder Arthroplasty",
        "type": "live",
        "faculty": "Mukesh Laddha"
      },
      {
        "time": "12:30",
        "end": "13:00",
        "hall": "A",
        "title": "TAS Oration — Reverse Shoulder Replacement: Restoring Dignity in Life",
        "type": "keynote",
        "faculty": "Raman Kant Aggarwal · President, SESI"
      },
      {
        "time": "12:30",
        "end": "13:00",
        "hall": "B",
        "title": "TAS Oration",
        "type": "keynote"
      },
      {
        "time": "13:00",
        "end": "13:30",
        "hall": "A",
        "title": "Lunch",
        "type": "social"
      },
      {
        "time": "13:00",
        "end": "13:30",
        "hall": "B",
        "title": "Lunch",
        "type": "social"
      },
      {
        "time": "14:00",
        "end": "15:00",
        "hall": "A",
        "title": "When the Cuff is Beyond Repair: Strategies for the Irreparable Shoulder",
        "type": "session",
        "chairs": "Chairpersons: Bachu Srinivas · Sunil Apsingi",
        "items": [
          {
            "topic": "The Massive Cuff Tear: Defining Reparability and Choosing the Right Option",
            "faculty": "Deepthi Nandan Reddy",
            "time": "14:00"
          },
          {
            "topic": "Superior Capsular Reconstruction: Indications, Technique, and Current Evidence",
            "faculty": "Rajkumar S. Amaravati",
            "time": "14:08"
          },
          {
            "topic": "Muscle Slides and Margin Convergence: Extending the Limits of Repair",
            "faculty": "V.S. Abhilash Kumar Sunkesula",
            "time": "14:16"
          },
          {
            "topic": "Tendon Transfers: Restoring Function When Repair Is Not Possible",
            "faculty": "Chandra Shekar B",
            "time": "14:24"
          },
          {
            "topic": "Patch Augmentation and Bridging Reconstruction: Enhancing Biology and Mechanics",
            "faculty": "Sridhar Reddy",
            "time": "14:32"
          },
          {
            "topic": "Biomechanics of Reverse Arthroplasty",
            "faculty": "Anoop Reddy Sama",
            "time": "14:40"
          },
          {
            "topic": "Reverse Shoulder Arthroplasty: The Final Frontier for the Irreparable Cuff",
            "faculty": "Prashant Meshram",
            "time": "14:48"
          }
        ]
      },
      {
        "time": "14:00",
        "end": "15:45",
        "hall": "B",
        "title": "Ankle Arthroscopy",
        "type": "session",
        "items": [
          {
            "topic": "How I Do My Scopy — Portal Placement and Setup",
            "faculty": "Rajesh Racha",
            "time": "14:00"
          },
          {
            "topic": "Ankle Impingement — Diagnosis and Treatment",
            "faculty": "Shashi Kanth G",
            "time": "14:09"
          },
          {
            "topic": "Management of OCD Lesion of Talus — My Algorithm",
            "faculty": "Pradeep Moonot",
            "time": "14:18"
          },
          {
            "topic": "MIS in Foot and Ankle Surgery",
            "faculty": "T.V. Raja",
            "time": "14:32"
          },
          {
            "topic": "Arthroscopic Broström Repair — Re-Live Surgery",
            "faculty": "R. A. Purnachandra Tejaswi",
            "time": "14:52"
          },
          {
            "topic": "Tendoscopy Around the Ankle",
            "faculty": "Savithri",
            "time": "15:02"
          },
          {
            "topic": "Arthroscopic Ankle Arthrodesis — Is It Superior to Open Fusion?",
            "faculty": "Aditya Somayaji",
            "time": "15:10"
          },
          {
            "topic": "Future of Ankle Arthroscopy",
            "faculty": "Varun",
            "time": "15:18"
          }
        ]
      },
      {
        "time": "15:00",
        "end": "15:30",
        "hall": "A",
        "title": "Live Surgery 8 · Arthroscopic Rotator Cuff Repair",
        "type": "live",
        "faculty": "Sarthak Patnaik & Siva Kumar Mamillapalli"
      },
      {
        "time": "15:25",
        "end": "15:45",
        "hall": "B",
        "title": "Panel Discussion on Interesting Ankle Cases",
        "type": "panel",
        "chairs": "Moderator: Pradeep Moonot Panel: Vamsi Kiran Badam, T.V. Raja, Aditya Somayaji, Shashi Kanth G, Rajesh Racha"
      },
      {
        "time": "15:30",
        "end": "16:00",
        "hall": "A",
        "title": "GT Fractures + Frozen Shoulder",
        "type": "session",
        "chairs": "Chairpersons: P. S Jaya Prasad · Jagan Velpula",
        "items": [
          {
            "topic": "Arthroscopic Fixation of Greater Tuberosity Fractures — Re-Live",
            "faculty": "Kaushik Reddy",
            "time": "15:30"
          },
          {
            "topic": "Arthroscopic Capsular Release: Indications and Technique",
            "faculty": "Nithin Kumar Bejjanki",
            "time": "15:38"
          },
          {
            "topic": "Frozen Shoulder — What Works in Which Stage in 2026?",
            "faculty": "Siva Kumar Mamillapalli",
            "time": "15:46"
          }
        ]
      },
      {
        "time": "16:00",
        "end": "16:30",
        "hall": "A",
        "title": "Live Surgery 9 · Arthroscopic Rotator Cuff Repair + Patch",
        "type": "live",
        "faculty": "Raghu Nagaraj"
      },
      {
        "time": "16:30",
        "end": "16:45",
        "hall": "A",
        "title": "Learning Opportunities for Junior Surgeons",
        "type": "session",
        "faculty": "All Faculty"
      },
      {
        "time": "16:45",
        "end": "17:00",
        "hall": "A",
        "title": "Prize Distribution",
        "type": "social"
      },
      {
        "time": "17:00",
        "end": "17:30",
        "hall": "A",
        "title": "Closing Ceremony",
        "type": "social"
      }
    ]
  }
]

// ── Type meta ────────────────────────────────────────────────────────────
const TYPE_META: Record<SType, { label: string; color: string; icon: any }> = {
  live:     { label: 'Live Surgery', color: '#dc2626', icon: Radio },
  session:  { label: 'Lecture',      color: '#0A3A6B', icon: Presentation },
  panel:    { label: 'Panel',        color: '#002552', icon: MessageSquare },
  paper:    { label: 'Papers',       color: '#A56C00', icon: FileText },
  keynote:  { label: 'Oration',      color: '#C98500', icon: Award },
  workshop: { label: 'Workshop',     color: '#0d7a68', icon: Wrench },
  social:   { label: 'Social',       color: '#6b7280', icon: Coffee },
}
const FILTERS: Array<{ key: string; label: string; icon: any }> = [
  { key: 'all', label: 'All', icon: Activity },
  { key: 'live', label: 'Live Surgery', icon: Radio },
  { key: 'panel', label: 'Panels', icon: MessageSquare },
  { key: 'session', label: 'Lectures', icon: Presentation },
  { key: 'paper', label: 'Papers', icon: FileText },
  { key: 'keynote', label: 'Orations', icon: Award },
  { key: 'workshop', label: 'Workshops', icon: Wrench },
  { key: 'social', label: 'Social', icon: Coffee },
]

const to12 = (t: string) => {
  const [h, m] = t.split(':').map(Number)
  const ap = h >= 12 ? 'PM' : 'AM'
  const hh = h % 12 === 0 ? 12 : h % 12
  return `${hh}:${m.toString().padStart(2, '0')} ${ap}`
}

const buildICS = (day: Day) => {
  const pad = (n: number) => n.toString().padStart(2, '0')
  const fmt = (date: string, t: string) => {
    const [h, m] = t.split(':').map(Number)
    return date.replace(/-/g, '') + 'T' + pad(h) + pad(m) + '00'
  }
  let ics = 'BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//TASCON 2026//Program//EN\r\n'
  day.sessions.forEach((s, i) => {
    ics += 'BEGIN:VEVENT\r\n'
    ics += `UID:tascon2026-${day.id}-${i}@tascon2026.com\r\n`
    ics += `DTSTART;TZID=Asia/Kolkata:${fmt(day.date, s.time)}\r\n`
    ics += `DTEND;TZID=Asia/Kolkata:${fmt(day.date, s.end)}\r\n`
    ics += `SUMMARY:${s.title.replace(/,/g, '\\,')}\r\n`
    {
      const descParts: string[] = []
      if (s.faculty) descParts.push(`Faculty: ${s.faculty}`)
      if (s.chairs) descParts.push(`Chairpersons: ${s.chairs}`)
      if (s.items?.length) descParts.push(...s.items.map((it) => `• ${it.topic}${it.faculty ? ' — ' + it.faculty : ''}`))
      if (descParts.length) ics += `DESCRIPTION:${descParts.join('\\n').replace(/,/g, '\\,')}\r\n`
    }
    ics += `LOCATION:${s.hall ? 'Hall ' + s.hall + ', ' : ''}${conferenceConfig.venue.name}\r\n`
    ics += 'END:VEVENT\r\n'
  })
  ics += 'END:VCALENDAR'
  return ics
}

export default function ProgramPage() {
  const [dayIdx, setDayIdx] = useState(0)
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [hallFilter, setHallFilter] = useState('all')
  const [now, setNow] = useState<Date | null>(null)
  const [email, setEmail] = useState('')
  const [subscribing, setSubscribing] = useState(false)

  // Optional DB override — if an admin publishes a full program, use it
  const [remoteDays, setRemoteDays] = useState<Day[] | null>(null)

  useEffect(() => {
    document.title = `Program | ${conferenceConfig.shortName}`
    setNow(new Date())
    const t = setInterval(() => setNow(new Date()), 60_000)
    fetch('/api/program/config').then(r => r.json()).then(d => {
      const p = d?.data
      if (p?.isEnabled && p?.mode === 'full-program' && p?.program?.days?.length) {
        const mapped: Day[] = p.program.days.map((dy: any, i: number) => ({
          id: dy.id || `day${i + 1}`,
          date: dy.date,
          label: dy.title || `Day ${i + 1}`,
          theme: dy.description || '',
          sessions: (dy.sessions || []).map((s: any): Sess => ({
            time: s.startTime, end: s.endTime,
            hall: /hall\s*b/i.test(s.venue || '') ? 'B' : /hall\s*a/i.test(s.venue || '') ? 'A' : '',
            title: s.title,
            faculty: (s.speakers || []).map((sp: any) => sp?.name).filter(Boolean).join(', ') || undefined,
            items: s.description ? [{ topic: s.description }] : undefined,
            type: (['live','session','panel','paper','keynote','workshop','social'].includes(s.type) ? s.type
              : s.type === 'paper-presentation' ? 'paper'
              : s.type === 'break' || s.type === 'networking' ? 'social'
              : s.type === 'keynote' ? 'keynote' : 'session') as SType,
          })),
        }))
        setRemoteDays(mapped)
      }
    }).catch(() => {})
    return () => clearInterval(t)
  }, [])

  const days = remoteDays || PROGRAM
  const day = days[Math.min(dayIdx, days.length - 1)]

  const liveKey = useMemo(() => {
    if (!now) return null
    for (const d of days) {
      if (new Date(d.date).toDateString() !== now.toDateString()) continue
      for (const s of d.sessions) {
        const [sh, sm] = s.time.split(':').map(Number)
        const [eh, em] = s.end.split(':').map(Number)
        const st = new Date(d.date); st.setHours(sh, sm, 0, 0)
        const en = new Date(d.date); en.setHours(eh, em, 0, 0)
        if (now >= st && now <= en) return `${d.id}-${s.time}-${s.title}`
      }
    }
    return null
  }, [now, days])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return day.sessions.filter(s => {
      if (typeFilter !== 'all' && s.type !== typeFilter) return false
      if (hallFilter === 'A' && s.hall !== 'A') return false
      if (hallFilter === 'B' && s.hall !== 'B') return false
      if (hallFilter === 'plenary' && s.hall !== '') return false
      if (q) {
        const hay = `${s.title} ${s.faculty || ''} ${s.chairs || ''} ${(s.items || []).map((it) => it.topic + ' ' + (it.faculty || '')).join(' ')} ${TYPE_META[s.type].label} ${s.hall ? 'hall ' + s.hall : 'plenary'}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
  }, [day, query, typeFilter, hallFilter])

  const downloadDay = () => {
    const blob = new Blob([buildICS(day)], { type: 'text/calendar;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `TASCON2026-${day.id}.ics`
    a.click()
    URL.revokeObjectURL(a.href)
    toast.success('Calendar file downloaded')
  }

  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !email.includes('@')) { toast.error('Please enter a valid email address'); return }
    setSubscribing(true)
    try {
      const r = await fetch('/api/notifications/subscribe', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, type: 'program-reminder' }),
      })
      const d = await r.json()
      if (d.success) { toast.success("You're subscribed — we'll remind you before each session."); setEmail('') }
      else toast.error(d.message || 'Failed to subscribe')
    } catch { toast.error('Something went wrong. Please try again.') }
    finally { setSubscribing(false) }
  }

  return (
    <div className="min-h-screen bg-[#FCEFDF]">
      <Navigation />

      {/* Header */}
      <section className="pt-24 pb-10 bg-gradient-to-r from-[#002552] to-[#001B3D] text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-[11px] uppercase tracking-[0.25em] font-semibold text-white/80 mb-4">Scientific Programme</span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-3">Program <span className="text-[#C98500]">Schedule</span></h1>
            <p className="text-white/70 max-w-2xl mx-auto">Two days of live surgeries, expert panels, orations and hands-on workshops — {conferenceConfig.venue.name}, Hyderabad.</p>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-5 text-sm text-white/80">
              <span className="flex items-center gap-2"><Calendar size={15} className="text-[#C98500]" /> 18 – 19 July 2026</span>
              <span className="flex items-center gap-2"><MapPin size={15} className="text-[#C98500]" /> Halls A &amp; B run in parallel</span>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-10 max-w-5xl">
        {/* Day tabs */}
        <div className="flex flex-wrap gap-3 justify-center mb-6">
          {days.map((d, i) => (
            <button key={d.id} onClick={() => setDayIdx(i)}
              className={`px-5 py-3 rounded-2xl text-left transition-all border ${i === dayIdx ? 'bg-[#002552] text-white border-[#002552] shadow-lg' : 'bg-white text-[#002552] border-[#002552]/15 hover:border-[#C98500]/50'}`}>
              <div className="font-bold text-sm">{d.label}</div>
              <div className={`text-xs ${i === dayIdx ? 'text-[#C98500]' : 'text-[#002552]/55'}`}>{d.theme}</div>
            </button>
          ))}
        </div>

        {/* Search + reminder + calendar */}
        <div className="flex flex-col lg:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#002552]/40" />
            <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search sessions, topics, halls…" className="pl-10 h-12 bg-white border-[#002552]/15" />
            {query && <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#002552]/40 hover:text-[#002552]"><X size={16} /></button>}
          </div>
          <button onClick={downloadDay} className="h-12 px-5 rounded-xl bg-white border border-[#002552]/15 text-[#002552] font-semibold text-sm inline-flex items-center justify-center gap-2 hover:border-[#C98500]/50 transition-colors">
            <Download size={16} /> Add day to calendar
          </button>
          <a href="/brochure.pdf" download="TASCON-2026-Brochure.pdf" className="h-12 px-5 rounded-xl bg-[#C98500] text-[#002552] font-bold text-sm inline-flex items-center justify-center gap-2 hover:bg-[#E0A52A] transition-colors">
            <Download size={16} /> Download Brochure (PDF)
          </a>
          <a href="/day-1-cases.pdf" download="TASCON-2026-Day-1-Cases.pdf" className="h-12 px-5 rounded-xl bg-[#002552] text-white font-bold text-sm inline-flex items-center justify-center gap-2 hover:bg-[#001B3D] transition-colors">
            <Download size={16} /> Day 1 Cases (PDF)
          </a>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-3">
          {FILTERS.map(f => {
            const on = typeFilter === f.key
            return (
              <button key={f.key} onClick={() => setTypeFilter(f.key)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 border transition-all ${on ? 'bg-[#002552] text-white border-[#002552]' : 'bg-white text-[#002552]/70 border-[#002552]/15 hover:border-[#002552]/40'}`}>
                <f.icon size={13} /> {f.label}
              </button>
            )
          })}
        </div>
        <div className="flex flex-wrap gap-2 mb-8">
          {[{ k: 'all', l: 'Both Halls' }, { k: 'A', l: 'Hall A' }, { k: 'B', l: 'Hall B' }, { k: 'plenary', l: 'Plenary' }].map(h => {
            const on = hallFilter === h.k
            return (
              <button key={h.k} onClick={() => setHallFilter(h.k)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${on ? 'bg-[#C98500] text-[#002552] border-[#C98500]' : 'bg-white text-[#002552]/70 border-[#002552]/15 hover:border-[#C98500]/50'}`}>
                {h.l}
              </button>
            )
          })}
          <span className="ml-auto self-center text-xs text-[#002552]/50 font-medium">{filtered.length} session{filtered.length === 1 ? '' : 's'}</span>
        </div>

        {/* Sessions */}
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((s, i) => {
              const meta = TYPE_META[s.type]
              const isLive = liveKey === `${day.id}-${s.time}-${s.title}`
              return (
                <motion.div key={`${s.time}-${s.title}`} layout
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.25, delay: Math.min(i * 0.02, 0.3) }}
                  className={`relative bg-white rounded-2xl shadow-sm border overflow-hidden ${isLive ? 'border-[#dc2626] ring-2 ring-[#dc2626]/20' : 'border-[#002552]/10'}`}
                  style={{ borderLeft: `4px solid ${meta.color}` }}>
                  <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-5">
                    {/* time */}
                    <div className="shrink-0 sm:w-28">
                      <div className="flex items-center gap-1.5 text-[#002552] font-bold text-sm">
                        <Clock size={14} className="text-[#C98500]" /> {to12(s.time)}
                      </div>
                      <div className="text-[11px] text-[#002552]/50 sm:pl-5">to {to12(s.end)}</div>
                    </div>
                    {/* body */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide text-white" style={{ backgroundColor: meta.color }}>
                          <meta.icon size={11} /> {meta.label}
                        </span>
                        {s.hall && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#002552]/8 text-[#002552]">Hall {s.hall}</span>}
                        {isLive && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase text-white bg-[#dc2626] animate-pulse"><Radio size={10} /> Live now</span>}
                      </div>
                      <h3 className="text-[#002552] font-bold leading-snug">{s.title}</h3>
                      {s.faculty && (
                        <p className="mt-1 text-sm font-semibold text-[#A56C00]">{s.faculty}</p>
                      )}
                      {s.chairs && (
                        <p className="mt-1.5 text-xs text-[#002552]/70"><span className="font-semibold text-[#C98500] uppercase tracking-wide text-[10px]">Chairpersons</span> · {s.chairs}</p>
                      )}
                      {s.items && s.items.length > 0 && (
                        <ul className="mt-2 space-y-1.5">
                          {s.items.map((it, j) => (
                            <li key={j} className="text-sm leading-snug flex gap-2">
                              <span className="text-[#C98500] mt-[3px] text-[8px]">●</span>
                              <span className="text-[#002552]/80">
                                {it.topic}
                                {it.faculty && <span className="text-[#A56C00] font-semibold"> — {it.faculty}</span>}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>

          {filtered.length === 0 && (
            <div className="text-center py-16">
              <Search className="w-10 h-10 text-[#002552]/25 mx-auto mb-3" />
              <p className="text-[#002552]/60 font-semibold">No sessions match your filters</p>
              <button onClick={() => { setQuery(''); setTypeFilter('all'); setHallFilter('all') }} className="mt-3 text-sm font-semibold text-[#C98500] hover:underline">Clear all filters</button>
            </div>
          )}
        </div>

        {/* Reminder */}
        <div className="mt-12 rounded-3xl bg-gradient-to-br from-[#002552] to-[#001B3D] text-white p-8 text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#C98500]/20 flex items-center justify-center mx-auto mb-4">
            <Bell className="w-6 h-6 text-[#C98500]" />
          </div>
          <h3 className="text-2xl font-bold mb-2">Get session reminders</h3>
          <p className="text-white/70 max-w-lg mx-auto mb-6">Subscribe and we&apos;ll email you the schedule and remind you before live surgeries and key sessions.</p>
          <form onSubmit={subscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your.email@example.com" className="flex-1 h-12 bg-white text-[#002552]" />
            <Button type="submit" disabled={subscribing} className="h-12 px-6 bg-[#C98500] text-[#002552] hover:bg-[#E0A52A] font-bold">
              {subscribing ? 'Subscribing…' : <>Notify Me <ArrowRight className="w-4 h-4 ml-1.5" /></>}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
