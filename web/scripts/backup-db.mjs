// Full logical backup: every collection -> <out>/<collection>.json (Extended JSON, canonical).
// Usage: node scripts/backup-db.mjs <outDir>   (reads MONGODB_URI from .env.local)
import { config } from 'dotenv'
import mongoose from 'mongoose'
import fs from 'fs'
import path from 'path'

config({ path: '.env.local' })
const out = process.argv[2]
if (!out || !process.env.MONGODB_URI) { console.error('usage: node scripts/backup-db.mjs <outDir>  (MONGODB_URI in .env.local)'); process.exit(1) }
fs.mkdirSync(out, { recursive: true })

const { MongoClient, BSON: { EJSON } } = mongoose.mongo
const client = await MongoClient.connect(process.env.MONGODB_URI)
const db = client.db()
const summary = { database: db.databaseName, takenAt: new Date().toISOString(), collections: {} }
for (const { name } of await db.listCollections({}, { nameOnly: true }).toArray()) {
  const docs = await db.collection(name).find({}).toArray()
  fs.writeFileSync(path.join(out, `${name}.json`), EJSON.stringify(docs, { relaxed: false }))
  summary.collections[name] = docs.length
}
fs.writeFileSync(path.join(out, '_summary.json'), JSON.stringify(summary, null, 2))
console.log(JSON.stringify(summary, null, 2))
await client.close()
