/**
 * Conference Configuration
 * 
 * This is the ONLY file you need to edit for a new conference.
 * All other components will automatically use these settings.
 */

export interface ConferenceConfig {
  // Basic Information
  name: string
  shortName: string
  registrationPrefix?: string  // Optional: Custom prefix for IDs (e.g., "NV2026")
  organizationName: string
  tagline?: string
  
  // Event Dates
  eventDate: {
    start: string // YYYY-MM-DD
    end: string   // YYYY-MM-DD
  }
  
  // Venue Information
  venue: {
    name: string
    address?: string
    city: string
    state: string
    country: string
    pincode?: string
    description?: string
    facilities?: string[]
    accessibility?: string[]
    mapUrl?: string
    googleMapsLink?: string
    aboutCity?: {
      title?: string
      description?: string
      highlights?: Array<{
        title: string
        description: string
        icon: string
      }>
    }
  }
  
  // Contact Information
  contact: {
    email: string
    phone: string
    website: string
    supportEmail?: string
    abstractsEmail?: string
  }
  
  // Theme Colors - These will be applied throughout the system
  theme: {
    primary: string      // Main brand color (buttons, headers)
    secondary: string    // Accent color (links, highlights)
    accent: string       // Special highlights (warnings, alerts)
    success: string      // Success states
    error: string        // Error states
    warning: string      // Warning states
    dark: string         // Dark text and elements
    light: string        // Light backgrounds
  }
  
  // Registration Configuration
  registration: {
    enabled: boolean
    startDate?: string   // YYYY-MM-DD
    endDate?: string     // YYYY-MM-DD
    
    // Form Fields Configuration
    formFields: {
      titles: string[]              // ['Dr.', 'Prof.', 'Mr.', 'Mrs.', 'Ms.']
      designations: string[]        // ['Consultant', 'PG/Student']
      relationshipTypes: string[]   // ['Spouse', 'Child', 'Parent', 'Other']
      paymentMethods: string[]      // ['bank-transfer', 'online', 'cash']
    }
    
    // Registration Categories
    categories: {
      key: string
      label: string
      description?: string
      requiresMembership?: boolean
      membershipField?: string
    }[]
    
    // Workshop Configuration
    workshopsEnabled: boolean
    maxWorkshopsPerUser?: number
    
    // Accompanying Person
    accompanyingPersonEnabled: boolean
    maxAccompanyingPersons?: number
  }
  
  // Payment Configuration
  payment: {
    enabled: boolean
    currency: string
    currencySymbol: string
    
    // Payment Methods
    methods: {
      razorpay: boolean
      bankTransfer: boolean
      cash: boolean
    }
    
    // Bank Details (for bank transfer)
    bankDetails?: {
      accountName: string
      accountNumber: string
      bankName: string
      ifscCode: string
      branchName?: string
    }
    
    // Pricing Tiers
    tiers: {
      earlyBird?: {
        enabled: boolean
        startDate: string
        endDate: string
        label: string
      }
      regular: {
        enabled: boolean
        startDate: string
        endDate: string
        label: string
      }
      onsite?: {
        enabled: boolean
        startDate: string
        endDate: string
        label: string
      }
    }
  }
  
  // Abstract Submission
  abstracts: {
    enabled: boolean
    enableAbstractsWithoutRegistration?: boolean  // Allow unregistered users to submit abstracts
    submissionWindow?: {
      enabled: boolean
      start: string
      end: string
    }
    maxAbstractsPerUser: number
    
    // Tracks (e.g., Free Paper, Poster, E-Poster)
    tracks: {
      key: string
      label: string
      enabled: boolean
      categories?: string[]
      subcategories?: string[]
    }[]
    
    // File Upload Settings
    allowedInitialFileTypes: string[]
    allowedFinalFileTypes: string[]
    maxFileSizeMB: number
  }
  
  // Email Branding
  email: {
    fromName: string
    replyTo: string
    footerText?: string
    logoUrl?: string
  }
  
  // Social Media
  social?: {
    facebook?: string
    twitter?: string
    instagram?: string
    linkedin?: string
    youtube?: string
  }
  
  // Features Toggle
  features: {
    userDashboard: boolean
    adminPanel: boolean
    reviewerPortal: boolean
    abstractSubmission: boolean
    workshopBooking: boolean
    certificateGeneration: boolean
    qrCodeGeneration: boolean
  }
}

/**
 * DEFAULT CONFIGURATION
 * IACTS Technocollege CME 2026 — Indian Association of Cardiovascular-Thoracic Surgeons
 */
export const conferenceConfig: ConferenceConfig = {
  // Basic Information — mirrors src/data/conference.ts (single source of truth)
  name: "IACTS Technocollege CME 2026",
  shortName: "IACTS 2026",
  registrationPrefix: "IACTS2026",
  organizationName: "Indian Association of Cardiovascular-Thoracic Surgeons",
  tagline: "The Future Is Now !",

  eventDate: {
    start: "2026-10-23",
    end: "2026-10-25"
  },

  venue: {
    name: "NIMS Hyderabad & Dr. MCR HRD Institute",
    address: "Nizam's Institute of Medical Sciences, Punjagutta",
    city: "Hyderabad",
    state: "Telangana",
    country: "India",
    pincode: "500082",
    description:
      "Day one runs as a hands-on pre-conference workshop at NIMS (Nizam's Institute of Medical Sciences). Days two and three move to the Dr. MCR HRD Institute Auditorium for the scientific programme.",
    facilities: [],
    accessibility: [],
    mapUrl: "",
    googleMapsLink: "https://maps.google.com/?q=Nizam%27s+Institute+of+Medical+Sciences+Hyderabad",
    aboutCity: {
      title: "About Hyderabad",
      description:
        "Hyderabad is a national centre for cardiothoracic care and medical education, home to premier institutions, strong surgical training infrastructure, and excellent connectivity.",
      highlights: [
        { title: "Medical Excellence", description: "Premier medical institutions and cardiothoracic centres of national standing.", icon: "Hospital" },
        { title: "Connected", description: "Well served by Rajiv Gandhi International Airport and national rail links.", icon: "Building" },
        { title: "Heritage", description: "A city of pearls, Charminar and Golconda, with a distinctive culinary culture.", icon: "Landmark" }
      ]
    }
  },

  contact: {
    // Flyer carries no phone number — left blank rather than invented.
    email: "nimscvts@gmail.com",
    phone: "",
    website: process.env.NEXT_PUBLIC_APP_URL || "",
    supportEmail: "nimscvts@gmail.com",
    abstractsEmail: "nimscvts@gmail.com"
  },

  // Living Operative Field palette (see BRAND.md)
  theme: {
    primary: "#b3122a",
    secondary: "#e32646",
    accent: "#e32646",
    success: "#10b981",
    error: "#ef4444",
    warning: "#f59e0b",
    dark: "#160a0d",
    light: "#fffdfc"
  },

  registration: {
    enabled: true,
    startDate: "2026-01-01",
    endDate: "2026-10-25",

    formFields: {
      titles: ['Dr.', 'Prof.', 'Mr.', 'Mrs.', 'Ms.'],
      designations: ['Consultant', 'Faculty', 'Senior Resident', 'Junior Resident', 'Fellow', 'PG/Student', 'Other'],
      relationshipTypes: ['Spouse', 'Child', 'Parent', 'Friend', 'Colleague', 'Other'],
      paymentMethods: ['bank-transfer', 'online', 'pay-now', 'cash']
    },

    categories: [
      { key: "resident", label: "Resident / Trainee" },
      { key: "iacts-member", label: "IACTS Member", requiresMembership: true, membershipField: "membershipNumber" },
      { key: "non-member", label: "Non-Member" },
      { key: "complimentary", label: "Complimentary Registration" },
      { key: "sponsored", label: "Sponsored Registration" }
    ],

    workshopsEnabled: true,
    maxWorkshopsPerUser: 1,

    // Not announced by the committee — kept off rather than invented.
    accompanyingPersonEnabled: false,
    maxAccompanyingPersons: 0
  },

  payment: {
    enabled: true,
    currency: "INR",
    currencySymbol: "₹",

    methods: {
      razorpay: false,        // enable once gateway credentials are issued
      bankTransfer: true,     // primary method for IACTS 2026
      cash: true              // spot registration at the counter
    },

    // Set from the admin panel (Settings → Payment Methods). Never hardcode
    // real account details in the repo.
    bankDetails: {
      accountName: "",
      accountNumber: "",
      bankName: "",
      ifscCode: "",
      branchName: ""
    },

    tiers: {
      earlyBird: {
        enabled: true,
        startDate: "2026-01-01",
        endDate: "2026-09-27",
        label: "Early Bird"
      },
      regular: {
        enabled: true,
        startDate: "2026-09-28",
        endDate: "2026-10-11",
        label: "Standard"
      },
      onsite: {
        enabled: true,
        startDate: "2026-10-12",
        endDate: "2026-10-25",
        label: "Spot Registration"
      }
    }
  },

  abstracts: {
    enabled: true,
    enableAbstractsWithoutRegistration: false,
    // Deadline not yet announced — window gate stays off until the committee confirms.
    submissionWindow: {
      enabled: false,
      start: "",
      end: ""
    },
    maxAbstractsPerUser: 3,

    tracks: [
      {
        key: "free-paper",
        label: "Free Paper",
        enabled: true,
        categories: ["Adult Cardiac", "Paediatric & Congenital", "Thoracic", "Vascular", "Heart & Lung Transplantation", "Miscellaneous"]
      },
      { key: "video", label: "Video Presentation", enabled: true },
      { key: "poster", label: "Poster Presentation", enabled: true },
      { key: "e-poster", label: "E-Poster", enabled: true }
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

  email: {
    fromName: "IACTS Technocollege CME 2026",
    replyTo: "nimscvts@gmail.com",
    footerText: "© 2026 IACTS Technocollege CME — Department of CTVS, NIMS Hyderabad.",
    logoUrl: "/images/logo.png"
  },

  social: {
    facebook: "",
    twitter: "",
    instagram: "",
    linkedin: ""
  },

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

/**
 * Helper function to get conference config
 * Can be extended to support database-driven config
 */
export function getConferenceConfig(): ConferenceConfig {
  return conferenceConfig
}

/**
 * Get current pricing tier based on date
 */
export function getCurrentPricingTier(): string {
  const today = new Date()
  const config = conferenceConfig.payment.tiers
  
  if (config.earlyBird?.enabled) {
    const start = new Date(config.earlyBird.startDate)
    const end = new Date(config.earlyBird.endDate)
    if (today >= start && today <= end) return 'earlyBird'
  }
  
  if (config.regular?.enabled) {
    const start = new Date(config.regular.startDate)
    const end = new Date(config.regular.endDate)
    if (today >= start && today <= end) return 'regular'
  }
  
  if (config.onsite?.enabled) {
    const start = new Date(config.onsite.startDate)
    const end = new Date(config.onsite.endDate)
    if (today >= start && today <= end) return 'onsite'
  }
  
  return 'regular'
}

/**
 * Check if registration is currently open
 */
export function isRegistrationOpen(): boolean {
  const config = conferenceConfig.registration
  if (!config.enabled) return false
  
  if (!config.startDate || !config.endDate) return true
  
  const today = new Date()
  const start = new Date(config.startDate)
  const end = new Date(config.endDate)
  
  return today >= start && today <= end
}

/**
 * Check if abstract submission is currently open
 */
export function isAbstractSubmissionOpen(): boolean {
  const config = conferenceConfig.abstracts
  if (!config.enabled) return false
  
  if (!config.submissionWindow?.enabled) return true
  
  const today = new Date()
  const start = new Date(config.submissionWindow.start)
  const end = new Date(config.submissionWindow.end)
  
  return today >= start && today <= end
}

/**
 * Faculty eligible for the Early Bird member rate, by 10-digit mobile number.
 * Supplied via EARLY_BIRD_FACULTY_PHONES (comma-separated) — never hardcoded, since these are personal numbers.
 */
export const earlyBirdFacultyPhones: string[] = (process.env.EARLY_BIRD_FACULTY_PHONES || '')
  .split(',')
  .map((entry) => entry.replace(/\D/g, '').slice(-10))
  .filter((digits) => digits.length === 10)

/**
 * Returns true if the given phone belongs to a faculty member eligible for Early Bird pricing.
 * Compares on the last 10 digits so it works with or without country code / spaces.
 */
export function isEarlyBirdFaculty(phone?: string): boolean {
  if (!phone) return false
  const digits = String(phone).replace(/\D/g, '').slice(-10)
  return digits.length === 10 && earlyBirdFacultyPhones.includes(digits)
}

/**
 * Get admin email derived from contact email domain
 * Example: support@example.org -> admin@example.org
 */
export function getAdminEmail(): string {
  const domain = conferenceConfig.contact.email.split('@')[1]
  return `admin@${domain}`
}

/**
 * Get registration ID prefix
 * Uses registrationPrefix if defined, otherwise derives from shortName
 * Example: "IACTS2026" (from shortName with spaces removed)
 */
export function getRegistrationPrefix(): string {
  return conferenceConfig.registrationPrefix || conferenceConfig.shortName.replace(/\s+/g, '')
}

/**
 * Get email subject with conference name
 * Example: getEmailSubject("Registration Confirmation") -> "Registration Confirmation - IACTS 2026"
 */
export function getEmailSubject(type: string): string {
  return `${type} - ${conferenceConfig.shortName}`
}

/**
 * Get category label from key
 * Returns the label for a registration category, or the key itself if not found
 * Example: getCategoryLabel("cvsi-member") -> "CVSI Member"
 */
export function getCategoryLabel(key: string): string {
  const category = conferenceConfig.registration.categories.find(c => c.key === key)
  return category?.label || key
}

/**
 * Get all valid category keys
 * Returns an array of all registration category keys defined in config
 * Example: ["cvsi-member", "consultant", "postgraduate", "international", "complimentary"]
 */
export function getCategoryKeys(): string[] {
  return conferenceConfig.registration.categories.map(c => c.key)
}

/**
 * Check if a category key is valid
 * Returns true if the key exists in the registration categories
 */
export function isValidCategoryKey(key: string): boolean {
  return getCategoryKeys().includes(key)
}

/**
 * Internal placeholder email domain, used when a delegate genuinely has no
 * address (e.g. complimentary desk registrations). Derived from the
 * registration prefix so it is never tied to another conference.
 */
export function getPlaceholderEmailDomain(): string {
  return `${(conferenceConfig.registrationPrefix || conferenceConfig.shortName).replace(/\s+/g, '').toLowerCase()}.local`
}
