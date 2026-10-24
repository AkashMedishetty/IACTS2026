/**
 * Import the onsite badge desk export straight into MONGODB_URI (.env.local) —
 * same logic as "Import spot registrations" on /admin/checkin.
 *
 *   pnpm tsx scripts/import-spot.ts <file.xlsx>            dry run (default)
 *   pnpm tsx scripts/import-spot.ts <file.xlsx> --commit   write
 * Flags: --create-all-unmatched
 * Everyone imported starts NOT checked in; the desk's own check-ins are ignored.
 */
import { config as loadEnv } from 'dotenv'
import fs from 'fs'
import path from 'path'

loadEnv({ path: path.resolve(process.cwd(), '.env.local'), override: true })

async function main() {
  const file = process.argv[2]
  const flags = new Set(process.argv.slice(3))
  if (!file || !process.env.MONGODB_URI) {
    console.error('usage: pnpm tsx scripts/import-spot.ts <file.xlsx> [--commit]  (MONGODB_URI in .env.local)')
    process.exit(1)
  }
  const { runSpotImport } = await import('../src/lib/spotImport')
  const result = await runSpotImport(fs.readFileSync(file), {
    dryRun: !flags.has('--commit'),
    createAllUnmatched: flags.has('--create-all-unmatched'),
  })
  console.log(JSON.stringify(result, null, 2))
  process.exit(0)
}

main().catch((err) => { console.error(err); process.exit(1) })
