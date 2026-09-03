/**
 * Admin and Reviewer User Seeder
 *
 * Credentials are supplied through the environment — never hardcoded. Seeding
 * refuses to run without them rather than creating a well-known default login.
 */

import bcrypt from 'bcryptjs'
import User from '../models/User'
import { ConferenceConfig } from '../../config/conference.config'

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value || !value.trim()) {
    throw new Error(
      `${name} is not set. Add it to .env.local before seeding — refusing to create an account with a default password.`,
    )
  }
  return value.trim()
}

/** Staff accounts must use a designation the schema actually allows. */
function staffDesignation(config: ConferenceConfig): string {
  const options = config.registration.formFields.designations || []
  return options.find((d) => /other/i.test(d)) || options[options.length - 1] || 'Other'
}

function addressFrom(config: ConferenceConfig) {
  return {
    street: config.venue.address || '',
    city: config.venue.city,
    state: config.venue.state,
    country: config.venue.country,
    pincode: config.venue.pincode || '',
  }
}

async function seedStaffUser(
  config: ConferenceConfig,
  opts: {
    role: 'admin' | 'reviewer'
    emailEnv: string
    passwordEnv: string
    phoneEnv: string
    registrationId: string
    title: string
    firstName: string
    lastName: string
    designation: string
  },
) {
  const email = requireEnv(opts.emailEnv).toLowerCase()
  const password = requireEnv(opts.passwordEnv)
  if (password.length < 12 || /^[0-9]+$/.test(password)) {
    console.warn(
      `   ⚠️  ${opts.passwordEnv} is weak (${password.length} chars${/^[0-9]+$/.test(password) ? ', digits only' : ''}).\n` +
      `      This account can read every delegate's personal data and payments.\n` +
      `      Change it from the admin panel before going live.`,
    )
  }

  const existing = await User.findOne({ email })
  if (existing) {
    console.log(`   ℹ️  ${opts.role} already exists: ${email}`)
    return existing
  }

  const user = await User.create({
    email,
    password: await bcrypt.hash(password, 12),
    profile: {
      title: opts.title,
      firstName: opts.firstName,
      lastName: opts.lastName,
      phone: process.env[opts.phoneEnv]?.trim() || '0000000000', // internal account placeholder
      designation: staffDesignation(config),
      institution: config.organizationName,
      address: addressFrom(config),
    },
    registration: {
      registrationId: opts.registrationId,
      type: 'complimentary',
      status: 'paid',
      registrationDate: new Date(),
    },
    role: opts.role,
    isEmailVerified: true,
  })

  console.log(`   ✅ ${opts.role} created: ${email} (${opts.designation})`)
  return user
}

export async function seedAdminUser(config: ConferenceConfig) {
  return seedStaffUser(config, {
    role: 'admin',
    emailEnv: 'SEED_ADMIN_EMAIL',
    passwordEnv: 'SEED_ADMIN_PASSWORD',
    phoneEnv: 'SEED_ADMIN_PHONE',
    registrationId: `${config.registrationPrefix}-ADMIN-001`,
    title: 'Mr.',
    firstName: 'Admin',
    lastName: 'User',
    designation: 'System Administrator',
  })
}

export async function seedReviewerUser(config: ConferenceConfig) {
  return seedStaffUser(config, {
    role: 'reviewer',
    emailEnv: 'SEED_REVIEWER_EMAIL',
    passwordEnv: 'SEED_REVIEWER_PASSWORD',
    phoneEnv: 'SEED_REVIEWER_PHONE',
    registrationId: `${config.registrationPrefix}-REVIEWER-001`,
    title: 'Dr.',
    firstName: 'Reviewer',
    lastName: 'User',
    designation: 'Abstract Reviewer',
  })
}

export async function seedAllUsers(config: ConferenceConfig) {
  const admin = await seedAdminUser(config)
  // Reviewer is optional — skip cleanly if its credentials are not configured.
  let reviewer = null
  if (process.env.SEED_REVIEWER_EMAIL && process.env.SEED_REVIEWER_PASSWORD) {
    reviewer = await seedReviewerUser(config)
  } else {
    console.log('   ℹ️  Reviewer credentials not set — skipping reviewer seed')
  }
  return { admin, reviewer }
}
