/**
 * Default registration categories / form fields for first-run config seeding.
 * Derived from conference.config.ts so no conference-specific category ever
 * gets baked into a fallback.
 */
import { conferenceConfig } from '@/config/conference.config'

export function defaultRegistrationCategories() {
  return conferenceConfig.registration.categories.map((cat, index) => ({
    key: cat.key,
    label: cat.label,
    ...(cat.requiresMembership
      ? { requiresMembership: true, membershipField: cat.membershipField || 'membershipNumber' }
      : {}),
    isActive: true,
    displayOrder: index + 1,
  }))
}

export function defaultFormFields() {
  return { ...conferenceConfig.registration.formFields }
}
