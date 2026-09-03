/**
 * Database seeding entrypoint.
 *
 *   pnpm seed
 *
 * Reads .env.local, connects to MONGODB_URI, and runs the config-driven
 * seeders (pricing tiers, workshops, accompanying-person config, staff users).
 * Everything it writes comes from src/config/* — nothing is hardcoded here.
 */
import 'dotenv/config'
import { config as loadEnv } from 'dotenv'
import path from 'path'

loadEnv({ path: path.resolve(process.cwd(), '.env.local'), override: true })

async function main() {
  if (!process.env.MONGODB_URI) {
    console.error('\n❌ MONGODB_URI is not set. Add it to .env.local first.\n')
    process.exit(1)
  }

  const { default: connectDB } = await import('../src/lib/mongodb')
  const { seedAll } = await import('../src/lib/seed/masterSeeder')
  const { conferenceConfig } = await import('../src/config/conference.config')

  console.log(`\n🌱 Seeding "${conferenceConfig.name}"`)
  console.log(`   database: ${process.env.MONGODB_URI.replace(/\/\/[^@]*@/, '//***@')}\n`)

  await connectDB()
  await seedAll(conferenceConfig)

  console.log('Done.\n')
  process.exit(0)
}

main().catch((err) => {
  console.error('\n❌ Seeding failed:\n', err)
  process.exit(1)
})
