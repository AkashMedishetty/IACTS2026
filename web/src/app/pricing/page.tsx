"use client"

import React from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import { Navigation } from "../../components/Navigation"
import { ArrowRight, Clock } from "lucide-react"
import Link from "next/link"
import { getCurrentTier } from "../../lib/registration"
import { conferenceConfig } from "../../config/conference.config"

export default function PricingPage() {
  const currentTier = getCurrentTier(new Date())

  const pricingData = [
    {
      tier: "Early Bird",
      period: "Upto 31st May 2026",
      deadline: "01/06/2025 – 31/05/2026",
      tasMember: 5000,
      nonTasMember: 7000,
      postgraduate: 2500,
      accompanying: 3000,
      current: currentTier === "Early Bird"
    },
    {
      tier: "Regular",
      period: "1st June – 30th June 2026",
      deadline: "01/06/2026 – 30/06/2026",
      tasMember: 6500,
      nonTasMember: 8500,
      postgraduate: 4000,
      accompanying: 4000,
      current: currentTier === "Regular"
    },
    {
      tier: "Spot Registration",
      period: "1st July – 19th July 2026",
      deadline: "01/07/2026 – 19/07/2026",
      tasMember: 8000,
      nonTasMember: 9500,
      postgraduate: 5500,
      accompanying: 4000,
      current: currentTier === "Spot Registration"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-r from-[#002552] via-[#002552] to-[#A56C00]">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center text-white"
          >
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">
              Conference Pricing
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-6 max-w-3xl mx-auto px-4">
              Choose your registration category for {conferenceConfig.shortName}
            </p>
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur border border-white/30 rounded-full px-4 sm:px-6 py-3 text-sm sm:text-base">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <span className="font-semibold">Current Tier: {currentTier}</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Table Section */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-8 sm:mb-12"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-gray-900 mb-4">
              Registration Categories & Pricing
            </h2>
            <p className="text-base sm:text-lg text-gray-600 text-center max-w-2xl mx-auto px-4">
              All prices are in INR (₹). 18% GST applicable on all fees.
            </p>
            <p className="text-sm text-teal-700 text-center max-w-2xl mx-auto px-4 mt-2">
              * Non-TAS Members get Free TAS Life Membership worth ₹3,000
            </p>
          </motion.div>

          {/* Desktop Table */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="hidden lg:block overflow-x-auto"
          >
            <div className="min-w-full bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-[#002552] to-[#002552] text-white">
                <div className="grid grid-cols-5 gap-4 p-6">
                  <div className="font-bold text-lg">Category</div>
                  <div className="text-center font-bold text-lg">TAS Member</div>
                  <div className="text-center font-bold text-lg">Non-TAS Member</div>
                  <div className="text-center font-bold text-lg">Post-Graduate</div>
                  <div className="text-center font-bold text-lg">Accompanying Person</div>
                </div>
              </div>
              <div className="divide-y divide-gray-200">
                {pricingData.map((tier, index) => (
                  <div
                    key={index}
                    className={`grid grid-cols-5 gap-4 p-6 transition-colors ${
                      tier.current
                        ? 'bg-gradient-to-r from-teal-50 to-teal-100/50 border-l-4 border-[#A56C00]'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-lg text-gray-900">{tier.tier}</span>
                        {tier.current && <Badge className="bg-[#A56C00] text-white text-xs">Current</Badge>}
                      </div>
                      <div className="text-sm text-gray-600">{tier.period}</div>
                    </div>
                    <div className="text-center"><div className="text-2xl font-bold text-gray-900">₹{tier.tasMember.toLocaleString()}</div></div>
                    <div className="text-center"><div className="text-2xl font-bold text-gray-900">₹{tier.nonTasMember.toLocaleString()}</div></div>
                    <div className="text-center"><div className="text-2xl font-bold text-gray-900">₹{tier.postgraduate.toLocaleString()}</div></div>
                    <div className="text-center"><div className="text-2xl font-bold text-gray-900">₹{tier.accompanying.toLocaleString()}</div></div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Mobile Card View */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="lg:hidden space-y-6"
          >
            {pricingData.map((tier, index) => (
              <Card
                key={index}
                className={`transition-all duration-300 ${
                  tier.current
                    ? 'ring-2 ring-[#A56C00] bg-gradient-to-r from-teal-50 to-teal-100/30'
                    : 'hover:shadow-lg'
                }`}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl text-gray-900">{tier.tier}</CardTitle>
                    {tier.current && <Badge className="bg-[#A56C00] text-white">Current</Badge>}
                  </div>
                  <div className="text-sm text-gray-600">{tier.period}</div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-white/60 rounded-lg">
                      <div className="text-xs text-gray-600 mb-1">TAS Member</div>
                      <div className="text-lg font-bold text-gray-900">₹{tier.tasMember.toLocaleString()}</div>
                    </div>
                    <div className="text-center p-3 bg-white/60 rounded-lg">
                      <div className="text-xs text-gray-600 mb-1">Non-TAS Member</div>
                      <div className="text-lg font-bold text-gray-900">₹{tier.nonTasMember.toLocaleString()}</div>
                    </div>
                    <div className="text-center p-3 bg-white/60 rounded-lg">
                      <div className="text-xs text-gray-600 mb-1">Post-Graduate</div>
                      <div className="text-lg font-bold text-gray-900">₹{tier.postgraduate.toLocaleString()}</div>
                    </div>
                    <div className="text-center p-3 bg-white/60 rounded-lg">
                      <div className="text-xs text-gray-600 mb-1">Accompanying Person</div>
                      <div className="text-lg font-bold text-gray-900">₹{tier.accompanying.toLocaleString()}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 bg-gradient-to-r from-[#002552] to-[#002552]">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="max-w-3xl mx-auto text-white"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
              Ready to Register for {conferenceConfig.shortName}?
            </h2>
            <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 text-white/90 px-4">
              Secure your spot at {conferenceConfig.name}.
              Join leading arthroscopy experts at {conferenceConfig.venue.name}, Hyderabad.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
              <Button size="lg" className="bg-[#A56C00] text-white hover:bg-[#A56C00]/90 w-full sm:w-auto" asChild>
                <Link href="/register">
                  Register Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
