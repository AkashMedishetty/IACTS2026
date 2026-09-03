"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { Navigation } from "../../components/Navigation"
import { conferenceConfig } from "../../config/conference.config"
import { Calendar, MapPin, Sparkles, ArrowRight, CheckCircle } from "lucide-react"

const fmt = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
const fmtFull = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

const OBJECTIVES = [
  'Promote excellence in arthroscopic surgery through knowledge sharing and collaboration',
  'Showcase the latest research and innovations in arthroscopy and sports medicine',
  'Provide hands-on training through cadaver workshops and live demonstrations',
  'Foster networking among orthopaedic and sports medicine professionals',
]

export default function AboutPage() {
  const dates = `${fmt(conferenceConfig.eventDate.start)} – ${fmtFull(conferenceConfig.eventDate.end)}`

  return (
    <div className="min-h-screen bg-[#FCEFDF]">
      <Navigation />

      {/* ── HERO BANNER ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#002552] via-[#002552] to-[#001B3D] text-white pt-28 pb-20">
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute -top-24 -right-16 w-[480px] h-[480px] rounded-full bg-[#C98500]/30 blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-[360px] h-[360px] rounded-full bg-[#C98500]/20 blur-[120px]" />
        </div>
        <div className="relative max-w-5xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-[11px] uppercase tracking-[0.25em] font-semibold text-white/80 mb-6">
              About the Conference
            </span>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-3">
              TAS<span className="text-[#C98500]">CON</span> 2026
            </h1>
            <p className="text-base md:text-lg text-white/70 max-w-2xl mx-auto mb-8">{conferenceConfig.name}</p>

            {/* Theme — highlighted */}
            <div className="inline-flex items-center gap-2 sm:gap-3 px-5 sm:px-7 py-3 rounded-2xl bg-gradient-to-r from-[#C98500] to-[#A56C00] text-[#002552] font-extrabold uppercase tracking-[0.15em] text-sm sm:text-xl shadow-xl">
              <span>Debate</span><span className="opacity-50">·</span><span>Discuss</span><span className="opacity-50">·</span><span>Decide</span>
            </div>
          </motion.div>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10 pb-20">

        {/* ── HIGHLIGHTED INFO: Dates / Venue / Theme ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-14">
          {[
            { icon: Calendar, label: 'The Dates', value: dates, sub: 'Two days' },
            { icon: MapPin, label: 'The Venue', value: conferenceConfig.venue.name, sub: `${conferenceConfig.venue.city}, India` },
            { icon: Sparkles, label: 'The Theme', value: conferenceConfig.tagline, sub: 'TASCON 2026' },
          ].map((c, i) => (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="rounded-3xl bg-white border border-[#002552]/10 shadow-lg p-7 text-center"
            >
              <div className="w-14 h-14 mx-auto rounded-2xl bg-[#C98500]/15 flex items-center justify-center mb-5">
                <c.icon className="w-7 h-7 text-[#C98500]" />
              </div>
              <p className="text-[10px] uppercase tracking-[0.25em] font-semibold text-[#002552]/45 mb-2">{c.label}</p>
              <p className="text-xl font-black text-[#002552] leading-tight">{c.value}</p>
              <p className="text-sm text-[#002552]/60 mt-1">{c.sub}</p>
            </motion.div>
          ))}
        </div>

        {/* ── ABOUT CONTENT ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-3xl bg-white border border-[#002552]/10 shadow-lg p-8 sm:p-10 mb-8"
        >
          <h2 className="text-3xl font-bold text-[#002552] mb-6">
            About <span className="text-[#C98500]">{conferenceConfig.shortName}</span>
          </h2>
          <div className="space-y-4 text-[#002552]/75 text-base sm:text-lg leading-relaxed">
            <p>
              The {conferenceConfig.name} (<strong>{conferenceConfig.shortName}</strong>) is a premier gathering of
              arthroscopy and sports medicine specialists, orthopaedic surgeons, researchers and healthcare
              professionals dedicated to advancing the field of arthroscopic surgery.
            </p>
            <p>
              Built around the theme <strong className="text-[#C98500]">Debate · Discuss · Decide</strong>, this year&apos;s
              conference brings together leading experts to share cutting-edge techniques, innovative treatment
              approaches and best practices in arthroscopy, sports medicine and minimally invasive orthopaedic surgery.
            </p>
            <p>
              Join us for two transformative days of keynote presentations, live surgical demonstrations, hands-on
              cadaver workshops, free-paper &amp; poster sessions, and networking with colleagues from across the country.
            </p>
          </div>
        </motion.div>

        {/* ── OBJECTIVES ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-3xl bg-white border border-[#002552]/10 shadow-lg p-8 sm:p-10 mb-12"
        >
          <h2 className="text-3xl font-bold text-[#002552] mb-8">Conference <span className="text-[#C98500]">Objectives</span></h2>
          <div className="grid sm:grid-cols-2 gap-5">
            {OBJECTIVES.map((o, i) => (
              <div key={i} className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-[#C98500] mt-0.5 flex-shrink-0" />
                <p className="text-[#002552]/75">{o}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── CTA ── */}
        <div className="text-center">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-9 py-4 bg-[#C98500] text-[#002552] font-bold text-lg rounded-full hover:bg-[#C98500]/90 transition-all shadow-lg"
          >
            Register for TASCON 2026
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </main>
    </div>
  )
}
