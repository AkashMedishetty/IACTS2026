/**
 * Seed ONLY the manager account.
 *
 *   pnpm seed:manager
 *
 * Reads SEED_MANAGER_EMAIL / SEED_MANAGER_PASSWORD / SEED_MANAGER_PHONE from
 * .env.local. Creates one user with role "manager" if that email does not
 * exist yet; if it does, it changes nothing. Pricing, workshops, the admin
 * account and every registration are left alone — unlike `pnpm seed`.
 */
import { config as loadEnv } from 'dotenv'
import path from 'path'

loadEnv({ path: path.resolve(process.cwd(), '.env.local'), override: true })

async function main() {
  if (!process.env.MONGODB_URI) {
    console.error('\n❌ MONGODB_URI is not set. Add it to .env.local first.\n')
    process.exit(1)
  }
  const { default: connectDB } = await import('../src/lib/mongodb')
  const { seedManagerUser } = await import('../src/lib/seed/adminSeeder')
  const { conferenceConfig } = await import('../src/config/conference.config')

  console.log(`\n🌱 Seeding manager for "${conferenceConfig.name}"`)
  console.log(`   database: ${process.env.MONGODB_URI.replace(/\/\/[^@]*@/, '//***@')}\n`)

  await connectDB()
  await seedManagerUser(conferenceConfig)

  console.log('Done.\n')
  process.exit(0)
}

main().catch((err) => {
  console.error('\n❌ Manager seeding failed:\n', err)
  process.exit(1)
})
