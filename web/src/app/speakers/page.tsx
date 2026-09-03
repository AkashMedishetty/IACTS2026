"use client"

import { useEffect } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { Navigation } from "../../components/Navigation"
import { conferenceConfig } from "../../config/conference.config"

// National Faculty — source: TASCON 2026 brochure (page 05)
const FACULTY: Array<{ name: string; city?: string; img?: string }> = [
  { name: "Dr Abhijit Wahegaonkar", img: "/faculty/abhijit-wahegaonkar.jpg" },
  { name: "Dr Anshu Shekhar", img: "/faculty/anshu-shekhar.jpg" },
  { name: "Dr Anup Bansode", img: "/faculty/anup-bansode.jpg" },
  { name: "Dr Arvind Prasad Gupta", img: "/faculty/arvind-prasad-gupta.jpeg" },
  { name: "Dr Ashim Gupta", img: "/faculty/ashim-gupta.jpeg" },
  { name: "Dr Bhushan Sabnis", img: "/faculty/bhushan-sabnis.png" },
  { name: "Dr Bishnu Patro", img: "/faculty/bishnu-patro.webp" },
  { name: "Dr Chirag Thonse", img: "/faculty/chirag-thonse.jpg" },
  { name: "Dr Deepak Goyal", img: "/faculty/deepak-goyal.webp" },
  { name: "Dr K. N. Subramanian", img: "/faculty/kn-subramanian.jpeg" },
  { name: "Dr Karun Jain", img: "/faculty/karun-jain.jpeg" },
  { name: "Dr Madhan Jeyaraman", img: "/faculty/madhan-jeyaraman.webp" },
  { name: "Dr Miten Sheth", img: "/faculty/miten-sheth.jpg" },
  { name: "Dr Mukesh Laddha", img: "/faculty/mukesh-laddha.jpeg" },
  { name: "Dr Nikhil Likhate", img: "/faculty/nikhil-likhate.jpeg" },
  { name: "Dr P. C. Jagadeesh", img: "/faculty/pc-jagadeesh.webp" },
  { name: "Dr Pradeep Munoot", img: "/faculty/pradeep-munoot.jpg" },
  { name: "Dr Raghu Nagaraj", img: "/faculty/raghu-nagaraj.jpeg" },
  { name: "Dr Raja Sekhar", img: "/faculty/raja-sekhar.jpeg" },
  { name: "Dr Rajeev Raman", img: "/faculty/rajeev-raman.jpeg" },
  { name: "Dr Rajkumar S. Amaravati", img: "/faculty/rajkumar-amaravati.jpg" },
  { name: "Dr Raman Kant Aggarwal", img: "/faculty/raman-kant-aggarwal.png" },
  { name: "Dr Ranajit Panigrahi", img: "/faculty/ranajit-panigrahi.jpeg" },
  { name: "Dr Roshan Wade", img: "/faculty/roshan-wade.jpg" },
  { name: "Dr Sachin Tapasvi", img: "/faculty/sachin-tapasvi.jpg" },
  { name: "Dr Sarthak Patnaik", img: "/faculty/sarthak-patnaik.jpeg" },
  { name: "Dr Sathish Muthu", img: "/faculty/sathish-muthu.jpeg" },
  { name: "Dr Shirish Pathak", img: "/faculty/shirish-pathak.jpeg" },
  { name: "Dr Siva Kumar Mamillapalli", img: "/faculty/siva-kumar-mamillapalli.jpeg" },
  { name: "Dr Sridhar Gangavarapu", img: "/faculty/sridhar-gangavarapu.jpg" },
  { name: "Dr T. V. Raja", img: "/faculty/tv-raja.jpeg" },
  { name: "Dr T. V. Ramana Murthy", img: "/faculty/tv-ramana-murthy.jpeg" },
]

function initials(name: string) {
  return name.replace(/^Dr\.?\s+/i, "").split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase()
}

function Avatar({ img, name }: { img?: string; name: string }) {
  return (
    <div className="relative w-24 h-24 sm:w-28 sm:h-28 mx-auto mb-4 overflow-hidden rounded-full bg-[#C98500]/15 ring-2 ring-[#C98500]/30">
      {img ? (
        <Image src={img} alt={name} fill sizes="160px" unoptimized className="object-cover object-top" />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-xl font-bold text-[#002552]/60">{initials(name)}</div>
      )}
    </div>
  )
}

export default function SpeakersPage() {
  useEffect(() => { document.title = `Faculty | ${conferenceConfig.shortName}` }, [])

  return (
    <div className="min-h-screen bg-[#FCEFDF]">
      <Navigation />

      {/* Header */}
      <section className="pt-24 pb-12 bg-gradient-to-r from-[#002552] to-[#001B3D] text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-[11px] uppercase tracking-[0.25em] font-semibold text-white/80 mb-4">Debate · Discuss · Decide</span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-3">National <span className="text-[#C98500]">Faculty</span></h1>
            <p className="text-white/70 max-w-2xl mx-auto">Leading arthroscopy &amp; sports-medicine surgeons from across India joining us for live surgeries, lectures and panel discussions.</p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-14 max-w-6xl">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {FACULTY.map((f, i) => (
            <motion.div
              key={f.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: Math.min(i * 0.03, 0.4), duration: 0.4 }}
              whileHover={{ y: -4 }}
              className="p-5 rounded-2xl bg-white border border-[#002552]/10 hover:border-[#C98500]/40 transition-all duration-300 text-center shadow-md"
            >
              <Avatar img={f.img} name={f.name} />
              <p className="text-[#002552] font-bold text-sm leading-tight">{f.name}</p>
              {f.city && <p className="text-[#C98500] text-xs font-semibold mt-1">{f.city}</p>}
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  )
}
