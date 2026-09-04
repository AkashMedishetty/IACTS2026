import mongoose, { Document, Schema, Types } from 'mongoose'
import { conferenceConfig } from '@/config/conference.config'

// Registration category keys come from config; validation happens at the API layer.
const TITLE_OPTIONS = conferenceConfig.registration?.formFields?.titles || 
  ['Dr.', 'Prof.', 'Mr.', 'Mrs.', 'Ms.']

const DESIGNATION_OPTIONS = conferenceConfig.registration?.formFields?.designations ||
  ['Consultant', 'Fellow', 'PG/Student']

const PAYMENT_METHODS = conferenceConfig.registration?.formFields?.paymentMethods || 
  ['bank-transfer', 'online', 'pay-now', 'cash']

// Sponsor profile interface
export interface ISponsorProfile {
  companyName: string
  contactPerson: string
  category: 'platinum' | 'gold' | 'silver' | 'bronze' | 'exhibitor'
  allocation: {
    total: number
    used: number
  }
  status: 'active' | 'inactive'
  mustChangePassword: boolean
  lastActivity?: Date
  phone?: string
  address?: string
}

export interface IUser extends Document {
  email: string
  password: string
  profile: {
    title: string
    firstName: string
    lastName: string
    phone: string
    age?: number
    designation: string
    specialization?: string
    institution: string
    address: {
      street: string
      city: string
      state: string
      country: string
      pincode: string
    }
    profilePicture?: string
    dietaryRequirements?: string
    specialNeeds?: string
    mciNumber?: string
    hodFormUrl?: string
  }
  reviewer?: {
    expertise?: string[]
    maxConcurrentAssignments?: number
    notes?: string
  }
  // Sponsor profile - only for role='sponsor'
  sponsorProfile?: ISponsorProfile
  registration: {
    registrationId: string
    /** Category key from conferenceConfig.registration.categories */
    type: string
    status: 'pending' | 'pending-payment' | 'confirmed' | 'paid' | 'cancelled' | 'refunded'
    membershipNumber?: string
    remarks?: string
    workshopSelections: string[]
    accompanyingPersons: Array<{
      name: string
      age: number
      dietaryRequirements?: string
      relationship: string
    }>
    accommodation?: {
      required: boolean
      roomType: string
      checkIn: string
      checkOut: string
      nights: number
      totalAmount: number
      /** True when the delegate's tier includes a complimentary stay. */
      complimentary?: boolean
    }
    registrationDate: Date
    /** Delivery state of the confirmation email. A failure here never blocks
     *  the registration itself — it is recorded so admin can retry. */
    confirmationEmail?: {
      sent: boolean
      sentAt?: Date
      attemptedAt?: Date
      error?: string
    }
    /** Delivery state of the "payment received" pass, with the entry QR. */
    paymentConfirmationEmail?: {
      sent: boolean
      sentAt?: Date
      attemptedAt?: Date
      error?: string
    }
    confirmedDate?: Date
    paymentDate?: Date
    paymentType?: 'regular' | 'pending' | 'online' | 'bank-transfer' | 'complementary' | 'sponsored' | 'complimentary'
    // Sponsor tracking
    sponsorId?: Types.ObjectId
    sponsorName?: string
    sponsorCategory?: string
    paymentRemarks?: string
    // Source tracking
    source?: 'normal' | 'sponsor-managed' | 'admin-created' | 'bulk-upload'
  }
  payment?: {
    method: 'bank-transfer' | 'online' | 'pay-now' | 'cash'
    status: 'pending' | 'verified' | 'rejected' | 'processing'
    amount: number
    bankTransferUTR?: string
    transactionId?: string
    razorpayOrderId?: string
    paymentDate?: Date
    verifiedBy?: string
    verificationDate?: Date
    remarks?: string
    invoiceGenerated?: boolean
    screenshotUrl?: string
  }
  activeSessions: Array<{
    sessionId: string
    deviceId: string
    deviceFingerprint: string
    loginTime: Date
    lastActivity: Date
    userAgent?: string
    ipAddress?: string
  }>
  role: 'user' | 'admin' | 'reviewer' | 'manager' | 'sponsor'
  isActive: boolean
  // Login tracking
  loginCount?: number
  lastLogin?: Date
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  profile: {
    title: {
      type: String,
      required: true,
      enum: TITLE_OPTIONS
    },
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    age: {
      type: Number,
      min: 0,
      max: 150
    },
    designation: {
      type: String,
      required: true,
      enum: DESIGNATION_OPTIONS,
      trim: true
    },
    specialization: {
      type: String,
      default: ''
    },
    institution: {
      type: String,
      default: '',
      trim: true
    },
    address: {
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      country: { type: String, default: 'India' },
      pincode: { type: String, default: '' }
    },
    profilePicture: String,
    dietaryRequirements: String,
    mciNumber: { type: String, default: '' },
    hodFormUrl: String,
    specialNeeds: String
  },
  reviewer: {
    expertise: { type: [String], default: [] },
    maxConcurrentAssignments: { type: Number, default: 5 },
    notes: { type: String, default: '' }
  },
  // Sponsor profile - only populated for role='sponsor'
  sponsorProfile: {
    companyName: { type: String },
    contactPerson: { type: String },
    category: {
      type: String,
      enum: ['platinum', 'gold', 'silver', 'bronze', 'exhibitor']
    },
    allocation: {
      total: { type: Number, default: 0 },
      used: { type: Number, default: 0 }
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    },
    mustChangePassword: { type: Boolean, default: true },
    lastActivity: { type: Date },
    phone: { type: String },
    address: { type: String }
  },
  registration: {
    registrationId: {
      type: String,
      unique: true,
      required: true
    },
    type: {
      type: String,
      required: true
      // Note: Registration types are now dynamic from database/config
      // Validation happens at the API level, not schema level
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'pending-payment', 'confirmed', 'paid', 'cancelled', 'refunded'],
      default: 'pending'
    },
    tier: { type: String },
    membershipNumber: String,
    remarks: String,
    workshopSelections: [String],
    accompanyingPersons: [{
      name: { type: String, required: true },
      age: { type: Number },
      dietaryRequirements: String,
      relationship: { type: String, required: true }
    }],
    accommodation: {
      required: { type: Boolean, default: false },
      roomType: { type: String },
      checkIn: { type: String },
      checkOut: { type: String },
      nights: { type: Number, default: 0 },
      totalAmount: { type: Number, default: 0 },
      complimentary: { type: Boolean, default: false }
    },
    registrationDate: {
      type: Date,
      default: Date.now
    },
    confirmationEmail: {
      sent: { type: Boolean, default: false },
      sentAt: { type: Date },
      attemptedAt: { type: Date },
      error: { type: String }
    },
    paymentConfirmationEmail: {
      sent: { type: Boolean, default: false },
      sentAt: { type: Date },
      attemptedAt: { type: Date },
      error: { type: String }
    },
    confirmedDate: Date,
    paymentDate: Date,
    paymentType: {
      type: String,
      enum: ['regular', 'pending', 'online', 'bank-transfer', 'complementary', 'sponsored', 'complimentary'],
      default: 'regular'
    },
    // Sponsor tracking
    sponsorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    sponsorName: String,
    sponsorCategory: {
      type: String,
      enum: ['platinum', 'gold', 'silver', 'bronze', 'exhibitor', 'other']
    },
    paymentRemarks: String,
    // Source tracking
    source: {
      type: String,
      enum: ['normal', 'sponsor-managed', 'admin-created', 'bulk-upload'],
      default: 'normal'
    }
  },
  payment: {
    method: {
      type: String,
      enum: PAYMENT_METHODS
    },
    status: {
      type: String,
      enum: ['pending', 'verified', 'rejected', 'processing']
    },
    amount: {
      type: Number
    },
    bankTransferUTR: String,
    transactionId: String,
    razorpayOrderId: String,
    paymentDate: Date,
    verifiedBy: String,
    verificationDate: Date,
    remarks: String,
    invoiceGenerated: {
      type: Boolean,
      default: false
    },
    screenshotUrl: String
  },
  activeSessions: [{
    sessionId: {
      type: String,
      required: true
    },
    deviceId: {
      type: String,
      required: true
    },
    deviceFingerprint: {
      type: String,
      required: true
    },
    loginTime: {
      type: Date,
      default: Date.now
    },
    lastActivity: {
      type: Date,
      default: Date.now
    },
    userAgent: String,
    ipAddress: String
  }],
  role: {
    type: String,
    enum: ['user', 'admin', 'reviewer', 'manager', 'sponsor'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Login tracking
  loginCount: {
    type: Number,
    default: 0
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true
})

// Create indexes for better performance (email and registrationId already have unique indexes)
// Note: registration.sponsorId already has index: true on the field definition
UserSchema.index({ 'registration.status': 1 })
UserSchema.index({ 'registration.paymentType': 1 })
UserSchema.index({ role: 1 })
UserSchema.index({ 'sponsorProfile.status': 1 })

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema)