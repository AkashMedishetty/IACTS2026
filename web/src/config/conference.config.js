/**
 * JavaScript wrapper for conference config
 * This allows scripts to import the config without TypeScript compilation
 */

module.exports.conferenceConfig = {
  // Basic Information
  name: "3rd Annual Conference of Telangana Arthroscopy Society",
  shortName: "TASCON 2026",
  registrationPrefix: "TASCON2026",
  organizationName: "Telangana Arthroscopy Society",
  tagline: "Advancing Arthroscopic Excellence",
  
  // Event Dates
  eventDate: {
    start: "2026-07-18",
    end: "2026-07-19"
  },
  
  // Venue
  venue: {
    name: "Hotel Daspalla",
    address: "Road No 37, Jubilee Hills",
    city: "Hyderabad",
    state: "Telangana",
    country: "India",
    pincode: "500033"
  },
  
  // Contact
  contact: {
    email: "contact@tascon2026.com",
    phone: "+91 9014772432",
    website: "https://tascon2026.com",
    supportEmail: "contact@tascon2026.com",
    abstractsEmail: "abstracts@tascon2026.com"
  },
  
  // Theme Colors
  theme: {
    primary: "#0d9488",
    secondary: "#14b8a6",
    accent: "#0d9488",
    success: "#10b981",
    error: "#ef4444",
    warning: "#f59e0b",
    dark: "#0f172a",
    light: "#ffffff"
  },
  
  // Registration
  registration: {
    enabled: true,
    startDate: "2025-06-01",
    endDate: "2026-07-19",
    formFields: {
      titles: ['Dr.', 'Prof.', 'Mr.', 'Mrs.', 'Ms.'],
      designations: ['Consultant', 'PG/Student'],
      relationshipTypes: ['Spouse', 'Child', 'Parent', 'Friend', 'Colleague', 'Other'],
      paymentMethods: ['bank-transfer', 'online', 'pay-now', 'cash']
    },
    categories: [
      { key: "cvsi-member", label: "TAS Member", requiresMembership: true, membershipField: "membershipNumber" },
      { key: "non-member", label: "Non-TAS Member" },
      { key: "resident", label: "Resident / Fellow" },
      { key: "international", label: "International Delegate" },
      { key: "complimentary", label: "Complimentary Registration" }
    ],
    workshopsEnabled: true,
    maxWorkshopsPerUser: 5,
    accompanyingPersonEnabled: true,
    maxAccompanyingPersons: 2
  },
  
  // Payment
  payment: {
    enabled: true,
    currency: "INR",
    currencySymbol: "₹",
    methods: {
      razorpay: true,
      bankTransfer: true,
      cash: true
    },
    bankDetails: {
      accountName: "TASCON 2026",
      accountNumber: "1234567890",
      bankName: "State Bank of India",
      ifscCode: "SBIN0001234",
      branchName: "Hyderabad Main Branch"
    },
    tiers: {
      earlyBird: {
        enabled: true,
        startDate: "2025-06-01",
        endDate: "2026-05-31",
        label: "Early Bird"
      },
      regular: {
        enabled: true,
        startDate: "2026-06-01",
        endDate: "2026-06-30",
        label: "Regular"
      },
      onsite: {
        enabled: true,
        startDate: "2026-07-01",
        endDate: "2026-07-19",
        label: "Late / Spot Registration"
      }
    }
  },
  
  // Abstracts
  abstracts: {
    enabled: true,
    submissionWindow: {
      enabled: true,
      start: "2025-08-01",
      end: "2026-06-30"
    },
    maxAbstractsPerUser: 5,
    tracks: [
      { key: "oral-presentation", label: "Oral Presentation", enabled: true },
      { key: "poster", label: "Poster Presentation", enabled: true },
      { key: "e-poster", label: "E-Poster", enabled: true },
      { key: "video-presentation", label: "Video Presentation", enabled: true }
    ],
    allowedInitialFileTypes: [
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ],
    allowedFinalFileTypes: [
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    ],
    maxFileSizeMB: 10
  },
  
  // Email
  email: {
    fromName: "TASCON 2026",
    replyTo: "noreply@tascon2026.com",
    footerText: "© 2026 TASCON - Telangana Arthroscopy Society. All rights reserved.",
    logoUrl: "/images/logo.png"
  },
  
  // Social Media
  social: {
    facebook: "https://facebook.com/tascon2026",
    twitter: "https://twitter.com/tascon2026",
    instagram: "https://instagram.com/tascon2026",
    linkedin: "https://linkedin.com/company/tascon2026"
  },
  
  // Features
  features: {
    userDashboard: true,
    adminPanel: true,
    reviewerPortal: true,
    abstractSubmission: true,
    workshopBooking: true,
    certificateGeneration: true,
    qrCodeGeneration: true
  }
}
