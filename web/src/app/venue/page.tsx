"use client"

import { motion } from "framer-motion"
import { MapPin, Building2, Car } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Navigation } from "../../components/Navigation"
import { conferenceConfig } from "../../config/conference.config"

export default function VenuePage() {
  const { venue, shortName, name } = conferenceConfig

  return (
    <div className="min-h-screen bg-[#FCEFDF]">
      <Navigation />

      <div className="pt-20 pb-8 lg:pt-24 lg:pb-12">
        {/* Hero Section */}
        <section className="relative h-[50vh] lg:h-[60vh] overflow-hidden">
          <div className="absolute inset-0">
            <img src="/daspalla.jpg" alt="Hotel Daspalla, Hyderabad" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#002552]/85 to-[#002552]/60" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center text-center">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-white px-4"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 lg:mb-6">Conference Venue</h1>
              <p className="text-base md:text-lg lg:text-xl max-w-3xl mx-auto mb-6">
                Join us at the prestigious {venue.name} for {shortName}.
                <br />
                <span className="text-[#E0A52A]">{venue.address}, {venue.city}, {venue.state}</span>
              </p>
              <div className="flex justify-center mb-6">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    className="px-8 py-4 text-lg bg-[#002552] hover:bg-[#C98500] hover:text-[#002552] text-white rounded-full shadow-2xl font-bold"
                    onClick={() => { if (typeof window !== 'undefined') { window.location.assign('/register') } }}
                  >
                    Register Now
                  </Button>
                </motion.div>
              </div>
              <div className="flex items-center justify-center space-x-2 text-sm md:text-base lg:text-lg">
                <MapPin className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6" />
                <span>{venue.city}, {venue.state}</span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Venue Details Section */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-[#002552] via-[#C98500] to-[#A56C00] bg-clip-text text-transparent">
                {venue.name}
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                A prestigious 4-star hotel with modern conference facilities in the heart of Jubilee Hills, Hyderabad
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="space-y-8"
              >
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-[#C98500] to-[#A56C00] rounded-xl flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-[#002552] dark:text-gray-100 mb-2">Location</h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {venue.name}<br />
                        {venue.address}<br />
                        {venue.city}, {venue.state} {venue.pincode}<br />
                        {venue.country}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-[#C98500] to-[#A56C00] rounded-xl flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-[#002552] dark:text-gray-100 mb-2">Facilities</h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        • Modern Conference Halls<br />
                        • Banquet & Meeting Rooms<br />
                        • In-house Restaurants (Indian, Italian, Chinese)<br />
                        • Wi-Fi & AV Equipment<br />
                        • Ample Parking
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-[#C98500] to-[#A56C00] rounded-xl flex items-center justify-center flex-shrink-0">
                      <Car className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-[#002552] dark:text-gray-100 mb-2">How to Reach</h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        • ~30 min from Rajiv Gandhi International Airport<br />
                        • Located in Jubilee Hills, close to Hi-Tech City<br />
                        • Well connected by road and metro<br />
                        • Wheelchair accessible
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Venue Photo */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="relative"
              >
                <div className="rounded-2xl overflow-hidden shadow-xl mb-6">
                  <img src="/daspalla.jpg" alt="Hotel Daspalla, Hyderabad" className="w-full h-64 lg:h-80 object-cover" />
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl">
                  <h3 className="text-xl font-bold text-[#002552] dark:text-gray-100 mb-4 text-center">Location Map</h3>
                  <div className="w-full h-80 rounded-xl overflow-hidden mb-4">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3806.8!2d78.4!3d17.43!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb91007d1a8e5d%3A0x8e1b5e0e5e5e5e5e!2sHotel+Daspalla!5e0!3m2!1sen!2sin!4v1234567890"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title={`${venue.name} Location`}
                    ></iframe>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      className="flex-1 bg-[#002552] hover:bg-[#C98500] hover:text-[#002552] text-white"
                      onClick={() => window.open('https://maps.google.com/?q=Hotel+Daspalla+Jubilee+Hills+Hyderabad', '_blank')}
                    >
                      <MapPin className="w-4 h-4 mr-2" />
                      View on Google Maps
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 border-[#002552] text-[#002552] hover:bg-[#FCEFDF]"
                      onClick={() => window.open('https://maps.google.com/maps/dir//Hotel+Daspalla+Jubilee+Hills+Hyderabad', '_blank')}
                    >
                      <Car className="w-4 h-4 mr-2" />
                      Get Directions
                    </Button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 md:py-16 bg-gradient-to-r from-[#002552] to-[#001B3D] text-white">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-2xl md:text-4xl font-bold mb-4 md:mb-6">Ready to Join Us in {venue.city}?</h2>
              <p className="text-lg md:text-xl mb-6 md:mb-8 max-w-2xl mx-auto">
                Register now to secure your spot at {name}.
              </p>
              <a href="/register">
                <Button className="bg-white text-[#002552] hover:bg-[#FFF6E4] hover:text-[#A56C00] px-6 md:px-8 py-3 md:py-4 text-base md:text-lg rounded-full font-bold shadow-lg border-2 border-white">
                  Register Now
                </Button>
              </a>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  )
}
